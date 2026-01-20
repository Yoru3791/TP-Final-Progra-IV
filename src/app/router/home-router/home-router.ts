import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { HomePage } from '../../pages/home-page/home-page';
import { HomePageDueno } from '../../pages/home-page-dueno/home-page-dueno';
import { HomePageAdmin } from '../../pages/home-page-admin/home-page-admin';

@Component({
  selector: 'app-home-router',
  imports: [HomePage, HomePageDueno, HomePageAdmin],
  templateUrl: './home-router.html',
  styleUrl: './home-router.css',
})
export class HomeRouter {
  private auth = inject(AuthService);
  rol = this.auth.currentUserRole;
}
