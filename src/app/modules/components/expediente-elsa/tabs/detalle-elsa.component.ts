import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ExpedienteDetailDto } from '../../../models';

@Component({
  selector: 'app-detalle-elsa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="formulario" class="detalle-form">
      <div class="field">
        <label>Tabaco Actual</label>
        <input formControlName="tabaco_actual" [disabled]="true" data-testid="field-tabaco_actual-readonly" />
      </div>
      <div class="field">
        <label>Porciones de Alimentos/Día</label>
        <input formControlName="alim_total_porciones_dia" [disabled]="true" data-testid="field-alim_total_porciones_dia-readonly" />
      </div>
      <div class="field">
        <label>METs Totales</label>
        <input formControlName="af_mets_totales" [disabled]="true" data-testid="field-af_mets_totales-readonly" />
      </div>
      <div class="field">
        <label>AUDIT-C Score</label>
        <input formControlName="audit_c_score" [disabled]="true" data-testid="field-audit_c_score-readonly" />
      </div>
      <div class="info-message">
        ✓ Este formulario es de lectura estricta. No se pueden realizar cambios desde esta vista.
      </div>
    </form>
  `,
  styles: [
    `
      .detalle-form {
        padding: 20px;
      }
      .field {
        margin-bottom: 15px;
      }
      label {
        display: block;
        font-weight: bold;
        margin-bottom: 5px;
      }
      input[disabled] {
        background-color: #f5f5f5;
        cursor: not-allowed;
      }
      .info-message {
        padding: 10px;
        background-color: #e8f5e9;
        border-left: 4px solid #4caf50;
        margin-top: 20px;
      }
    `,
  ],
})
export class DetalleElsaComponent implements OnInit {
  @Input() expediente!: ExpedienteDetailDto;
  formulario: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.group({
      tabaco_actual: { value: '', disabled: true },
      alim_total_porciones_dia: { value: '', disabled: true },
      af_mets_totales: { value: '', disabled: true },
      audit_c_score: { value: '', disabled: true },
    });
  }

  ngOnInit(): void {
    if (this.expediente?.['formulario']) {
      this.formulario.patchValue(this.expediente['formulario']);
    }
  }
}
