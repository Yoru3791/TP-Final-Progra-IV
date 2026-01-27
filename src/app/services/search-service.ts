import { inject, Injectable, signal, effect } from '@angular/core';
import { CityFilterService } from './city-filter-service';
import { EmprendimientoResponse } from '../model/emprendimiento-response.model';
import { EmprendimientoService } from './emprendimiento-service';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SearchService {
  termino = signal('');
  mensaje = signal('');
  loading = signal(false);
  resultados = signal<EmprendimientoResponse[]>([]);

  private emprendimientosService = inject(EmprendimientoService);

  private termino$ = toObservable(this.termino);

  constructor() {
    this.termino$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((valor) => {
        const term = valor.trim();

        if (!term) {
          this.resultados.set([]);
          this.mensaje.set('');
          return of([]);
        }

        this.loading.set(true);
        this.mensaje.set('');

        return this.emprendimientosService.searchByNombre(term).pipe(
          finalize(() => this.loading.set(false))
        );
      })
    ).subscribe((res) => {
      this.resultados.set(res);
      
      if (res.length === 0 && this.termino().trim()) {
        this.mensaje.set('No se encontraron emprendimientos con este nombre.');
      } else {
        this.mensaje.set('');
      }
    });
  }

  buscar(valor: string) {
    this.termino.set(valor);
  }
}
