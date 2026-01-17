import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormAdminUserUpdate } from '../../forms/form-admin-user-update/form-admin-user-update';
import { UsuarioResponse } from '../../../model/usuario-response.model';

@Component({
  selector: 'app-admin-user-update-modal',
  imports: [FormAdminUserUpdate],
  templateUrl: './admin-user-update-modal.html',
  styleUrl: './admin-user-update-modal.css',
})
export class AdminUserUpdateModal {
  usuario: UsuarioResponse = inject(MAT_DIALOG_DATA);

  private dialogRef = inject(MatDialogRef);

  cerrarModal() {
    this.dialogRef.close();
  }
}
