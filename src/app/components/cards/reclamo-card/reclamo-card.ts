import { Component, Input } from '@angular/core';
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

  estadoHelper = EstadoReclamoHelper;
  categoriaLabel = CategoriaReclamoLabel;
}
