import { Component, Inject, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PedidoResponse } from '../../../model/pedido-response.model';
import { DatePipe, CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth-service';
import { PedidosService } from '../../../services/pedido-service';
import { PedidoUpdateRequest } from '../../../model/pedido-update-request.model';
import { EstadoPedido } from '../../../enums/estadoPedido.enum';
import { UsuarioResponse } from '../../../model/usuario-response.model';
import { FormsModule } from '@angular/forms';
import { DatosUsuarioModal } from '../datos-usuario-modal/datos-usuario-modal';
import { A11yModule } from '@angular/cdk/a11y';
import { UiNotificationService } from '../../../services/ui-notification-service';
import { DatosContactoModalData } from '../../../model/datos-modal-data.model';
import { EmprendimientoAdminResponse } from '../../../model/emprendimiento-admin-response.model';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-pedido-extended-modal',
  imports: [
    MatButtonModule,
    MatIconModule,
    DatePipe,
    FormsModule,
    CommonModule,
    A11yModule,
    MatDialogModule,
    MatDatepickerModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-AR' },
    provideNativeDateAdapter()
  ],
  templateUrl: './pedido-extended-modal.html',
  styleUrl: './pedido-extended-modal.css',
})
export class PedidoExtendedModal implements OnInit {
  EstadoPedido = EstadoPedido;
  estadosPosibles = Object.values(EstadoPedido);

  private authService = inject(AuthService);
  private pedidosService = inject(PedidosService);
  private dialogRef = inject(MatDialogRef);
  private dialog = inject(MatDialog);
  private uiNotificationService = inject(UiNotificationService);

  public role = this.authService.currentUserRole;

  nuevaFechaSeleccionada: Date | null = null;
  minDate: Date | null = null;
  esDemasiadoTarde: boolean = false;
  estadoAdminSeleccionado!: EstadoPedido;

  constructor(@Inject(MAT_DIALOG_DATA) public pedido: PedidoResponse) {}

  get fechaEliminacionEmprendimiento(): string | null {
    const emp = this.pedido.emprendimiento as unknown as EmprendimientoAdminResponse;
    return emp.fechaEliminacion || null;
  }

  ngOnInit(): void {
    this.calcularValidacionesFecha();
    this.estadoAdminSeleccionado = this.pedido.estado;
  }

  calcularValidacionesFecha() {
    if (this.role() !== 'CLIENTE') return;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const [year, month, day] = this.pedido.fechaEntrega.split('-').map(Number);
    const fechaEntregaActual = new Date(year, month - 1, day);
    fechaEntregaActual.setHours(0, 0, 0, 0);

    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);

    if (fechaEntregaActual.getTime() === manana.getTime()) {
      this.esDemasiadoTarde = true;
    }

    const fechaMinimaPolitica = new Date(hoy);
    fechaMinimaPolitica.setDate(hoy.getDate() + 2);

