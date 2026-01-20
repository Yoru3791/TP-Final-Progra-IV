import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UsuarioResponse } from '../../../model/usuario-response.model';
import { FormAdminUserUpdatePassword } from '../../forms/form-admin-user-update-password/form-admin-user-update-password';

@Component({
  selector: 'app-admin-user-update-password-modal',
  imports: [FormAdminUserUpdatePassword],
  templateUrl: './admin-user-update-password-modal.html',
  styleUrl: './admin-user-update-password-modal.css',
})
export class AdminUserUpdatePasswordModal {
  usuario: UsuarioResponse = inject(MAT_DIALOG_DATA);

  private dialogRef = inject(MatDialogRef);

  cerrarModal() {
    this.dialogRef.close();
  }
}
