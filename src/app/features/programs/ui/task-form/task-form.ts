import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialog,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSelect, MatOption } from '@angular/material/select';
import { ConfirmDialogService } from '../confirm-dialog/confirm-dialog';

export interface TaskDialogData {
  programId?: string;
  isEdit?: boolean;
  taskData?: any;
}

@Component({
  standalone: true,
  selector: 'app-task-form',
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatOption
  ],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss'
})
export class TaskFormComponent implements OnInit {
  form: FormGroup;
  isEditing = false;
  
  // Lista mock de responsables (funcionarios del Municipio)
  responsables = [
    { id: 1, name: 'Juan Pérez' },
    { id: 2, name: 'María García' },
    { id: 3, name: 'Carlos Rodríguez' },
    { id: 4, name: 'Ana López' },
    { id: 5, name: 'Luis Martínez' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TaskFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskDialogData,
    private confirmDialogService: ConfirmDialogService
  ) {
    this.isEditing = data.isEdit || false;
    
    this.form = this.fb.group({
      nombreActividad: ['', [Validators.required, Validators.maxLength(200)]],
      fechaInicioActividad: ['', Validators.required],
      fechaFinActividad: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]], 
      responsable: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.isEditing && this.data.taskData) {
      // Cargar datos de la tarea para edición
      this.form.patchValue({
        nombreActividad: this.data.taskData.nombreActividad || '',
        fechaInicioActividad: this.data.taskData.fechaInicio || '',
        fechaFinActividad: this.data.taskData.fechaFin || '',
        descripcion: this.data.taskData.descripcion || '',
        responsable: Array.isArray(this.data.taskData.responsable) 
          ? this.data.taskData.responsable 
          : (this.data.taskData.responsable ? [this.data.taskData.responsable] : [])
      });
    }
  }

  onSave(): void {
    if (this.form.valid) {
      const taskData = {
        ...this.form.value,
        id: this.data.taskData?.id || Date.now(),
        programId: this.data.programId
      };

      // Si es edición, mostrar confirmación
      if (this.isEditing) {
        this.confirmDialogService.confirmUpdateTask().subscribe((confirmed: boolean) => {
          if (confirmed) {
            this.dialogRef.close(taskData);
          }
        });
      } else {
        // Si es creación, mostrar confirmación
        this.confirmDialogService.confirmCreateTask().subscribe((confirmed: boolean) => {
          if (confirmed) {
            this.dialogRef.close(taskData);
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // Métodos para el formulario
  get nombreActividad() { return this.form.get('nombreActividad'); }
  get descripcion() { return this.form.get('descripcion'); }
  get responsable() { return this.form.get('responsable'); }
}
