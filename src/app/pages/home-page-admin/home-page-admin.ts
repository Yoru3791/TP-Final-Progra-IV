import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../services/usuario-service';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-home-page-admin',
  imports: [RouterLink, UpperCasePipe],
  templateUrl: './home-page-admin.html',
  styleUrl: './home-page-admin.css',
})
export class HomePageAdmin implements OnInit {
  private usuarioService = inject(UsuarioService);

  nombreAdmin = signal<string>('ADMIN');

  ngOnInit() {
    this.usuarioService.getPerfilUsuario().subscribe({
      next: (usuario) => {
        // Tomamos el primer nombre o el nombre completo
        const primerNombre = usuario.nombreCompleto.split(' ')[0];
        this.nombreAdmin.set(primerNombre);
      },
      error: () => {
        this.nombreAdmin.set('ADMIN');
      },
    });
  }
}
