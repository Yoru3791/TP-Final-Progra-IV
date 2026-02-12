import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ErrorDialogData } from '../../../model/errorMessage.model';

@Component({
  selector: 'app-error-dialog-modal',
  imports: [
    MatDialogClose,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './error-dialog-modal.html',
  styleUrl: './error-dialog-modal.css',
})
export class ErrorDialogModal {
  data: ErrorDialogData = inject(MAT_DIALOG_DATA);
}
