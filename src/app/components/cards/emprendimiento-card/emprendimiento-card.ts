import { Component, Input, signal } from '@angular/core';
import { EmprendimientoConViandas } from '../../../model/emprendimiento-con-viandas.model';
import { ViandaCard } from '../vianda-card/vianda-card';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-emprendimiento-card',
  imports: [ViandaCard, RouterLink],
  templateUrl: './emprendimiento-card.html',
  styleUrl: './emprendimiento-card.css',
})
export class EmprendimientoCard {
  @Input() emprendimiento!: EmprendimientoConViandas;

  imageLoadError = signal(false);

  handleImageError() {
    this.imageLoadError.set(true);
  }

  getallViandas() {
    return this.emprendimiento.viandas;
  }
}
