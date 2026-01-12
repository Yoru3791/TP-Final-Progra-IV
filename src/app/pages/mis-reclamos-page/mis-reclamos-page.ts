import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReclamoCardComponent } from '../../components/cards/reclamo-card/reclamo-card';
import { EstadoReclamo } from '../../enums/estadoReclamo.enum';
import { ReclamoService } from '../../services/reclamo-service';
import { Reclamo } from '../../model/reclamo-response.model';
import { InfoReclamoTooltipComponent } from '../../components/utils/info-reclamo-tooltip/info-reclamo-tooltip';

@Component({
  selector: 'app-mis-reclamos-page',
  imports: [CommonModule, RouterLink, ReclamoCardComponent,InfoReclamoTooltipComponent],
  templateUrl: './mis-reclamos-page.html',
  styleUrl: './mis-reclamos-page.css',
})
export class MisReclamosComponent implements OnInit {
  private reclamoService = inject(ReclamoService);

  reclamos = signal<Reclamo[]>([]);
  loading = signal(true);
  
  filtroActual = signal<string>('TODOS');

  reclamosFiltrados = computed(() => {
    const filtro = this.filtroActual();
    const lista = this.reclamos();

    if (filtro === 'TODOS') {
      return lista;
    }
    return lista.filter(r => r.estado === filtro);
  });

  filtrosDisponibles = [
    { label: 'Todos', value: 'TODOS' },
    { label: 'Pendientes', value: EstadoReclamo.PENDIENTE },
    { label: 'En Proceso', value: EstadoReclamo.EN_PROCESO },
    { label: 'Resueltos', value: EstadoReclamo.RESUELTO },
    { label: 'Cerrados', value: EstadoReclamo.RECHAZADO }
  ];

  ngOnInit() {
    this.cargarReclamos();
  }

  cargarReclamos() {
    this.reclamoService.getMisReclamos().subscribe({
      next: (data) => {
        this.reclamos.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  setFiltro(valor: string) {
    this.filtroActual.set(valor);
  }
}
