import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info-reclamo-tooltip',
  imports: [CommonModule],
  templateUrl: './info-reclamo-tooltip.html',
  styleUrl: './info-reclamo-tooltip.css'
})
export class InfoReclamoTooltipComponent {
  @Input() isAdmin = false;
}