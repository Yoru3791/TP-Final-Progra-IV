import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FiltrosViandas } from '../../../model/filtros-viandas.model';
import { ViandaResponse } from '../../../model/vianda-response.model';
import { FormsModule } from '@angular/forms';
import { IconTacc } from '../../utils/icon-tacc/icon-tacc';
import { IconVeggie } from '../../utils/icon-veggie/icon-veggie';
import { IconVegan } from '../../utils/icon-vegan/icon-vegan';
import { PageMode } from '../../../pages/emprendimiento-page/emprendimiento-page';

type FiltroDisponibilidad = 'TODAS' | 'DISPONIBLES' | 'NO_DISPONIBLES';

@Component({
  selector: 'app-emprendimiento-filtros-viandas',
  imports: [FormsModule, IconTacc, IconVegan, IconVeggie],
  templateUrl: './emprendimiento-filtros-viandas.html',
  styleUrl: './emprendimiento-filtros-viandas.css',
})
export class EmprendimientoFiltrosViandas {

  categorias = input.required<string[]>();
  modo = input.required<PageMode>();
  filtrosChanged = output<FiltrosViandas>();

  categoriasOpen = signal(false);
  categoriaSeleccionada = signal<string | null>(null);
  busqueda = signal<string>('');
  esVegano = signal<boolean>(false);
  esVegetariano = signal<boolean>(false);
  esSinTacc = signal<boolean>(false);
  precioMin = signal<number | null>(null);
  precioMax = signal<number | null>(null);
  filtroDisponibilidad = signal<FiltroDisponibilidad>('TODAS');


  borrarBusqueda() {
    this.busqueda.set('');
    this.aplicarFiltros();
  }

  toggleMenuCategorias() {
    this.categoriasOpen.update(v => !v);
  }

  toggleCategoria(cat: string) {
    this.categoriaSeleccionada.update((current) => (current === cat ? null : cat));
    this.categoriasOpen.set(false);
    this.aplicarFiltros();
  }

  toggleDietary(tipo: 'vegano' | 'vegetariano' | 'sintacc') {
    if (tipo === 'vegano') this.esVegano.update((v) => !v);
    if (tipo === 'vegetariano') this.esVegetariano.update((v) => !v);
    if (tipo === 'sintacc') this.esSinTacc.update((v) => !v);
  }

  aplicarFiltros() {
    let disponibilidad: boolean | null = null;
    const estado = this.filtroDisponibilidad();
    
    if (estado === 'DISPONIBLES') disponibilidad = true;
    if (estado === 'NO_DISPONIBLES') disponibilidad = false;

    const dto: FiltrosViandas = {
      nombreVianda: this.busqueda(),
      categoria: this.categoriaSeleccionada(),
      esVegano: this.esVegano(),
      esVegetariano: this.esVegetariano(),
      esSinTacc: this.esSinTacc(),
      precioMin: this.precioMin(),
      precioMax: this.precioMax(),
      estaDisponible: disponibilidad,
    };

    this.filtrosChanged.emit(dto);
  }

  limpiarFiltros() {
    this.busqueda.set('');
    this.categoriaSeleccionada.set(null);
    this.esVegano.set(false);
    this.esVegetariano.set(false);
    this.esSinTacc.set(false);
    this.precioMin.set(null);
    this.precioMax.set(null);
    this.filtroDisponibilidad.set('TODAS');

    this.categoriasOpen.set(false);
    this.aplicarFiltros();
  }

}
