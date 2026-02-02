import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CityFilterService {
  // Por defecto "Mar Del Plata"

  private citySignal = signal<string>('Mar Del Plata');

  public city = this.citySignal.asReadonly();

  setCity(city: string | null) { 
    if (!city) return;
    this.citySignal.set(city.toLocaleUpperCase());
  }

  getCity(): string {
    return this.citySignal();
  }
}