    if (fechaMinimaPolitica > fechaEntregaActual) {
      this.minDate = fechaMinimaPolitica;
    } else {
      this.minDate = fechaEntregaActual;
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  cambiarEstado(estadoNuevo: EstadoPedido) {
    const estadoActual = this.pedido.estado;

    if (this.role() === 'CLIENTE') {
      if (estadoNuevo !== EstadoPedido.CANCELADO || estadoActual !== EstadoPedido.PENDIENTE) {
        this.uiNotificationService.abrirModalError(null,'No tenés permiso para cambiar este estado.');
        return;
      }
    }

    if (this.role() === 'DUENO') {
      let permitido = false;
      if (
        estadoActual === EstadoPedido.PENDIENTE &&
        (estadoNuevo === EstadoPedido.ACEPTADO || estadoNuevo === EstadoPedido.RECHAZADO)
      ) {
        permitido = true;
      } else if (estadoActual === EstadoPedido.ACEPTADO && estadoNuevo === EstadoPedido.ENTREGADO) {
        permitido = true;
      }

      if (!permitido) {
        this.uiNotificationService.abrirModalError(null, 'Cambio de estado del pedido inválido.');
        return;
      }
    }

    const body: PedidoUpdateRequest = {
      estado: estadoNuevo,
      fechaEntrega: this.pedido.fechaEntrega,
    };

    this.sendUpdate(body);
  }

  actualizarEstadoAdmin() {
    if (this.estadoAdminSeleccionado === this.pedido.estado) {
      return;
    }

    const body: PedidoUpdateRequest = {
      estado: this.estadoAdminSeleccionado,
      fechaEntrega: this.pedido.fechaEntrega,
    };

    this.sendUpdate(body);
  }

  cambiarFechaEntrega() {
    const fechaDate = this.nuevaFechaSeleccionada;

    if (this.role() !== 'CLIENTE') {
      this.uiNotificationService.abrirModalError(null, 'Solo el cliente puede modificar la fecha de entrega.');
      return;
    }

    if (this.esDemasiadoTarde) {
      this.uiNotificationService.abrirModalError(null, 'No podés cambiar el pedido un día antes de la entrega.');
      return;
    }

    if (!fechaDate) {
      this.uiNotificationService.abrirModalError(null, 'Seleccioná una fecha.');
      return;
    }

    const fechaStr = this.formatDate(fechaDate);

    if (fechaStr < this.pedido.fechaEntrega) {
      this.uiNotificationService.abrirModalError(null, 'La nueva fecha no puede ser anterior a la fecha original.');
      return;
    }

    const body: PedidoUpdateRequest = { fechaEntrega: fechaStr };
    this.sendUpdate(body);
  }

  private sendUpdate(body: PedidoUpdateRequest) {
    this.pedidosService.updatePedido(this.pedido.id, body).subscribe({
      next: () => {
        this.uiNotificationService.abrirSnackBarExito('Pedido actualizado exitosamente.');
        setTimeout(() => this.pedidosService.fetchPedidos(), 500);
        this.dialogRef.close({ updated: true });
      },
      error: (err) => {
        this.uiNotificationService.abrirModalError(err);
      },
    });
  }

  verDatosUsuario(usuario: UsuarioResponse) {
    const data: DatosContactoModalData = {
      nombre: usuario.nombreCompleto,
      email: usuario.email,
      telefono: usuario.telefono,
      imagenUrl: usuario.imagenUrl,
      direccion: 'No disponible', 
      ciudad: 'No disponible'
    };

    this.dialog.open(DatosUsuarioModal, {
      data: data,
      width: '95%',
      maxWidth: '60rem',
      autoFocus: false,
      restoreFocus: false,
    });
  }

  contactarCliente() {
    const c = this.pedido.cliente;
    const data: DatosContactoModalData = {
      nombre: c.nombreCompleto,
      email: c.email,
      telefono: c.telefono,
      imagenUrl: c.imagenUrl,
      direccion: 'No disponible', 
      ciudad: 'No disponible'
    };
    this.dialog.open(DatosUsuarioModal, {
      data,
      width: '95%',
      maxWidth: '60rem',
      autoFocus: false,
      restoreFocus: false,
    });
  }

  contactarLocal() {
    const dueno = this.pedido.emprendimiento.dueno;
    const emprendimiento = this.pedido.emprendimiento;
    const data: DatosContactoModalData = {
      nombre: dueno.nombreCompleto,
      email: dueno.email,
      imagenUrl: dueno.imagenUrl,
      telefono: emprendimiento.telefono,
      direccion: emprendimiento.direccion,
      ciudad: emprendimiento.ciudad
    };
    this.dialog.open(DatosUsuarioModal, {
      data,
      width: '95%',
      maxWidth: '60rem',
      autoFocus: false,
      restoreFocus: false,
    });
  }

  cerrar() {
    this.dialogRef.close();
  }
}
