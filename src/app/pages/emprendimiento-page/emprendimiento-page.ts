import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { EmprendimientoService } from '../../services/emprendimiento-service';
import { ViandaService } from '../../services/vianda-service';
import { EmprendimientoInfo } from '../../components/cards/emprendimiento-info/emprendimiento-info';
import { ViandaCardDetallada } from '../../components/cards/vianda-card-detallada/vianda-card-detallada';
import { EmprendimientoFiltrosViandas } from '../../components/cards/emprendimiento-filtros-viandas/emprendimiento-filtros-viandas';
import { FiltrosViandas } from '../../model/filtros-viandas.model';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { ViandaResponse } from '../../model/vianda-response.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Snackbar } from '../../components/modals/snackbar/snackbar';
import { SnackbarData } from '../../model/snackbar-data.model';
import { MatDialog } from '@angular/material/dialog';
import { FormVianda } from '../../components/forms/form-vianda/form-vianda';
import { FormUpdateEmprendimiento } from '../../components/forms/form-emprendimiento-update/form-emprendimiento-update';
import { CarritoService } from '../../services/carrito-service';
import { FormViandaUpdate } from '../../components/forms/form-vianda-update/form-vianda-update';
import { ErrorDialogModal } from '../../components/modals/error-dialog-modal/error-dialog-modal';

export type PageMode = 'DUENO' | 'CLIENTE' | 'INVITADO' | 'PROHIBIDO' | 'CARGANDO';

@Component({
  selector: 'app-emprendimiento-page',
  imports: [EmprendimientoInfo, EmprendimientoFiltrosViandas, ViandaCardDetallada, RouterLink],
  templateUrl: './emprendimiento-page.html',
  styleUrl: './emprendimiento-page.css',
})
export class EmprendimientoPage {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private emprendimientoService = inject(EmprendimientoService);
  private viandaService = inject(ViandaService);
  private routeParams = toSignal(this.route.paramMap);
  private dialog = inject(MatDialog);
  private carritoService = inject(CarritoService);

  emprendimientoEditado = signal(0); //  Signal para forzar recarga de info de emprendimiento al editarlo
  viandaEditada = signal(0); //  Signal para forzar recarga de viandas y categorias al editar una vianda

  //  Uso signals para idEmprendimiento, emprendimiento y esDueno (si algo cambia, se actualiza todo automáticamente)
  idEmprendimiento = computed(() => {
    const id = this.routeParams()?.get('id');
    return id ? Number(id) : null;
  });

  emprendimiento = toSignal(
    combineLatest([
      toObservable(this.idEmprendimiento),
      toObservable(this.emprendimientoEditado),
    ]).pipe(
      map(([id, _]) => id),
      switchMap((id) => {
        if (!id) return of(null);
        return this.emprendimientoService.getEmprendimientoById(id).pipe(
          catchError((err) => {
            const backendMsg =
              err.error?.message ||
              err.error?.error ||
              'Error desconocido al cargar emprendimiento';

            console.error(backendMsg);

            this.dialog.open(ErrorDialogModal, {
              data: { message: backendMsg },
              panelClass: 'modal-error',
              autoFocus: false,
              restoreFocus: false,
            });

            return of(null);
          })
        );
      })
    )
  );

  modoVista = computed<PageMode>(() => {
    const emp = this.emprendimiento();
    if (!emp) return 'CARGANDO';
    const userId = this.authService.usuarioId();
    const userRole = this.authService.currentUserRole();

    if (userRole === 'ADMIN') {
      return 'DUENO';
    }

    if (userRole === 'DUENO') {
      return emp.dueno.id === userId ? 'DUENO' : 'PROHIBIDO';
    }

    if (userRole === 'CLIENTE') {
      return 'CLIENTE';
    }

    return 'INVITADO';
  });

  //  -------------------  Componente: emprendimiento-info -------------------

  handleAccionInfo() {
    const modo = this.modoVista();

    if (modo === 'DUENO') {
      this.abrirModalEditarEmprendimiento();
    } else if (modo === 'CLIENTE') {
      this.abrirModalCarrito();
    } else if (modo === 'INVITADO') {
      this.abrirSnackbarLoginRequerido();
    }
  }

  abrirModalEditarEmprendimiento() {
    this.dialog
      .open(FormUpdateEmprendimiento, {
        //  REVISAR errores que tira este modal (dentro del form)
        width: '100rem',
        panelClass: 'form-modal',
        autoFocus: false,
        restoreFocus: false,
        data: this.emprendimiento(),
      })
      .afterClosed()
      .subscribe((exito) => {
        if (exito) {
          this.emprendimientoEditado.update((v) => v + 1);
        }
      });
  }

  abrirModalCarrito() {
    const modo = this.modoVista();

    if (modo === 'CLIENTE') {
      this.carritoService.abrirCarrito(this.emprendimiento()!);
    }
  }

  abrirSnackbarLoginRequerido() {
    const snackbarData: SnackbarData = {
      message: 'Inicie sesión para realizar pedidos',
      iconName: 'error',
    };

    this.snackBar.openFromComponent(Snackbar, {
      duration: 3000,
      verticalPosition: 'bottom',
      panelClass: 'snackbar-panel',
      data: snackbarData,
    });
  }

  //  -------------------  Componente: emprendimiento-filtros-viandas -------------------

