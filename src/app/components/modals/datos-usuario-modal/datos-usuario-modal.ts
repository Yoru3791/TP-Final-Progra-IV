import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth-service';
import { DatosContactoModalData } from '../../../model/datos-modal-data.model';

@Component({
  selector: 'app-datos-usuario-modal',
  imports: [],
  templateUrl: './datos-usuario-modal.html',
  styleUrl: './datos-usuario-modal.css',
})
export class DatosUsuarioModal {
  private dialogRef = inject(MatDialogRef<DatosUsuarioModal>);
  private authService = inject(AuthService);

  public role = this.authService.currentUserRole;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DatosContactoModalData) {}

  cerrar() {
    this.dialogRef.close();
  }

  getWhatsappLink(): string {
    if (!this.data.telefono) return '';

    // 1. Quitamos todo lo que no sea número
    let numeroLimpio = this.data.telefono.replace(/\D/g, '');

    // 2. Lógica para Argentina:
    // Si el número NO empieza con 54 (código país), asumimos que es local y le pegamos el 549
    if (!numeroLimpio.startsWith('54')) {
      numeroLimpio = '549' + numeroLimpio;
    }

    return `https://wa.me/${numeroLimpio}`;
  }

  getMapsLink(): string {
    // Concatenamos dirección y ciudad para mejor precisión
    const query = `${this.data.direccion || ''}, ${this.data.ciudad || ''}`;
    if (!query.trim() || query === ', ') return '';

    // encodeURIComponent convierte espacios y tildes a formato URL
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  getGmailLink(): string {
    if (!this.data.email) return '';

    // fs=1 fuerza pantalla completa (es necesario para que funcione bien en pestañas nuevas).
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${this.data.email}`;
  }
}
