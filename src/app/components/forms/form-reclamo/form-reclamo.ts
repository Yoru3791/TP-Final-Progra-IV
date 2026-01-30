import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, inject, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriaReclamo } from '../../../enums/categoriaReclamo.enum';
import { CategoriaReclamoLabel } from '../../../constants/categoriaReclamo-labels.const';
import { ReclamoRequest } from '../../../model/reclamo-request.model';

@Component({
  selector: 'app-form-reclamo',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-reclamo.html',
  styleUrl: './form-reclamo.css',
})
export class FormReclamo {
  private fb = inject(FormBuilder);
  private elementRef = inject(ElementRef);

  @Output() enviar = new EventEmitter<ReclamoRequest>();

  openCategoria = false;

  categoriasOptions = Object.values(CategoriaReclamo).map((key) => ({
    value: key,
    label: CategoriaReclamoLabel[key],
  }));

  formReclamo = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    categoria: ['', [Validators.required]],
    descripcion: ['', [Validators.required, Validators.maxLength(400)]],
  });

  get charsCount(): number {
    return this.formReclamo.get('descripcion')?.value?.length || 0;
  }

  toggleCategoria(event: Event) {
    event.stopPropagation();
    this.openCategoria = !this.openCategoria;
  }

  selectCategoria(valor: string) {
    this.formReclamo.get('categoria')?.setValue(valor);
    this.openCategoria = false;
  }

  getSelectedLabel(): string {
    const val = this.formReclamo.get('categoria')?.value;
    if (!val) return 'Selecciona una opción';

    const option = this.categoriasOptions.find((o) => o.value === val);
    return option ? option.label : val;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.openCategoria = false;
    }
  }

  onSubmit() {
    if (this.formReclamo.valid) {
      this.enviar.emit(this.formReclamo.value as ReclamoRequest);
    }
  }

  resetForm() {
    this.formReclamo.reset();
    this.openCategoria = false;
  }
}
