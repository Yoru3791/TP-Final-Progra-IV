import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Reclamo } from '../../../model/reclamo-response.model';
import { CategoriaReclamoLabel } from '../../../constants/categoriaReclamo-labels.const';
import { EstadoReclamoHelper } from '../../../constants/estadoReclamo-labels.const';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reclamo-card',
  imports: [CommonModule],
  templateUrl: './reclamo-card.html',
  styleUrl: './reclamo-card.css',
})
export class ReclamoCardComponent {
  @Input({ required: true }) reclamo!: Reclamo;
  @Input() isAdmin = false; 
  @Output() gestionar = new EventEmitter<Reclamo>(); //Si admin toco para gestionar

  estadoHelper = EstadoReclamoHelper;
  categoriaLabel = CategoriaReclamoLabel;

  onGestionarClick() {
    this.gestionar.emit(this.reclamo);
  }
}
