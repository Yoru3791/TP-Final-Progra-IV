import { computed, inject, Injectable, signal } from '@angular/core';
import { EmprendimientoResponse } from '../model/emprendimiento-response.model';
import { ViandaCantidadCarrito } from '../model/vianda-cantidad-carrito.model';
import { ViandaResponse } from '../model/vianda-response.model';
import { ViandaService } from './vianda-service';
import { firstValueFrom, forkJoin, map, tap } from 'rxjs';
import { PedidoRequest } from '../model/pedido-request.model';
import { AuthService } from './auth-service';
import { ViandaCantidadRequest } from '../model/vianda-cantidad-request.model';
import { PedidosService } from './pedido-service';
import { MatDialog } from '@angular/material/dialog';
import { CarritoModal } from '../components/modals/carrito-modal/carrito-modal';
import { UiNotificationService } from './ui-notification-service';
import { EmprendimientoService } from './emprendimiento-service';
import { ViandaCantidadLocalStorage } from '../model/vianda-cantidad-localstorage.model';

@Injectable({
  providedIn: 'root',
})
export class CarritoService {
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private emprendimientoService = inject(EmprendimientoService);
  private pedidoService = inject(PedidosService);
  private viandaService = inject(ViandaService);
  private uiNotificationService = inject(UiNotificationService);

  private _fechaEntrega = signal<string>('');
  public fechaEntrega = this._fechaEntrega.asReadonly();

  private _emprendimiento = signal<EmprendimientoResponse | null>(null);
  public emprendimiento = this._emprendimiento.asReadonly();

  private _viandaCantidades = signal<ViandaCantidadCarrito[]>([]);
  public viandaCantidades = this._viandaCantidades.asReadonly();

  static readonly CANTIDAD_MAXIMA = 10;

  public constructor() {
    this.cargarDeLocalStorage();
  }

  // Modificación de datos

  public async abrirCarrito(emprendimiento: EmprendimientoResponse) {
    if (this._emprendimiento()) {
      if (this._emprendimiento()!.id !== emprendimiento.id) {
        const confirmado = await firstValueFrom(
          this.uiNotificationService.abrirModalConfirmacion({
            titulo: 'Nuevo Carrito',
            texto:
              'El carrito actual corresponde a otro emprendimiento, ' +
              '¿querés vaciar el carrito y empezar desde cero?',
          })
        );

        if (confirmado) {
          this.vaciar(true);
          this.setEmprendimiento(emprendimiento);
        } else return;
      } else {
        this.eliminarViandasEnCero();
      }
    } else {
      this.setEmprendimiento(emprendimiento);
    }

    this.abrirModalCarrito();
  }

  public async agregarVianda(vianda: ViandaResponse): Promise<void> {
    if (!this._emprendimiento()) {
      this.setEmprendimiento(vianda.emprendimiento);
      this.guardarEmprendimientoEnLocalStorage();
    } else if (vianda.emprendimiento.id !== this._emprendimiento()?.id) {
      const confirmado = await firstValueFrom(
        this.uiNotificationService.abrirModalConfirmacion({
          titulo: 'Nuevo Carrito',
          texto:
            'El carrito actual contiene viandas de un emprendimiento distinto al de la vianda que querés agregar, ' +
            '¿querés vaciar el carrito y empezar desde cero?',
        })
      );

      if (confirmado) {
        this.vaciar(true);
        this.setEmprendimiento(vianda.emprendimiento);
      } else return;
    }

    const viandaCantidad = this.encontrarViandaCantidad(vianda);

    let agregada = false;

    if (viandaCantidad) {
      this._viandaCantidades.update((arr) => {
        if (viandaCantidad.cantidad < CarritoService.CANTIDAD_MAXIMA) {
          agregada = true;

          viandaCantidad.cantidad = this.acotarCantidadVianda(
            viandaCantidad.cantidad + 1
          );
        }

        return [...arr];
      });
    } else {
      agregada = true;

      this._viandaCantidades.update((arr) => [
        ...arr,
        { vianda: vianda, cantidad: 1 } as ViandaCantidadCarrito,
      ]);
    }

    if (agregada) {
      this.guardarViandasEnLocalStorage();
    }
  }

