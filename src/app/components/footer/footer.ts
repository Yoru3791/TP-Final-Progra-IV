import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  private authService = inject(AuthService);

  public anioActual = (new Date()).getFullYear();

  public esInvitado() {
    return this.authService.currentUserRole() === 'INVITADO';
  }
}
