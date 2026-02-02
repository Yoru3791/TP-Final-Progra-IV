import { CommonModule } from '@angular/common';
import { Component, computed, effect, HostListener, inject, OnInit, signal } from '@angular/core';
import { ReclamoCardComponent } from '../../components/cards/reclamo-card/reclamo-card';
import { ReclamoService } from '../../services/reclamo-service';
import { MatDialog } from '@angular/material/dialog';
import { Reclamo } from '../../model/reclamo-response.model';
import { EstadoReclamo } from '../../enums/estadoReclamo.enum';
import { AdminGestionReclamoModal } from '../../components/modals/admin-gestion-reclamo-modal/admin-gestion-reclamo-modal';
import { InfoReclamoTooltipComponent } from '../../components/utils/info-reclamo-tooltip/info-reclamo-tooltip';
import { UiNotificationService } from '../../services/ui-notification-service';
import { Paginador } from '../../components/utils/paginador/paginador';

@Component({
  selector: 'app-admin-reclamos-page',
  imports: [
    CommonModule,
    ReclamoCardComponent,
    InfoReclamoTooltipComponent,
    Paginador
  ],
  templateUrl: './admin-reclamos-page.html',
  styleUrl: './admin-reclamos-page.css',
})
export class AdminReclamosPage {

  private reclamoService = inject(ReclamoService);
  private dialog = inject(MatDialog);
  private uiNotificationService = inject(UiNotificationService);

  reclamos = computed(() => this.reclamoService.adminReclamos());
  pageInfo = computed(() => this.reclamoService.adminPageInfo());

  openFiltro = false;
  filtrosDisponibles = [
    { label: 'Pendientes', value: EstadoReclamo.PENDIENTE },
    { label: 'En Proceso', value: EstadoReclamo.EN_PROCESO },
    { label: 'Resueltos', value: EstadoReclamo.RESUELTO },
    { label: 'Cerrados', value: EstadoReclamo.RECHAZADO },
  ];

  
  constructor() {
    effect(() => {
        this.reclamoService.filtroEstadoAdmin();
        this.reclamoService.fetchAdminReclamos(0, 10);
    });
  }

  onPageChange(page: number) {
    this.reclamoService.fetchAdminReclamos(page, 10);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Lógica Filtros ---
  toggleFiltro(event: MouseEvent) {
    this.openFiltro = !this.openFiltro;
    event.stopPropagation();
  }

  setFiltro(valor: EstadoReclamo | 'TODOS') {
    this.reclamoService.filtroEstadoAdmin.set(valor);
    this.openFiltro = false;
  }

  getLabelFiltroActual(): string {
    const actual = this.reclamoService.filtroEstadoAdmin();
    if (actual === 'TODOS') return 'Estado: Todos';
    const found = this.filtrosDisponibles.find((f) => f.value === actual);
    return found ? found.label : actual;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const inside = (event.target as HTMLElement).closest('.select-custom-wrapper');
    if (!inside) {
      this.openFiltro = false;
    }
  }

  // --- Gestión ---
  abrirGestion(reclamo: Reclamo) {
    const dialogRef = this.dialog.open(AdminGestionReclamoModal, {
      panelClass: 'form-modal',
      data: reclamo,
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.actualizarReclamo(reclamo.id, result.estado, result.respuesta);
      }
    });
  }

  actualizarReclamo(id: number, nuevoEstado: EstadoReclamo, respuesta: string) {
    this.reclamoService.actualizarEstado(id, nuevoEstado, respuesta).subscribe({
      next: () => {
        this.uiNotificationService.abrirSnackBarExito('Ticket actualizado.');
      },
      error: (err) => {
        this.uiNotificationService.abrirSnackBarError(err, 'Error al actualizar el ticket.');
      }
    });
  }
}
