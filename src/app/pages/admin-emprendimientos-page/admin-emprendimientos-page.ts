import { Component, computed, effect, inject, signal } from '@angular/core';
import { EmprendimientoService } from '../../services/emprendimiento-service';
import { EmprendimientoAdminCard } from '../../components/cards/emprendimiento-admin-card/emprendimiento-admin-card';
import { EmprendimientoAdminResponse } from '../../model/emprendimiento-admin-response.model';
import { Paginador } from '../../components/utils/paginador/paginador';

@Component({
  selector: 'app-admin-emprendimientos-page',
  imports: [EmprendimientoAdminCard, Paginador],
  templateUrl: './admin-emprendimientos-page.html',
  styleUrl: './admin-emprendimientos-page.css',
})
export class AdminEmprendimientosPage {
  public emprendimientoService = inject(EmprendimientoService);

  emprendimientos = computed(() => this.emprendimientoService.allEmprendimientosAdmin());
  pageInfo = computed(() => this.emprendimientoService.adminPageInfo());

  constructor() {
    effect(() => {
        this.emprendimientoService.adminFiltroNombre();
        this.emprendimientoService.adminFiltroCiudad();
        this.emprendimientoService.adminFiltroDueno();
        this.emprendimientoService.adminSoloEliminados();

        this.emprendimientoService.fetchEmprendimientosAdmin(0, 10);
    });
  }

  onPageChange(page: number) {
    this.emprendimientoService.fetchEmprendimientosAdmin(page, 10);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onNombreInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.emprendimientoService.adminFiltroNombre.set(val.trim());
  }

  onCiudadInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.emprendimientoService.adminFiltroCiudad.set(val.trim());
  }

  onDuenoInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.emprendimientoService.adminFiltroDueno.set(val.trim());
  }

  onToggleEliminados(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.emprendimientoService.adminSoloEliminados.set(isChecked);
  }
}
