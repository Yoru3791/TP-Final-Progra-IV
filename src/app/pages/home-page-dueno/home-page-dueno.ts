import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { EmprendimientoService } from '../../services/emprendimiento-service';
import { EmprendimientoConViandas } from '../../model/emprendimiento-con-viandas.model';
import { EmprendimientoCard } from '../../components/cards/emprendimiento-card/emprendimiento-card';
import { FormEmprendimiento } from '../../components/forms/form-emprendimiento/form-emprendimiento';
import { MatDialog } from '@angular/material/dialog';
import { CityFilterService } from '../../services/city-filter-service';
import { EmprendimientoResponse } from '../../model/emprendimiento-response.model';
import { Paginador } from '../../components/utils/paginador/paginador';

@Component({
  selector: 'app-home-page-dueno',
  imports: [EmprendimientoCard, Paginador],
  templateUrl: './home-page-dueno.html',
  styleUrl: './home-page-dueno.css',
})
export class HomePageDueno implements OnInit {
  private emprendimientoService = inject(EmprendimientoService);
  private dialog = inject(MatDialog);
  private cityFilter = inject(CityFilterService);

  ciudadActual = computed(() => (this.cityFilter.city() ?? '').toUpperCase());
  emprendimientos = signal<EmprendimientoResponse[]>([]);
  pageInfo = computed(() => this.emprendimientoService.pageInfo());
  verTodas = signal(false);

  constructor() {
    //  Cargo datos, viandas y ordeno por disponibilidad
    effect(() => {
      const emps = this.emprendimientoService.emprendimientos();

      if (emps.length === 0) {
        this.emprendimientos.set([]);
        return;
      }

      this.emprendimientoService
        .loadEmprendimientosConViandas()
        .subscribe((full) => {
          const ordenados = full.sort((a, b) => {
            if (a.estaDisponible === b.estaDisponible) {
                return 0; 
            }
            return a.estaDisponible ? -1 : 1;
          });

          this.emprendimientos.set(ordenados);
        });
    });

    //  Vuelvo a página 0 si cambia la ciudad o cambia el toggle
    effect(() => {
        const ciudad = this.cityFilter.city();
        const verTodo = this.verTodas();
        this.emprendimientoService.fetchEmprendimientos(0, 10, verTodo);
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    
  }

  toggleVerTodas() {
    this.verTodas.update(v => !v);
  }

  onPageChange(newPage: number) {
    this.emprendimientoService.fetchEmprendimientos(newPage, 10, this.verTodas());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openEmprendimientoForm() {
    this.dialog
      .open(FormEmprendimiento, {
        width: '100rem',
        panelClass: 'form-modal',
        autoFocus: false,
        restoreFocus: false,
      })
      .afterClosed()
      .subscribe((exito) => {
        if (exito) {
          const currentPage = this.pageInfo()?.number || 0;
          this.emprendimientoService.fetchEmprendimientos(currentPage, 10, this.verTodas());
        }
      });
  }
}