  //  Signal que contiene los filtros actuales
  filtrosSignal = signal<FiltrosViandas>({} as FiltrosViandas);

  // Uso un computed para agrupar todas las cosas que "disparan" una recarga
  private triggerViandas = computed(() => {
    return {
      id: this.idEmprendimiento(),
      filtros: this.filtrosSignal(),
      modo: this.modoVista(),
    };
  });

  // Convierto el trigger en un Observable (llama a la API y devuelve las viandas que muestro en pantalla)
  viandas = toSignal(
    toObservable(this.triggerViandas).pipe(
      switchMap(({ id, filtros, modo }) => {
        if (!id || modo === 'CARGANDO' || modo === 'PROHIBIDO') {
          return of([] as ViandaResponse[]);
        }

        let request$: Observable<ViandaResponse[]>;

        switch (modo) {
          case 'DUENO':
            request$ = this.viandaService.getViandasDueno(id, filtros);
            break;
          case 'CLIENTE':
            request$ = this.viandaService.getViandasCliente(id, filtros);
            break;
          case 'INVITADO':
            request$ = this.viandaService.getViandasPublico(id, filtros);
            break;
          default:
            return of([] as ViandaResponse[]);
        }

        return request$.pipe(
          map((viandas) => {
            let resultado = viandas;

            // Ordena las viandas para mostrar las disponibles primero (solo afecta al dueño)
            return resultado.sort((a, b) => {
              if (a.estaDisponible === b.estaDisponible) {
                return 0;
              }
              return a.estaDisponible ? -1 : 1;
            });
          }),
          catchError((err) => {
            //  Ya está contemplado lo que se muestra cuando no hay viandas (lo dejo como warning por las dudas)
            console.warn('Error cargando viandas (posiblemente sin resultados)', err);
            return of([] as ViandaResponse[]);
          })
        );
      })
    ),
    { initialValue: [] as ViandaResponse[] }
  );

  private triggerViandasTotales = computed(() => {
    this.viandaEditada();
    return {
      id: this.idEmprendimiento(),
      modo: this.modoVista(),
    };
  });

  //  Uso viandasTotales para tener las categorías disponibles en los filtros
  //  (Lo necesito porque las categorías se obtienen dinámicamente)
  viandasTotales = toSignal(
    toObservable(this.triggerViandasTotales).pipe(
      switchMap(({ id, modo }) => {
        if (!id || modo === 'CARGANDO' || modo === 'PROHIBIDO') {
          return of([] as ViandaResponse[]);
        }

        let request$: Observable<ViandaResponse[]>;

        switch (modo) {
          case 'DUENO':
            request$ = this.viandaService.getViandasDueno(id);
            break;
          case 'CLIENTE':
            request$ = this.viandaService.getViandasCliente(id);
            break;
          case 'INVITADO':
            request$ = this.viandaService.getViandasPublico(id);
            break;
          default:
            return of([] as ViandaResponse[]);
        }

        return request$.pipe(catchError(() => of([] as ViandaResponse[])));
      })
    ),
    { initialValue: [] as ViandaResponse[] }
  );

  onFiltrosChanged(nuevosFiltros: FiltrosViandas) {
    this.filtrosSignal.set(nuevosFiltros);
  }

  //  -------------------  Componente: vianda-card-detallada -------------------

  abrirViandaForm() {
    const emprendimientoId = this.idEmprendimiento();
    this.dialog
      .open(FormVianda, {
        data: { idEmprendimiento: emprendimientoId },
        width: '100rem',
        panelClass: 'form-modal',
        autoFocus: false,
        restoreFocus: false,
      })
      .afterClosed()
      .subscribe((exito) => {
        if (exito) {
          this.viandaEditada.update((v) => v + 1);
          this.filtrosSignal.update((f) => ({ ...f }));
        }
      });
  }

  obtenerCantidadEnCarrito(vianda: ViandaResponse) {
    return this.carritoService.cantidadViandaEnCarrito(vianda);
  }

  handleAgregarVianda(vianda: ViandaResponse) {
    const modo = this.modoVista();

    if (modo === 'INVITADO') {
      this.abrirSnackbarLoginRequerido();
      return;
    }

    if (modo === 'CLIENTE') {
      this.carritoService.agregarVianda(vianda);
    }
  }

  handleQuitarVianda(vianda: ViandaResponse) {
    const modo = this.modoVista();

    if (modo === 'INVITADO') {
      this.abrirSnackbarLoginRequerido();
      return;
    }

    if (modo === 'CLIENTE') {
      this.carritoService.quitarVianda(vianda);
    }
  }

  handleEditarVianda(vianda: ViandaResponse) {
    this.dialog
      .open(FormViandaUpdate, {
        data: { vianda: vianda },
        width: '100rem',
        panelClass: 'form-modal',
        autoFocus: false,
        restoreFocus: false,
      })
      .afterClosed()
      .subscribe((exito) => {
        if (exito) {
          this.viandaEditada.update((v) => v + 1);
          this.filtrosSignal.update((f) => ({ ...f }));
        }
      });
  }

  filtrosActivos(): boolean {
    const f = this.filtrosSignal();
    return !!(
      (f.categoria && f.categoria.trim() !== '') ||
      (f.nombreVianda && f.nombreVianda.trim() !== '') ||
      f.esSinTacc ||
      f.esVegano ||
      f.esVegetariano ||
      f.precioMin ||
      f.precioMax
    );
  }
}
