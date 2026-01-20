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
      this.carritoService.emprendimiento()?.id === this.emprendimiento().id
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
}
