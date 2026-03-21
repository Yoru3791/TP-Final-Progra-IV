import {
  Component,
  EventEmitter,
  Output,
  computed,
  signal,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-date-range-picker',
  imports: [CommonModule],
  templateUrl: './date-range-picker.html',
  styleUrls: ['./date-range-picker.css'],
})
export class DateRangePickerComponent {
  @Output() fechasSeleccionadas = new EventEmitter<{ desde: Date; hasta: Date } | null>();

  isOpen = signal(false);
  isRangeMode = signal(false);
  showSelectorView = signal(false);

  viewDate = signal(new Date());
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);
  hoverDate = signal<Date | null>(null);

  constructor(private eRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  clickOut(event: Event) {
    if (this.isOpen() && !this.eRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
      this.showSelectorView.set(false);
    }
  }

  displayLabel = computed(() => {
    const start = this.startDate();
    const end = this.endDate();

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    };

    if (!start) return 'Filtrar por fecha';

    const startStr = start.toLocaleDateString('es-AR', options);
    if (!this.isRangeMode()) return startStr;
    if (this.isRangeMode() && !end) return `${startStr} - ...`;

    const endStr = end ? end.toLocaleDateString('es-AR', options) : '';
    return `${startStr} - ${endStr}`;
  });

  headerLabel = computed(() => {
    const date = this.viewDate();
    const month = date.toLocaleString('es-AR', { month: 'long' });
    const year = date.getFullYear();
    const monthCap = month.charAt(0).toUpperCase() + month.slice(1);
    return `${monthCap} - ${year}`;
  });

  calendarDays = computed(() => {
    const year = this.viewDate().getFullYear();
    const month = this.viewDate().getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const adjustedStartDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

    const days = [];
    for (let i = 0; i < adjustedStartDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  });

  monthsList = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  clearSelection(event: Event) {
    event.stopPropagation();
    this.startDate.set(null);
    this.endDate.set(null);
    this.hoverDate.set(null);
    this.fechasSeleccionadas.emit(null);
  }

  // --- Acciones ---
  toggleDropdown(event?: Event) {
    if (event) event.stopPropagation();
    this.isOpen.update((v) => !v);
    if (!this.isOpen()) this.showSelectorView.set(false);
  }

  changeMonth(increment: number, event: Event) {
    event.stopPropagation();
    const current = this.viewDate();
    this.viewDate.set(new Date(current.getFullYear(), current.getMonth() + increment, 1));
  }

  changeYear(increment: number, event: Event) {
    event.stopPropagation();
    const current = this.viewDate();
    this.viewDate.set(new Date(current.getFullYear() + increment, current.getMonth(), 1));
  }

  selectMonth(monthIndex: number, event: Event) {
    event.stopPropagation();
    const current = this.viewDate();
    this.viewDate.set(new Date(current.getFullYear(), monthIndex, 1));
    this.showSelectorView.set(false);
  }

  toggleSelectorView(event: Event) {
    event.stopPropagation();
    this.showSelectorView.update((v) => !v);
  }

  setMode(isRange: boolean, event: Event) {
    event.stopPropagation();
    if (this.isRangeMode() !== isRange) {
      this.isRangeMode.set(isRange);
      this.startDate.set(null);
      this.endDate.set(null);
      this.hoverDate.set(null);
    }
  }

  selectDate(date: Date) {
    if (!date) return;
    if (!this.isRangeMode()) {
      this.startDate.set(date);
      this.endDate.set(date);
      this.emitir();
      this.isOpen.set(false);
      return;
    }
    const start = this.startDate();
    const end = this.endDate();

    if (!start || (start && end)) {
      this.startDate.set(date);
      this.endDate.set(null);
    } else {
      if (date < start) {
        this.endDate.set(start);
        this.startDate.set(date);
      } else {
        this.endDate.set(date);
      }
      this.emitir();
      this.isOpen.set(false);
    }
  }

  isToday(date: Date): boolean {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }
  isSelected(date: Date): boolean {
    if (!date) return false;
    const start = this.startDate();
    const end = this.endDate();
    const time = date.getTime();
    return time === start?.getTime() || time === end?.getTime();
  }
  isInRange(date: Date): boolean {
    if (!date || !this.isRangeMode()) return false;
    const start = this.startDate();
    const end = this.endDate();
    const hover = this.hoverDate();
    if (start && end) return date > start && date < end;
    if (start && !end && hover)
      return (date > start && date < hover) || (date < start && date > hover);
    return false;
  }
  onDateHover(date: Date | null) {
    if (this.isRangeMode() && this.startDate() && !this.endDate()) this.hoverDate.set(date);
  }
  private emitir() {
    const s = this.startDate();
    const e = this.endDate();
    if (s && e) this.fechasSeleccionadas.emit({ desde: s, hasta: e });
  }

  close() {
    this.isOpen.set(false);
  }
}
