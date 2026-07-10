import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ElsaInactivationService } from '../../../../../modules/elsa/services/elsa-inactivation.service';
import { InactivateElsaDTO } from '../../../../../shared/models/inactivate-elsa.model';

export interface InactivateModalData {
  elsaId: string;
  patientName: string;
}

@Component({
  selector: 'app-inactivate-elsa-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './inactivate-elsa-modal.component.html',
  styleUrls: ['./inactivate-elsa-modal.component.scss'],
})
export class InactivateElsaModalComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  loading = false;
  error: string | null = null;
  charCount = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private elsaService: ElsaInactivationService,
    public dialogRef: MatDialogRef<InactivateElsaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InactivateModalData,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.initForm();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm() {
    this.form = this.fb.group({
      motivo_inactivacion: [
        '',
        [
          Validators.required,
          Validators.minLength(15),
          Validators.maxLength(250),
          this.xssValidator(),
        ],
      ],
      totp_token: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{6}$/),
        ],
      ],
    });

    // Track character count
    this.form.get('motivo_inactivacion')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: string) => {
        this.charCount = value ? value.length : 0;
      });
  }

  async submit() {
    if (this.form.invalid) {
      this.error = 'Por favor complete el formulario correctamente';
      return;
    }

    this.loading = true;
    this.error = null;

    const payload: InactivateElsaDTO = {
      motivo_inactivacion: this.form.get('motivo_inactivacion')?.value.trim(),
      totp_token: this.form.get('totp_token')?.value,
    };

    this.elsaService
      .inactivateElsa(this.data.elsaId, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.loading = false;

          if (response.success) {
            this.snackBar.open('Registro ELSA inactivado correctamente', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'bottom',
            });

            this.dialogRef.close({ success: true, data: response.data });
          } else {
            this.error = response.error || 'Error al inactivar el registro';
          }
        },
        error: (err: any) => {
          this.loading = false;
          this.error = this.getErrorMessage(err);
        },
      });
  }

  cancel() {
    this.dialogRef.close();
  }

  private getErrorMessage(error: any): string {
    if (error.message) {
      return error.message;
    }

    switch (error.statusCode) {
      case 400:
        return 'Solicitud inválida. Verifique los datos';
      case 401:
        return 'Token inválido o expirado';
      case 403:
        return 'No tiene permiso para inactivar este registro';
      case 404:
        return 'Registro ELSA no encontrado';
      case 409:
        return 'Este registro ya ha sido inactivado';
      case 429:
        return 'Demasiados intentos fallidos. Intente más tarde (15 minutos)';
      case 503:
        return 'Servicio de autenticación no disponible';
      default:
        return 'Error al procesar la solicitud. Intente nuevamente';
    }
  }

  private xssValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) {
        return null;
      }

      // Forbidden characters: < > ' " ` ;
      const forbiddenChars = /[<>'"`;]/;
      if (forbiddenChars.test(control.value)) {
        return { xss: { value: control.value } };
      }

      return null;
    };
  }

  // Utility getters for template
  get motivoErrors() {
    return this.form.get('motivo_inactivacion')?.errors || {};
  }

  get tokenErrors() {
    return this.form.get('totp_token')?.errors || {};
  }

  get isMotivoTouched(): boolean {
    return !!this.form.get('motivo_inactivacion')?.touched;
  }

  get isTokenTouched(): boolean {
    return !!this.form.get('totp_token')?.touched;
  }

  get isFormValid(): boolean {
    return this.form.valid && !this.loading;
  }
}
