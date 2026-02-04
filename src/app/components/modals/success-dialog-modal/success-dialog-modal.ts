import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface SuccessDialogData {
  message: string;
}

@Component({
  selector: 'app-success-dialog-modal',
  imports: [
    MatDialogClose,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './success-dialog-modal.html',
  styleUrl: './success-dialog-modal.css',
})
export class SuccessDialogModal {
  data: SuccessDialogData = inject(MAT_DIALOG_DATA);
}
