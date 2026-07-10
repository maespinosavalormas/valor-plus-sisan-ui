import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ElsaInactivationService } from '../../services/elsa-inactivation.service';
import { InactivateElsaDTO } from '../../../../shared/models/inactivate-elsa.model';

@Component({
  selector: 'app-inactivate-elsa-modal',
  templateUrl: './inactivate-elsa-modal.component.html',
  styleUrls: ['./inactivate-elsa-modal.component.scss'],
})
export class InactivateElsaModalComponent implements OnInit, OnDestroy {
  @Input() elsaId: string = '';
  @Input() patientName: string = '';

  form!: FormGroup;
  loading = false;
  error: string | null = null;
  charCount = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private elsaService: ElsaInactivationService,
    public modal: NgbModalRef,
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
      .inactivateElsa(this.elsaId, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (response) => {
          this.loading = false;

          if (response.success) {
            await Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: 'Registro ELSA inactivado correctamente',
              confirmButtonText: 'Aceptar',
              allowOutsideClick: false,
            });

            this.modal.close({ success: true, data: response.data });
            // Reload page or navigate
            location.reload();
          } else {
            this.error = response.error || 'Error al inactivar el registro';
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = this.getErrorMessage(err);
        },
      });
  }

  cancel() {
    this.modal.dismiss('cancel');
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
    return (
      !!this.form.get('motivo_inactivacion')?.touched
    );
  }

  get isTokenTouched(): boolean {
    return !!this.form.get('totp_token')?.touched;
  }

  get isFormValid(): boolean {
    return this.form.valid && !this.loading;
  }
}