  public quitarVianda(vianda: ViandaResponse): void {
    const viandaCantidad = this.encontrarViandaCantidad(vianda);

    if (!viandaCantidad) return;

    let quitada = false;

    this._viandaCantidades.update((arr) => {
      if (viandaCantidad.cantidad > 0) {
        quitada = true;

        viandaCantidad.cantidad = this.acotarCantidadVianda(
          viandaCantidad.cantidad - 1
        );
      }

      return [...arr];
    });

    if (quitada) {
      this.guardarViandasEnLocalStorage();
    }
  }

  private acotarCantidadVianda(cantidad: number) {
    return Math.min(Math.max(0, cantidad), 10)
  }

  public eliminarViandasEnCero() {
    this._viandaCantidades.update((arr) =>
      arr.filter((viandaCantidad) => viandaCantidad.cantidad > 0)
    );

    this.guardarViandasEnLocalStorage();
  }

  // Devuelve `true` si se quitaron viandas del carrito, o si ocurre algún otro error
  public async revisarViandas() {
    if (!this.emprendimiento()) return true;

    const viandasEmprendimiento = await firstValueFrom(
      this.viandaService.getAllViandasDisponibles(this.emprendimiento()!.id)
    );

    let seQuitaronViandas = false;

    this._viandaCantidades.update((arr) =>
      arr.filter((viandaCantidad) => {
        const vianda = viandasEmprendimiento.find(
          (_vianda) => _vianda.id === viandaCantidad.vianda.id
        );

        if (!vianda || !vianda.estaDisponible) {
          seQuitaronViandas = true;
          return false;
        }

        return true;
      })
    );

    if (seQuitaronViandas) {
      this.uiNotificationService.abrirSnackBarError(null, 'Se eliminaron viandas no disponibles del carrito.');
    }

    return seQuitaronViandas;
  }

  public vaciar(anunciar: boolean) {
    this._fechaEntrega.set('');
    this._emprendimiento.set(null);
    this._viandaCantidades.set([]);

    this.guardarEnLocalStorage();

    if (anunciar) {
      this.uiNotificationService.abrirSnackBarExito('Carrito vaciado.');
    }
  }

  public setFechaEntrega(fecha: string) {
    this._fechaEntrega.set(fecha);
    this.guardarFechaEnLocalStorage();
  }

  public setEmprendimiento(emprendimiento: EmprendimientoResponse | null) {
    this._emprendimiento.set(emprendimiento);
    this.guardarEmprendimientoEnLocalStorage();
  }

  // Consulta de datos

  public cantidadViandasUnicas = computed(() => {
    let cantidad = 0;

    this.viandaCantidades().forEach((viandaCantidad) => {
      if (viandaCantidad.cantidad > 0) cantidad++;
    });

    return cantidad;
  });

  public cantidadViandaEnCarrito(vianda: ViandaResponse) {
    return computed(() => {
      if (this.noEsCliente()) return 0;

      const viandaCantidad = this.encontrarViandaCantidad(vianda);

      return viandaCantidad ? viandaCantidad.cantidad : 0;
    });
  }

  public cantidadViandaEnMinimo(vianda: ViandaResponse) {
    const viandaCantidad = this.encontrarViandaCantidad(vianda);

    return viandaCantidad ? viandaCantidad.cantidad <= 0 : true;
  }

  public cantidadViandaEnMaximo(vianda: ViandaResponse) {
    const viandaCantidad = this.encontrarViandaCantidad(vianda);

    return viandaCantidad ? viandaCantidad.cantidad >= CarritoService.CANTIDAD_MAXIMA : false;
  }

  private encontrarViandaCantidad(vianda: ViandaResponse) {
    return this._viandaCantidades().find(
      (viandaCantidad) => viandaCantidad.vianda.id === vianda.id
    );
  }

