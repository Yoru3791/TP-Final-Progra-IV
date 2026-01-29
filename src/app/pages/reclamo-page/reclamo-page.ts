import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormReclamo } from '../../components/forms/form-reclamo/form-reclamo';
import { ReclamoService } from '../../services/reclamo-service';
import { ReclamoRequest } from '../../model/reclamo-request.model';
import { UiNotificationService } from '../../services/ui-notification-service';

@Component({
  selector: 'app-reclamo-page',
  imports: [CommonModule, FormReclamo],
  templateUrl: './reclamo-page.html',
  styleUrl: './reclamo-page.css',
})
export class ReclamoPage {
  private reclamoService = inject(ReclamoService);
  private uiNotificationService = inject(UiNotificationService);

  @ViewChild(FormReclamo) formComponent!: FormReclamo;

  enviarReporte(reclamo: ReclamoRequest) {
    this.reclamoService.enviarReclamo(reclamo).subscribe({
      next: () => {
        this.uiNotificationService.abrirSnackBarExito('¡Reclamo enviado! Revisá tu correo.');
        
        this.formComponent.resetForm();
      },
      error: (err) => {
        this.uiNotificationService.abrirModalError(err);
      }
    });
  }
}
