import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EmprendimientoAdminResponse } from '../../../model/emprendimiento-admin-response.model';


@Component({
  selector: 'app-emprendimiento-admin-card',
  imports: [RouterLink],
  templateUrl: './emprendimiento-admin-card.html',
  styleUrl: './emprendimiento-admin-card.css',
})
export class EmprendimientoAdminCard {
  @Input() emprendimiento!: EmprendimientoAdminResponse;
}
