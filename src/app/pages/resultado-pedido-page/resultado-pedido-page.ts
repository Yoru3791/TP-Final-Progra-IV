import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-resultado-pedido-page',
  imports: [RouterLink],
  templateUrl: './resultado-pedido-page.html',
  styleUrl: './resultado-pedido-page.css',
})
export class ResultadoPedidoPage implements OnInit {

  private router = inject(Router);

  resultado = signal<'exito' | 'error' | null>(null);
  pedidoId = signal<number | null>(null);
  emprendimientoId = signal<number | null>(null);

  ngOnInit() {
    // A esta page se accede únicamente al realizar un pedido
    // (por eso reviso el state de la navegación, para saber de dónde vengo)
    const state = history.state as { 
      resultado: 'exito' | 'error', 
      pedidoId?: number, 
      emprendimientoId?: number
    };

    if (!state.resultado) {
      this.router.navigate(['/home']);
      return;
    }

    this.resultado.set(state.resultado);

    if (state.emprendimientoId) {
      this.emprendimientoId.set(state.emprendimientoId);
    }

    if (state.pedidoId) {
      this.pedidoId.set(state.pedidoId);
    }
  }

  volverAtras() {
    if (this.emprendimientoId()) {
      this.router.navigate(['/emprendimiento', this.emprendimientoId()]);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
