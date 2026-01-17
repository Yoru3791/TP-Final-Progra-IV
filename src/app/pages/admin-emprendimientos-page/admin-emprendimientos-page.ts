import { Component, computed, effect, inject, signal } from '@angular/core';
import { EmprendimientoService } from '../../services/emprendimiento-service';
import { EmprendimientoAdminCard } from '../../components/cards/emprendimiento-admin-card/emprendimiento-admin-card';
import { EmprendimientoResponse } from '../../model/emprendimiento-response.model';
import { EmprendimientoAdminResponse } from '../../model/emprendimiento-admin-response.model';

@Component({
  selector: 'app-admin-emprendimientos-page',
  imports: [EmprendimientoAdminCard],
  templateUrl: './admin-emprendimientos-page.html',
  styleUrl: './admin-emprendimientos-page.css',
})
export class AdminEmprendimientosPage {
  private emprendimientoService = inject(EmprendimientoService);

  private nombreFilter = signal('');
  private duenoFilter = signal('');
  private ciudadFilter = signal('');

  private allEmprendimientos = this.emprendimientoService.allEmprendimientosAdmin;

  emprendimientos = computed<EmprendimientoAdminResponse[]>(() => {
    const nombre = this.nombreFilter().toLowerCase();
    const dueno = this.duenoFilter().toLowerCase();
    const ciudad = this.ciudadFilter().toLowerCase();

    return this.allEmprendimientos().filter((e) => {
      if (nombre && !e.nombreEmprendimiento.toLowerCase().includes(nombre)) {
        return false;
      }

      if (dueno) {
        const nombreDueno = e.dueno?.nombreCompleto?.toLowerCase() ?? '';
        const emailDueno = e.dueno?.email?.toLowerCase() ?? '';

        if (!nombreDueno.includes(dueno) && !emailDueno.includes(dueno)) {
          return false;
        }
      }

      if (ciudad) {
        const ciudadEmprendimiento = e.ciudad?.toLowerCase() ?? '';
        if (!ciudadEmprendimiento.includes(ciudad)) {
          return false;
        }
      }

      return true;
    });
  });

  constructor() {
    effect(() => this.emprendimientoService.fetchEmprendimientosAdmin());
  }

  onNombreInput(event: Event) {
    this.nombreFilter.set((event.target as HTMLInputElement).value.trim());
  }

  onDuenoInput(event: Event) {
    this.duenoFilter.set((event.target as HTMLInputElement).value.trim());
  }

  onCiudadInput(event: Event) {
    this.ciudadFilter.set((event.target as HTMLInputElement).value.trim());
  }
}
