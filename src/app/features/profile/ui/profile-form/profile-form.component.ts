import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../users/ui/confirm-dialog/confirm-dialog';

@Component({
  standalone: true,
  selector: 'app-profile-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
  ],
  styleUrls: ['./profile-form.scss'],
  templateUrl: './profile-form.html'
})
export class ProfileFormComponent implements OnInit {
  departments = ['Antioquia', 'Cundinamarca', 'Valle del Cauca'];
  municipalities: string[] = [];

  identificationTypes = [{ id: 1, name: 'Cédula de Ciudadanía', code: 'CC' }, { id: 2, name: 'Tarjeta de Identidad', code: 'TI' }, { id: 3, name: 'Cédula de Extranjería', code: 'CE' }];
  roles = ['Prestador de salud', 'Municipio', 'Funcionario', 'Comité', 'Administrador'];

  form: FormGroup;
  isEdit = false;

  // Campos que serán editables al hacer clic en el ícono
  editableFields = {
    firstName: false,
    secondName: false,
    firstLastName: false,
    secondLastName: false,
    email: false,
    idNumber: false,
    phone: false,
    address: false
  };

  constructor(private fb: FormBuilder, private dialog: MatDialog) {
    this.form = this.fb.group({
      firstName: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(100)]],
      secondName: [{ value: '', disabled: true }, Validators.maxLength(100)],
      firstLastName: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(100)]],
      secondLastName: [{ value: '', disabled: true }, Validators.maxLength(100)],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email, Validators.maxLength(100)]],
      department: ['', Validators.required],
      municipality: ['', Validators.required],
      identificationTypeId: ['', Validators.required],
      idNumber: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(50)]],
      phone: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/^\d{10}$/)]],
      address: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(60)]],
      birthDate: ['', Validators.required],
      role: ['', Validators.required],
    });

    this.form.get('department')?.valueChanges.subscribe((value) => {
      this.loadMunicipalities(value!);
      this.form.get('municipality')?.reset();
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    // Simulación de datos del usuario actual
    this.form.patchValue({
      firstName: 'Juan',
      secondName: 'Jose',
      firstLastName: 'Vergara',
      secondLastName: '',
      email: 'test@ejemplo.com',
      department: 'Cundinamarca',
      municipality: 'Bogotá',
      identificationTypeId: 1,
      idNumber: '123456789',
      address: 'Calle 123',
      birthDate: '1990-01-01',
      role: 'Funcionario',
      phone: '3001234567'
    });
    this.loadMunicipalities('Cundinamarca');
  }

  loadMunicipalities(department: string) {
    const map: Record<string, string[]> = {
      Antioquia: ['Medellín', 'Envigado'],
      Cundinamarca: ['Bogotá', 'Soacha'],
      'Valle del Cauca': ['Cali', 'Palmira'],
    };
    this.municipalities = map[department] || [];
  }

  toggleEdit(fieldName: keyof typeof this.editableFields) {
    const control = this.form.get(fieldName);
    
    if (control) {
      if (this.editableFields[fieldName]) {
        // Si ya está en modo edición, deshabilitar
        control.disable();
        this.editableFields[fieldName] = false;
      } else {
        // Si está deshabilitado, habilitar
        control.enable();
        this.editableFields[fieldName] = true;
      }
    }
  }

  isFieldEditable(fieldName: keyof typeof this.editableFields): boolean {
    return this.editableFields[fieldName];
  }

  showCancelConfirmation(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Cancelar',
        message: '¿Estás seguro de que deseas cancelar? Se perderán los cambios no guardados.',
        confirmText: 'Sí, cancelar',
        cancelText: 'No, continuar',
        type: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cancel();
      }
    });
  }

  showSaveConfirmation(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar acción',
        message: '¿Estás seguro de que deseas guardar los cambios en tu perfil?',
        confirmText: 'Sí, guardar',
        cancelText: 'No',
        type: 'success'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.save();
      }
    });
  }

  cancel() {
    console.log('Cancelando');
  }

  save() {
    // Habilitar temporalmente todos los campos para obtener sus valores
    Object.keys(this.editableFields).forEach(key => {
      this.form.get(key)?.enable();
    });

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    console.log('Guardando:', {
      id: Date.now(),
      ...formValue,
      birthDate: new Date(formValue.birthDate!),
    });

    // Volver a deshabilitar los campos que no estaban en edición
    Object.keys(this.editableFields).forEach(key => {
      const fieldKey = key as keyof typeof this.editableFields;
      if (!this.editableFields[fieldKey]) {
        this.form.get(key)?.disable();
      }
    });
  }

  saveM() {
    this.showSaveConfirmation();
  }

  cancelM() {
    this.showCancelConfirmation();
  }
}