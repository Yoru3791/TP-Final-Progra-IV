import { inject, Injectable, signal, effect } from '@angular/core';
import { CityFilterService } from './city-filter-service';
import { EmprendimientoResponse } from '../model/emprendimiento-response.model';
import { EmprendimientoService } from './emprendimiento-service';

@Injectable({ providedIn: 'root' })
export class SearchService {
  termino = signal('');
  mensaje = signal('');
  loading = signal(false);
  resultados = signal<EmprendimientoResponse[]>([]);

  private emprendimientosService = inject(EmprendimientoService);
  private cityFilter = inject(CityFilterService);

  constructor() {
    // Recalcular resultados cuando cambia el término o la ciudad
    effect(() => {
      const term = this.termino().toLowerCase();
      const todos = this.emprendimientosService.emprendimientos(); // ya filtrados por ciudad
      if (!term.trim()) {
        this.resultados.set([]);
        this.mensaje.set('');
        return;
      }

      const filtrados = todos.filter((e) => e.nombreEmprendimiento.toLowerCase().includes(term));
      this.resultados.set(filtrados.slice(0, 6));
      this.mensaje.set(
        filtrados.length === 0 ? 'No se encontraron emprendimientos con este nombre.' : ''
      );
    });
  }

  buscar(valor: string) {
    this.termino.set(valor);
  }
}
