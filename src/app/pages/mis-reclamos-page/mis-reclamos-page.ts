import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReclamoCardComponent } from '../../components/cards/reclamo-card/reclamo-card';
import { EstadoReclamo } from '../../enums/estadoReclamo.enum';
import { ReclamoService } from '../../services/reclamo-service';
import { Reclamo } from '../../model/reclamo-response.model';
import { InfoReclamoTooltipComponent } from '../../components/utils/info-reclamo-tooltip/info-reclamo-tooltip';
import { UiNotificationService } from '../../services/ui-notification-service';
import { Paginador } from '../../components/utils/paginador/paginador';

@Component({
  selector: 'app-mis-reclamos-page',
  imports: [
    CommonModule,
    RouterLink,
    ReclamoCardComponent,
    InfoReclamoTooltipComponent,
    Paginador
  ],
  templateUrl: './mis-reclamos-page.html',
  styleUrl: './mis-reclamos-page.css',
})
export class MisReclamosComponent {

  private reclamoService = inject(ReclamoService);
  private elementRef = inject(ElementRef);

  reclamos = computed(() => this.reclamoService.misReclamos());
  pageInfo = computed(() => this.reclamoService.misReclamosPageInfo());

  openFiltro = false;
  filtrosDisponibles = [
    { label: 'Pendientes', value: EstadoReclamo.PENDIENTE },
    { label: 'En Proceso', value: EstadoReclamo.EN_PROCESO },
    { label: 'Resueltos', value: EstadoReclamo.RESUELTO },
    { label: 'Cerrados', value: EstadoReclamo.RECHAZADO },
  ];

  constructor() {
      effect(() => {
          this.reclamoService.filtroEstadoCliente();
          this.reclamoService.fetchMisReclamos(0, 10);
      });
  }

  onPageChange(page: number) {
      this.reclamoService.fetchMisReclamos(page, 10);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  // --- Filtros UI ---
  toggleFiltro(event: Event) {
    event.stopPropagation();
    this.openFiltro = !this.openFiltro;
  }

  setFiltro(valor: EstadoReclamo | 'TODOS') {
    this.reclamoService.filtroEstadoCliente.set(valor);
    this.openFiltro = false;
  }

  getLabelFiltroActual(): string {
    const actual = this.reclamoService.filtroEstadoCliente();
    if (actual === 'TODOS') return 'Estado: Todos';
    const filtro = this.filtrosDisponibles.find((f) => f.value === actual);
    return filtro ? filtro.label : 'Todos';
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.openFiltro = false;
    }
  }
}
