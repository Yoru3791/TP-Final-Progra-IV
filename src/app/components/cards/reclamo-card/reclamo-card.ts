import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Reclamo } from '../../../model/reclamo-response.model';
import { CategoriaReclamoLabel } from '../../../constants/categoriaReclamo-labels.const';
import { EstadoReclamoHelper } from '../../../constants/estadoReclamo-labels.const';
import { CommonModule } from '@angular/common';
import { EstadoReclamo } from '../../../enums/estadoReclamo.enum';

@Component({
  selector: 'app-reclamo-card',
  imports: [CommonModule],
  templateUrl: './reclamo-card.html',
  styleUrl: './reclamo-card.css',
})
export class ReclamoCardComponent {
  @Input({ required: true }) reclamo!: Reclamo;
  @Input() isAdmin = false; 
  @Output() gestionar = new EventEmitter<Reclamo>();

  estadoHelper = EstadoReclamoHelper;
  categoriaLabel = CategoriaReclamoLabel;

  get esFinalizado(): boolean {
    return this.reclamo.estado === EstadoReclamo.RESUELTO ||
          this.reclamo.estado === EstadoReclamo.RECHAZADO;
  }

  onGestionarClick() {
    this.gestionar.emit(this.reclamo);
  }
}
