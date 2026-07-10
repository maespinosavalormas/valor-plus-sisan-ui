import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

export interface ReportsFormData {
  isEdit?: boolean;
  data?: any;
}

export interface QueryOption {
  id: string;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-reports-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatIconModule, MatInputModule, MatSelectModule, CommonModule],
  templateUrl: './reports-form.component.html',
  styleUrls: ['./reports-form.component.scss']
})
export class ReportsFormComponent {
  form: FormGroup;
  isEdit = false;

  // Queries disponibles para el desplegable
  availableQueries: QueryOption[] = [
    { id: 'query1', name: 'Reporte de Ventas Mensuales', description: 'Ventas agregadas por mes' },
    { id: 'query2', name: 'Reporte de Clientes Activos', description: 'Clientes con actividad reciente' },
    { id: 'query3', name: 'Reporte de Inventario', description: 'Estado actual del inventario' },
    { id: 'query4', name: 'Reporte de Proyecciones', description: 'Proyecciones financieras' },
    { id: 'query5', name: 'Reporte de Rendimiento', description: 'Métricas de rendimiento' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ReportsFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReportsFormData
  ) {
    this.isEdit = data?.isEdit || false;
    this.form = this.initForm();
    this.dialogRef.disableClose = true;

    // Cargar datos si es edición
    if (this.data?.data) {
      this.form.patchValue(this.data.data);
    }
  }

  private initForm(): FormGroup {
    return this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      query: ['', Validators.required]
    });
  }

  saveForm(): void {
    if (this.form.valid) {
      const formData = this.form.value;
      
      // Encontrar el query seleccionado para añadir información adicional
      const selectedQuery = this.availableQueries.find(q => q.id === formData.query);
      
      const reportData = {
        ...formData,
        queryName: selectedQuery?.name || '',
        queryDescription: selectedQuery?.description || '',
        id: this.data?.data?.id || this.generateId(),
        createdAt: this.data?.data?.createdAt || new Date()
      };

      this.dialogRef.close({
        action: 'save',
        reportData
      });
    }
  }

  cancelForm(): void {
    this.dialogRef.close();
  }

  private generateId(): string {
    return 'report_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