  public vacio() {
    return !this._viandaCantidades().some((viandaCantidad) => viandaCantidad.cantidad > 0);
  }

  private noEsCliente() {
    return this.authService.currentUserRole() !== 'CLIENTE';
  }

  // Pedidos

  public crearPedido() {
    // Posiblemente redundante
    this.eliminarViandasEnCero();
    if (this.vacio()) return;

    const pedido: PedidoRequest = {
      fechaEntrega: this.fechaEntrega()!,
      clienteId: this.authService.usuarioId()!,
      emprendimientoId: this.emprendimiento()!.id,
      viandas: this.viandaCantidades().map((viandaCantidad) => {
        return {
          viandaId: viandaCantidad.vianda.id,
          cantidad: viandaCantidad.cantidad,
        } as ViandaCantidadRequest;
      }),
    };

    return this.pedidoService.createPedido(pedido).pipe(
        tap(() => {
            this.vaciar(false);
        })
    );
  }

  // Modal, snackbar

  private abrirModalCarrito() {
    this.dialog.open(CarritoModal, {
    maxHeight: '90vh',
    maxWidth: '95vw',
    width: '90rem',
    height: 'auto',
    panelClass: 'form-modal',
    autoFocus: false,
    restoreFocus: false
    });
  }

  // Local Storage

  private itemFechaName: string = 'carrito-fecha_entrega';
  private itemEmprendimientoIdName: string = 'carrito-emprendimiento_id';
  private itemViandasName: string = 'carrito-viandas';

  private cargarDeLocalStorage() {
    const itemFecha = localStorage.getItem(this.itemFechaName);

    if (itemFecha) {
      this._fechaEntrega.set(JSON.parse(itemFecha));
    }

    const itemEmprendimientoId = localStorage.getItem(this.itemEmprendimientoIdName);

    if (itemEmprendimientoId) {
      const emprendimientoId = JSON.parse(itemEmprendimientoId);

      if (emprendimientoId) {
        this.emprendimientoService
          .getEmprendimientoById(emprendimientoId)
          .subscribe((emprendimiento) => this._emprendimiento.set(emprendimiento));
      }
    }

    const itemViandas = localStorage.getItem(this.itemViandasName);

    if (itemViandas) {
      forkJoin<ViandaCantidadCarrito[]>(
        JSON.parse(itemViandas).map((viandaCantidadLS: ViandaCantidadLocalStorage) =>
          this.viandaService.getViandaById(viandaCantidadLS.idVianda).pipe(
            map(
              (vianda) =>
                ({
                  vianda,
                  cantidad: this.acotarCantidadVianda(viandaCantidadLS.cantidad),
                } as ViandaCantidadCarrito)
            )
          )
        )
      ).subscribe((viandaCantidades: ViandaCantidadCarrito[]) =>
        this._viandaCantidades.set(
          viandaCantidades.filter(
            (viandaCantidad: ViandaCantidadCarrito) => viandaCantidad.vianda !== undefined
          )
        )
      );
    }
  }

  private guardarFechaEnLocalStorage() {
    localStorage.setItem(this.itemFechaName, JSON.stringify(this._fechaEntrega()));
  }

  private guardarEmprendimientoEnLocalStorage() {
    localStorage.setItem(
      this.itemEmprendimientoIdName,
      JSON.stringify(this._emprendimiento()?.id || null)
    );
  }

  private guardarViandasEnLocalStorage() {
    localStorage.setItem(
      this.itemViandasName,
      JSON.stringify(
        this._viandaCantidades().map((viandaCantidad) => {
          return {
            idVianda: viandaCantidad.vianda.id,
            cantidad: viandaCantidad.cantidad,
          } as ViandaCantidadLocalStorage;
        })
      )
    );
  }

  private guardarEnLocalStorage() {
    this.guardarFechaEnLocalStorage();
    this.guardarEmprendimientoEnLocalStorage();
    this.guardarViandasEnLocalStorage();
  }
}
