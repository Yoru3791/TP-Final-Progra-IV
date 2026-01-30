import { Component, computed, inject, input, output, signal } from '@angular/core';
import { EmprendimientoResponse } from '../../../model/emprendimiento-response.model';
import { CarritoService } from '../../../services/carrito-service';

@Component({
  selector: 'app-emprendimiento-info',
  imports: [],
  templateUrl: './emprendimiento-info.html',
  styleUrl: './emprendimiento-info.css',
})
export class EmprendimientoInfo {
  emprendimiento = input.required<EmprendimientoResponse>();
  modo = input.required<'CLIENTE' | 'DUENO' | 'INVITADO' | 'PROHIBIDO' | 'CARGANDO'>();
  showImagenModal = false;
  imagenModalUrl?: String;
  imageLoadError = signal(false);

  accionPrincipal = output<void>();

  private carritoService = inject(CarritoService);

  public cantidadViandasUnicasEnCarrito = this.carritoService.cantidadViandasUnicas;

  public hayCarrito = computed(
    () =>
      this.modo() === 'CLIENTE' &&
      this.carritoService.emprendimiento()?.id === this.emprendimiento().id,
  );

  onButtonClick() {
    this.accionPrincipal.emit();
  }

  openImagenModal() {
    const url = this.emprendimiento().imagenUrl;
    if (!url || this.imageLoadError()) return;

    this.imagenModalUrl = url;
    this.showImagenModal = true;
  }

  closeImagenModal() {
    this.showImagenModal = false;
  }

  handleImageError() {
    this.imageLoadError.set(true);
  }

  getWhatsappLink(): string {
    const tel = this.emprendimiento().telefono;
    if (!tel) return '';

    let numeroLimpio = tel.replace(/\D/g, '');

    if (!numeroLimpio.startsWith('54')) {
      numeroLimpio = '549' + numeroLimpio;
    }

    return `https://wa.me/${numeroLimpio}`;
  }

  getMapsLink(): string {
    const direccion = this.emprendimiento().direccion;
    if (!direccion) return '';

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
  }
}
