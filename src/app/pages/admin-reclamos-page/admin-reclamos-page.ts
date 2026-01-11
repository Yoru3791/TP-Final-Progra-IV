import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ReclamoCardComponent } from '../../components/cards/reclamo-card/reclamo-card';
import { ReclamoService } from '../../services/reclamo-service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Reclamo } from '../../model/reclamo-response.model';
import { EstadoReclamo } from '../../enums/estadoReclamo.enum';
import { AdminGestionReclamoModal } from '../../components/modals/admin-gestion-reclamo-modal/admin-gestion-reclamo-modal';

@Component({
  selector: 'app-admin-reclamos-page',
  imports: [CommonModule, ReclamoCardComponent],
  templateUrl: './admin-reclamos-page.html',
  styleUrl: './admin-reclamos-page.css',
})
export class AdminReclamosPage implements OnInit {
  private reclamoService = inject(ReclamoService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  reclamos = signal<Reclamo[]>([]);
  loading = signal(true);
  filtroActual = signal<string>('TODOS');

  filtrosDisponibles = [
    { label: 'Todos', value: 'TODOS' },
    { label: 'Pendientes', value: EstadoReclamo.PENDIENTE },
    { label: 'En Proceso', value: EstadoReclamo.EN_PROCESO },
    { label: 'Resueltos', value: EstadoReclamo.RESUELTO },
    { label: 'Cerrados', value: EstadoReclamo.RECHAZADO }
  ];

  reclamosFiltrados = computed(() => {
    const filtro = this.filtroActual();
    const lista = this.reclamos();
    
    if (filtro === 'TODOS') return lista;
    return lista.filter(r => r.estado === filtro);
  });

  ngOnInit() {
    this.cargarReclamos();
  }

  cargarReclamos() {
    this.loading.set(true);
    this.reclamoService.getAllReclamos().subscribe({
      next: (data) => {
        this.reclamos.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando reclamos', err);
        this.snackBar.open('Error de conexión al cargar tickets', 'Cerrar');
        this.loading.set(false);
      }
    });
  }

  setFiltro(valor: string) {
    this.filtroActual.set(valor);
  }

  abrirGestion(reclamo: Reclamo) {
    const dialogRef = this.dialog.open(AdminGestionReclamoModal, {
      width: '60rem',
      data: reclamo,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.actualizarReclamo(reclamo.id, result.estado, result.respuesta);
      }
    });
  }

  actualizarReclamo(id: number, nuevoEstado: EstadoReclamo, respuesta: string) {
    this.reclamoService.actualizarEstado(id, nuevoEstado, respuesta).subscribe({
      next: () => {
        this.snackBar.open('Ticket actualizado y notificación enviada al usuario.', 'Cerrar', {
          duration: 4000,
          panelClass: 'snackbar-success',
          verticalPosition: 'bottom'
        });
        this.cargarReclamos();
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Error al actualizar el ticket.', 'Cerrar', {
          duration: 4000,
          panelClass: 'snackbar-error'
        });
      }
    });
  }
}
