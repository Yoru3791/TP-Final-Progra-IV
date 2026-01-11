import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
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
  
  @Output() enviar = new EventEmitter<ReclamoRequest>();

  // Convertimos el mapa de labels a un array iterable para el HTML
  categoriasOptions = Object.values(CategoriaReclamo).map((key) => ({
    value: key,
    label: CategoriaReclamoLabel[key]
  }));

  formReclamo = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    categoria: ['', [Validators.required]],
    descripcion: ['', [Validators.required, Validators.maxLength(400)]]
  });

  get charsCount(): number {
    return this.formReclamo.get('descripcion')?.value?.length || 0;
  }

  onSubmit() {
    if (this.formReclamo.valid) {
      this.enviar.emit(this.formReclamo.value as ReclamoRequest);
    }
  }
  
  resetForm() {
    this.formReclamo.reset();
  }
}
