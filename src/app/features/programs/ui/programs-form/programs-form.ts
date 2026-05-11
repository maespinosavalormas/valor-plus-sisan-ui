import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
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
import { ConfirmDialogService, ConfirmDialogData, ConfirmResult } from '../confirm-dialog/confirm-dialog';

export interface ProgramDialogData {
  isEdit?: boolean;
  program?: any;
}

@Component({
  standalone: true,
  selector: 'app-programs-form',
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
    MatSelectModule
  ],
  templateUrl: './programs-form.html',
  styleUrls: ['./programs-form.scss'] // Renamed styleUrl to styleUrls
})
export class ProgramsFormComponent implements OnInit {
  form: FormGroup;
  isEditing = false;
  objetivosEspecificos: string[] = [];
  
  // Lista mock de responsables (funcionarios del Municipio)
  responsablesList = [
    { id: 1, name: 'Juan Pérez' },
    { id: 2, name: 'María García' },
    { id: 3, name: 'Carlos Rodríguez' },
    { id: 4, name: 'Ana López' },
    { id: 5, name: 'Luis Martínez' },
    { id: 6, name: 'Sofía Torres' },
    { id: 7, name: 'Diego Hernández' },
    { id: 8, name: 'Patricia Morales' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProgramsFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProgramDialogData,
    private confirmDialogService: ConfirmDialogService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      executionTime: ['', [Validators.required]],
      objetivos: ['', [Validators.required]],
      objetivosEspecificos: [[]],
      responsables: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data?.program) {
      this.isEditing = true;
      this.form.patchValue({
        name: this.data.program.name,
        description: this.data.program.description,
        executionTime: this.data.program.executionTime,
        objetivos: this.data.program.objetivos || '',
        objetivosEspecificos: this.data.program.objetivosEspecificos || [],
        responsables: this.data.program.responsables || []
      });
      this.objetivosEspecificos = this.data.program.objetivosEspecificos || [];
    }
  }

  onSave(): void {
    if (this.form.valid) {
      const programData = {
        ...this.form.value,
        objetivosEspecificos: this.objetivosEspecificos,
        id: this.isEditing ? this.data.program.id : Date.now()
      };

      // Si es edición, mostrar confirmación
      if (this.isEditing) {
        this.confirmDialogService.confirmUpdateProgram().subscribe((confirmed: boolean) => {
          if (confirmed) {
            this.dialogRef.close(programData);
          }
        });
      } else {
        // Si es creación, mostrar confirmación
        this.confirmDialogService.confirmCreateProgram().subscribe((confirmed: boolean) => {
          if (confirmed) {
            this.dialogRef.close(programData);
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get name() { return this.form.get('name'); }
  get description() { return this.form.get('description'); }
  get executionTime() { return this.form.get('executionTime'); }
  get objetivos() { return this.form.get('objetivos'); }
  get responsables() { return this.form.get('responsables'); }

  agregarObjetivoEspecifico(): void {
    const input = document.getElementById('nuevo-objetivo-especifico') as HTMLInputElement;
    if (input && input.value.trim()) {
      const valor = input.value.trim();
      // Verificar que no esté vacío y que no exista ya
      if (valor && !this.objetivosEspecificos.includes(valor)) {
        this.objetivosEspecificos.push(valor);
        input.value = '';
      }
    }
  }

  eliminarObjetivoEspecifico(index: number): void {
    this.objetivosEspecificos.splice(index, 1);
  }
}
