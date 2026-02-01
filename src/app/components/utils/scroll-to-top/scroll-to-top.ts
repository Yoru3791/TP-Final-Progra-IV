import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-scroll-to-top',
  imports: [],
  templateUrl: './scroll-to-top.html',
  styleUrl: './scroll-to-top.css',
})
export class ScrollToTop {
  visible = false;
  private scrolleando = false;

  private readonly UMBRAL = 300; // En píxeles

  @HostListener('window:scroll')
  onScroll(): void {
    this.visible = !this.scrolleando && window.scrollY > this.UMBRAL;
  }

  scrollToTop(): void {
    this.visible = false;
    this.scrolleando = true;

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    // El usuario puede interrumpir el movimiento
    setTimeout(() => {
      this.scrolleando = false;
      this.onScroll();
    }, 500);
  }
}
