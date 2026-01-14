import { Component, inject } from '@angular/core';
import { FormAdminUserCreate } from '../../forms/form-admin-user-create/form-admin-user';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-admin-user-create-modal',
  imports: [FormAdminUserCreate],
  templateUrl: './admin-user-create-modal.html',
  styleUrl: './admin-user-create-modal.css',
})
export class AdminUserCreateModal {
  private dialogRef = inject(MatDialogRef);

  cerrarModal() {
    this.dialogRef.close();
  }
}
