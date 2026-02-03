import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Reclamo } from '../../../model/reclamo-response.model';
import { EstadoReclamo } from '../../../enums/estadoReclamo.enum';
import { EstadoReclamoHelper } from '../../../constants/estadoReclamo-labels.const';

@Component({
  selector: 'app-admin-gestion-reclamo-modal',
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './admin-gestion-reclamo-modal.html',
  styleUrl: './admin-gestion-reclamo-modal.css',
})
export class AdminGestionReclamoModal {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AdminGestionReclamoModal>);
  private elementRef = inject(ElementRef);

  form: FormGroup; 
  openEstado = false;

  estadosOptions = Object.values(EstadoReclamo).map(e => ({
    value: e,
    label: EstadoReclamoHelper[e].label
  }));

  constructor(@Inject(MAT_DIALOG_DATA) public data: Reclamo) {
    this.form = this.fb.group({
      estado: [this.data.estado, [Validators.required]],
      respuesta: [this.data.respuestaAdmin || '', []]
    });
    this.actualizarValidaciones(this.data.estado);
    this.form.get('estado')?.valueChanges.subscribe((estado) => {
      this.actualizarValidaciones(estado as EstadoReclamo);
    });
  }

  private actualizarValidaciones(estado: EstadoReclamo) {
    const respuestaControl = this.form.get('respuesta');

    if (estado === EstadoReclamo.RESUELTO || estado === EstadoReclamo.RECHAZADO) {
      respuestaControl?.setValidators([Validators.required, Validators.minLength(10)]);
    } else {
      respuestaControl?.clearValidators();
    }
    respuestaControl?.updateValueAndValidity();
  }

  toggleEstado(event: Event) {
    event.stopPropagation();
    this.openEstado = !this.openEstado;
  }

  selectEstado(valor: EstadoReclamo) {
    this.form.get('estado')?.setValue(valor);
    this.openEstado = false;
  }

  getSelectedEstadoLabel(): string {
    const val = this.form.get('estado')?.value;
    if (!val) return 'Seleccionar Estado';
    const option = this.estadosOptions.find(o => o.value === val);
    return option ? option.label : val;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.openEstado = false;
    }
  }

  guardar() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  cerrar() {
    this.dialogRef.close();
  }
}
