import { Component, computed, inject, Input, Signal } from '@angular/core';
import { UsuarioResponse } from '../../../model/usuario-response.model';
import { EmprendimientoService } from '../../../services/emprendimiento-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-usuario-card',
  imports: [RouterLink],
  templateUrl: './usuario-card.html',
  styleUrl: './usuario-card.css',
})
export class UsuarioCard {
  @Input() usuario!: UsuarioResponse;

  private authService = inject(AuthService);
  private emprendimientoService = inject(EmprendimientoService);

  isEditable = computed(() => this.usuario.id !== 1 && this.usuario.id !== this.authService.usuarioId());

  emprendimientos = computed(() =>
    this.emprendimientoService.emprendimientos().filter(datum => datum.dueno.id === this.usuario.id)
  );
}
