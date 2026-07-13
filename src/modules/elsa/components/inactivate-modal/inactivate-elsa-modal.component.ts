import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inactivate-elsa-modal',
  templateUrl: './inactivate-elsa-modal.component.html',
  styleUrls: ['./inactivate-elsa-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
})
export class InactivateElsaModalComponent implements OnInit {
  @Input() elsaId!: string;
  @Input() elsaData: any;
  @Output() modalClosed = new EventEmitter<boolean>();

  inactivationForm: FormGroup;
  isSubmitting = false;
  charCount = 0;
  maxChars = 250;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.inactivationForm = this.fb.group({
      motivo_inactivacion: [
        '',
        [Validators.required, Validators.minLength(15), Validators.maxLength(250)],
      ],
      token_2fa: [
        '',
        [Validators.required, Validators.pattern(/^\d{6}$/), Validators.minLength(6)],
      ],
    });
  }

  ngOnInit(): void {
    this.setupFormListeners();
  }

  private setupFormListeners(): void {
    const motivoControl = this.inactivationForm.get('motivo_inactivacion');
    if (motivoControl) {
      motivoControl.valueChanges.subscribe((value) => {
        this.charCount = value ? value.length : 0;
      });
    }
  }

  onTokenInput(event: any): void {
    let value = event.target.value;
    // Remove non-digit characters
    value = value.replace(/[^\d]/g, '');
    // Limit to 6 digits
    value = value.substring(0, 6);
    this.inactivationForm.patchValue({ token_2fa: value });
  }

  onTokenPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    // Clean up: remove spaces and non-digits
    const cleanedData = pastedData.replace(/\s/g, '').replace(/[^\d]/g, '');
    const limitedData = cleanedData.substring(0, 6);
    this.inactivationForm.patchValue({ token_2fa: limitedData });
  }

  async onConfirm(): Promise<void> {
    if (!this.inactivationForm.valid) {
      await Swal.fire({
        icon: 'error',
        title: 'Formulario inválido',
        text: 'Por favor completa todos los campos correctamente',
      });
      return;
    }

    this.isSubmitting = true;

    try {
      const motivoControl = this.inactivationForm.get('motivo_inactivacion');
      const tokenControl = this.inactivationForm.get('token_2fa');

      const payload = {
        elsa_id: this.elsaId,
        motivo_inactivacion: motivoControl?.value || '',
        token_2fa: tokenControl?.value || '',
      };

      const response = await this.http
        .post(
          `http://localhost:3000/api/elsa/${this.elsaId}/inactivate`,
          payload
        )
        .toPromise() as any;

      if (response?.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Registro ELSA inactivado exitosamente',
          confirmButtonText: 'Aceptar',
        });
        this.modalClosed.emit(true);
      }
    } catch (error: any) {
      let errorMessage = 'Error al inactivar el registro';

      if (error.status === 400) {
        errorMessage = error.error.message || 'Token inválido o registro ya inactivo';
      } else if (error.status === 429) {
        errorMessage = 'Demasiados intentos. Intente más tarde.';
      } else if (error.status === 403) {
        errorMessage = 'No tiene permisos para inactivar registros';
      }

      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });
    } finally {
      this.isSubmitting = false;
    }
  }

  onCancel(): void {
    this.inactivationForm.reset();
    this.charCount = 0;
    this.modalClosed.emit(false);
  }

  get motivoControl(): FormControl {
    return this.inactivationForm.get('motivo_inactivacion') as FormControl;
  }

  get tokenControl(): FormControl {
    return this.inactivationForm.get('token_2fa') as FormControl;
  }

  get isConfirmButtonDisabled(): boolean {
    return !this.inactivationForm.valid || this.isSubmitting;
  }
}
