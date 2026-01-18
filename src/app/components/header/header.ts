import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Output, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

// Servicios
import { AuthService } from '../../services/auth-service'; 
import { NotificacionService } from '../../services/notificacion-service';

// Componentes
import { CitySelector } from '../utils/city-selector/city-selector';
import { SearchBar } from '../utils/search-bar/search-bar';
import { DropdownNotificacion } from '../utils/dropdown-notificacion/dropdown-notificacion';
import { ConfirmarLogout } from '../modals/logout-modal/logout-modal';
import { FormsModule } from '@angular/forms';
import { CityFilterService } from '../../services/city-filter-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule, FormsModule, CitySelector, SearchBar, DropdownNotificacion],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private authService = inject(AuthService);
  private notiService = inject(NotificacionService);
  private dialog = inject(MatDialog);
  public cityFilterService = inject(CityFilterService);

  public role = this.authService.currentUserRole;

  isLoggedIn = computed(() => this.role() !== 'INVITADO');

  @Output() loginClicked = new EventEmitter<void>();
  @Output() searchSubmitted = new EventEmitter<string>();

  constructor() {
    effect(() => {
      if (this.isLoggedIn() && this.role() !== 'ADMIN') {
        this.notiService.fetchNotificaciones();
      }
    });
  }

  onLogin() {
    this.loginClicked.emit();
  }

  onLogout() {
    this.dialog.open(ConfirmarLogout);
  }

  onSearch(event: Event, searchInput: HTMLInputElement) {
    event.preventDefault(); 
    if (searchInput.value) {
      this.searchSubmitted.emit(searchInput.value);
    }
  }
}
