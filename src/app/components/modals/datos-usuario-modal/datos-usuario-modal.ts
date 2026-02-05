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

    let numeroLimpio = this.data.telefono.replace(/\D/g, '');

    // Lógica Argentina: Si no empieza con 54, agregamos 549
    if (!numeroLimpio.startsWith('54')) {
      numeroLimpio = '549' + numeroLimpio;
    }

    return `https://wa.me/${numeroLimpio}`;
  }

  getMapsLink(): string {
    const query = `${this.data.direccion || ''}, ${this.data.ciudad || ''}`;
    if (!query.trim() || query === ', ') return '';

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  getGmailLink(): string {
    if (!this.data.email) return '';
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${this.data.email}`;
  }
}
