import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { NotificacionService } from '../../../services/notificacion-service';
import { NotificacionSingleCardComponent } from '../notificacion-single-card/notificacion-single-card';
import { DateRangePickerComponent } from '../../utils/date-range-picker/date-range-picker'; 
import { Paginador } from '../../utils/paginador/paginador';

type EstadoFiltro = 'TODAS' | 'NO_LEIDAS' | 'LEIDAS';

@Component({
  selector: 'app-notificaciones-card',
  imports: [
    NotificacionSingleCardComponent,
    DateRangePickerComponent,
    Paginador],
  templateUrl: './notificaciones-card.html',
  styleUrl: './notificaciones-card.css',
})
export class NotificacionesCard implements OnInit {
  public notiService = inject(NotificacionService);

  filtroEstado = signal<EstadoFiltro>('TODAS');

  pageInfo = computed(() => this.notiService.pageInfo());

  constructor() {
      effect(() => {
          this.notiService.filtroDesde();
          this.notiService.filtroHasta();
          this.notiService.filtroLeida();
          
          this.notiService.fetchNotificaciones(0, 10);
      });
  }

  ngOnInit() {
    this.notiService.resetFiltros(); 
    this.notiService.fetchNotificaciones(0, 10);
  }

  setFiltro(estado: EstadoFiltro) {
    this.filtroEstado.set(estado);
    
    if (estado === 'NO_LEIDAS') {
        this.notiService.filtroLeida.set(false);
    } else if (estado === 'LEIDAS') {
        this.notiService.filtroLeida.set(true);
    } else {
        this.notiService.filtroLeida.set(null);
    }
  }

  onFechasSeleccionadas(fechas: { desde: Date; hasta: Date } | null) {
    if (!fechas) {
      this.notiService.filtroDesde.set(null);
      this.notiService.filtroHasta.set(null);
      return;
    }

    const desde = fechas.desde.toISOString().split('T')[0];
    const hasta = fechas.hasta.toISOString().split('T')[0];

    this.notiService.filtroDesde.set(desde);
    this.notiService.filtroHasta.set(hasta);
  }

  onPageChange(page: number) {
      this.notiService.fetchNotificaciones(page, 10);
  }
}
