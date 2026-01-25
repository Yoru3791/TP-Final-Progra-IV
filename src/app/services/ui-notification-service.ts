import { inject, Injectable } from '@angular/core';
import { ConfirmarModalData } from '../model/confirmar-modal-data.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmarModal } from '../components/modals/confirmar-modal/confirmar-modal';
import { SnackbarData } from '../model/snackbar-data.model';
import { Snackbar } from '../components/modals/snackbar/snackbar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorDialogModal } from '../components/modals/error-dialog-modal/error-dialog-modal';
import { HttpErrorResponse } from '@angular/common/http';
import { SuccessDialogModal } from '../components/modals/success-dialog-modal/success-dialog-modal';

@Injectable({
  providedIn: 'root',
})
export class UiNotificationService {
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  public abrirModalConfirmacion(data: Partial<ConfirmarModalData>) {
    return this.dialog
      .open(ConfirmarModal, {
        data: data,
        disableClose: true,
        width: '40rem',
      })
      .afterClosed();
  }

  // Las siguientes dos funciones muestran `mensaje` al usuario e imprimen datos de `errorBackend` a la consola;
  // si `mensaje` es null, se usa `errorBackend` en su lugar

  public abrirModalError(errorBackend: HttpErrorResponse|null, mensaje: string|null = null): void {
    if (!mensaje && !errorBackend) return;

    if (errorBackend) {
      this.imprimirError(errorBackend);
    }

    if (!mensaje) {
      mensaje =
        (errorBackend instanceof HttpErrorResponse)
        ? (errorBackend.error?.error || errorBackend.error?.message || errorBackend.message)
        : errorBackend;
    }

    this.dialog.open(ErrorDialogModal, {
      autoFocus: false, // El mensaje es importante; evitar descartar el modal por accidente
      data: { message: mensaje },
      panelClass: 'modal-error',
      // Con restoreFocus, porque seguramente se regresa a un formulario
    });
  }

  public abrirSnackBarError(errorBackend: HttpErrorResponse|null, mensaje: string|null = null): void {
    if (!mensaje && !errorBackend) return;

    if (errorBackend) {
      this.imprimirError(errorBackend);
    }

    if (!mensaje) {
      mensaje =
        (errorBackend instanceof HttpErrorResponse)
        ? (errorBackend.error?.error || errorBackend.error?.message || errorBackend.message)
        : errorBackend;
    }

    this.snackBar.openFromComponent(Snackbar, {
      data: { iconName: 'warning', message: mensaje } as SnackbarData,
      duration: 5000,
      panelClass: 'snackbar-panel',
      verticalPosition: 'bottom',
    });
  }
  
  private imprimirError(error: HttpErrorResponse|string): void {
    const mensaje =
      (error instanceof HttpErrorResponse)
      ? `${error.status} (${error.statusText}): ${error.error?.error || error.error?.message || error.message}`
      : error;

    console.error(mensaje);
  }
  
  public abrirModalExito(mensaje: string): void {
    this.dialog.open(SuccessDialogModal, {
      autoFocus: false, // El mensaje es importante; evitar descartar el modal por accidente
      data: { message: mensaje },
      panelClass: 'modal-exito',
      restoreFocus: false, // Se completó la acción que hizo lanzar este modal
    });
  }
  
  public abrirSnackBarExito(mensaje: string): void {
    this.snackBar.openFromComponent(Snackbar, {
      data: { iconName: 'check_circle', message: mensaje } as SnackbarData,
      duration: 4000,
      panelClass: 'snackbar-panel',
      verticalPosition: 'bottom',
    });
  }
}
