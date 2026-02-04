import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CarritoService } from '../../../services/carrito-service';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ViandaResponse } from '../../../model/vianda-response.model';
import { UiNotificationService } from '../../../services/ui-notification-service';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';


@Component({
  selector: 'app-carrito-modal',
  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    MatDialogModule,
    MatDatepickerModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-AR' },
    provideNativeDateAdapter()
  ],
  templateUrl: './carrito-modal.html',
  styleUrl: './carrito-modal.css',
})
export class CarritoModal implements OnInit {
  private carritoService = inject(CarritoService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private dialogRef = inject(MatDialogRef<CarritoModal>);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private uiNotificationService = inject(UiNotificationService);

  public emprendimiento = this.carritoService.emprendimiento;
  public viandaCantidades = this.carritoService.viandaCantidades;

  minDate: Date = new Date();
  public modalBloqueado = false;

  private validadorFecha = (control: AbstractControl): ValidationErrors | null => {
    const fechaIngresada: Date = control.value;

    if (!fechaIngresada) return { invalidValue: true };

    const fechaHoy = new Date();
    fechaHoy.setHours(0, 0, 0, 0);
    
    const fechaComparar = new Date(fechaIngresada);
    fechaComparar.setHours(0, 0, 0, 0);

    const fechaMinima = new Date(fechaHoy);
    fechaMinima.setDate(fechaHoy.getDate() + 2); // Regla de 48hs

    return fechaComparar < fechaMinima ? { invalidValue: true } : null;
  };

  formFecha = this.formBuilder.group({
    fechaEntrega: [null as Date | null, [Validators.required, this.validadorFecha]],
  });

  private calcularMinDate() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaMinima = new Date(hoy);
    fechaMinima.setDate(hoy.getDate() + 2); 
    this.minDate = fechaMinima;
  }

  // Utilidad para convertir Date a String YYYY-MM-DD para el servicio
  private formatDateToString(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  ngOnInit(): void {
    this.calcularMinDate();

    const fechaStr = this.carritoService.fechaEntrega();
    if (fechaStr) {
      const [y, m, d] = fechaStr.split('-').map(Number);
      const fechaObj = new Date(y, m - 1, d);
      this.formFecha.patchValue({ fechaEntrega: fechaObj });
    }

    this.formFecha.valueChanges.subscribe((value) => {
      if (this.formFecha.valid && value.fechaEntrega) {
        const fechaStr = this.formatDateToString(value.fechaEntrega);
        this.carritoService.setFechaEntrega(fechaStr);
      }
    });
  }

  public sumarVianda(vianda: ViandaResponse) {
    this.carritoService.agregarVianda(vianda);
  }

  public restarVianda(vianda: ViandaResponse) {
    this.carritoService.quitarVianda(vianda);
  }

  public cantidadViandaEnMinimo(vianda: ViandaResponse) {
    return this.carritoService.cantidadViandaEnMinimo(vianda);
  }

  public cantidadViandaEnMaximo(vianda: ViandaResponse) {
    return this.carritoService.cantidadViandaEnMaximo(vianda);
  }

  public vacio() {
    return this.carritoService.vacio();
  }

  public get total() {
    return this.viandaCantidades().reduce(
      (total, viandaCantidad) => (total += viandaCantidad.vianda.precio * viandaCantidad.cantidad),
      0
    );
  }

  public async cancelarPedido() {
    this.modalBloqueado = true;
    let texto = '¿Estás seguro que querés cancelar el pedido?';
    if (!this.carritoService.vacio()) {
      texto = texto.concat(' El carrito se va a vaciar.');
    }

    const confirmado = await firstValueFrom(
      this.uiNotificationService.abrirModalConfirmacion({
        titulo: 'Cancelar Pedido',
        texto: texto,
        critico: false,
      })
    );

    setTimeout(() => {
      if (confirmado) {
        this.carritoService.vaciar(true);
        this.cerrar();
      }
      this.modalBloqueado = false;
      this.changeDetectorRef.detectChanges();
    }, 0);
  }

  public async confirmarPedido() {
    this.modalBloqueado = true;

    if (this.formFecha.valid) {
      const errorRevision = await this.carritoService.revisarViandas();

      if (!errorRevision) {
        this.carritoService.eliminarViandasEnCero();

        const confirmado = await firstValueFrom(
          this.uiNotificationService.abrirModalConfirmacion({
            titulo: 'Confirmar Pedido',
            texto: '¿Estás seguro que querés confirmar el pedido?',
          })
        );

        setTimeout(() => {
          if (confirmado) {
            const empId = this.carritoService.emprendimiento()?.id;
            const observablePedido = this.carritoService.crearPedido();
            
            if (observablePedido) {
              observablePedido.subscribe({
                next: (pedidoCreado) => {
                  this.cerrar();
                  this.router.navigate(['/resultado-pedido'], {
                    state: {
                      resultado: 'exito',
                      pedidoId: pedidoCreado.id,
                      emprendimientoId: empId
                    }
                  });
                },
                error: (err) => {
                  this.cerrar();
                  this.router.navigate(['/resultado-pedido'], {
                    state: { 
                      resultado: 'error',
                      emprendimientoId: empId
                    }
                  });
                }
              });
            } else {
              this.modalBloqueado = false;
            }
          } else {
            this.modalBloqueado = false;
          }
          this.changeDetectorRef.detectChanges();
        }, 0);
        return;
      }
    } else {
      this.formFecha.markAllAsDirty();
      this.formFecha.markAllAsTouched();
    }
    this.modalBloqueado = false;
  }

  public cerrar() {
    this.dialogRef.close();
  }
}
