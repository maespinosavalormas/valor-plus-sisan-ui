import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import {
  CreateTamizajeDto,
  EdemaBilateral,
  MenorHeader,
  Tamizaje,
  TallaMedicion,
  UpdateTamizajeDto,
} from '../core/contracts/tamizaje.contracts';

@Component({
  selector: 'app-tamizaje-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './tamizaje-form.component.html',
  styleUrl: './tamizaje-form.component.scss',
})
export class TamizajeFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() menor: MenorHeader | null = null;
  @Input() editingTamizaje: Tamizaje | null = null;
  @Input() saving = false;
  @Input() disabled = false;
  @Input() casoId = '';
  @Input() bivConfirmRequired = false;
  @Output() submitForm = new EventEmitter<CreateTamizajeDto | UpdateTamizajeDto>();

  form!: FormGroup;
  showTallaWarning = false;
  pbOptional = false;
  private destroy$ = new Subject<void>();
  private draftKey = '';
  private submitLocked = false;

  readonly edemaOptions: { value: EdemaBilateral; label: string }[] = [
    { value: 0, label: 'Sin edema' },
    { value: 1, label: 'Edema +' },
    { value: 2, label: 'Edema ++' },
    { value: 3, label: 'Edema +++' },
  ];

  readonly tallaMedicionOptions: { value: TallaMedicion; label: string }[] = [
    { value: 'L', label: 'Acostado (L)' },
    { value: 'H', label: 'De pie (H)' },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.draftKey = `tamizaje-draft-${this.casoId}`;
    this.buildForm();
    this.restoreDraft();
    this.form.valueChanges.pipe(debounceTime(400), takeUntil(this.destroy$)).subscribe(() => {
      this.persistDraft();
    });
    this.form.get('tallaMedicion')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateTallaWarning();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['menor']) {
      this.updatePbState();
      this.updateTallaWarning();
    }
    if (changes['editingTamizaje']) {
      this.patchFromEditing();
    }
    if (changes['casoId'] && !changes['casoId'].firstChange) {
      this.draftKey = `tamizaje-draft-${this.casoId}`;
      this.restoreDraft();
    }
    if (changes['saving'] && !this.saving) {
      this.submitLocked = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isEditMode(): boolean {
    return !!this.editingTamizaje;
  }

  get motivoRequired(): boolean {
    if (!this.editingTamizaje) {
      return false;
    }
    const peso = Number(this.form.get('pesoKg')?.value);
    const talla = Number(this.form.get('tallaCm')?.value);
    return peso !== this.editingTamizaje.pesoKg || talla !== this.editingTamizaje.tallaCm;
  }

  onSubmit(): void {
    if (this.form.invalid || this.disabled || this.saving || this.submitLocked) {
      if (this.form.invalid) {
        this.form.markAllAsTouched();
      }
      return;
    }
    this.submitLocked = true;

    const raw = this.form.getRawValue();
    const dto: CreateTamizajeDto = {
      fechaTamizaje: raw.fechaTamizaje,
      pesoKg: Number(raw.pesoKg),
      tallaCm: Number(raw.tallaCm),
      tallaMedicion: raw.tallaMedicion,
      perimetroBraquialCm: raw.perimetroBraquialCm ? Number(raw.perimetroBraquialCm) : null,
      edemaBilateral: Number(raw.edemaBilateral) as EdemaBilateral,
      fuenteDato: 'WEB',
      confirmacionBiv: raw.confirmacionBiv || undefined,
    };

    if (this.isEditMode) {
      const updateDto: UpdateTamizajeDto = {
        ...dto,
        motivoEdicion: raw.motivoEdicion || undefined,
      };
      if (this.motivoRequired && !updateDto.motivoEdicion) {
        this.form.get('motivoEdicion')?.setErrors({ required: true });
        return;
      }
      this.confirmBivIfNeeded(() => this.submitForm.emit(updateDto));
    } else {
      this.confirmBivIfNeeded(() => this.submitForm.emit(dto));
    }
  }

  onNumericInput(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/[^0-9.,]/g, '').replace(',', '.');
    if (input.value !== sanitized) {
      input.value = sanitized;
      this.form.get(controlName)?.setValue(sanitized);
    }
  }

  private buildForm(): void {
    const today = new Date().toISOString().slice(0, 10);
    this.form = this.fb.group({
      fechaTamizaje: [today, Validators.required],
      pesoKg: ['', [Validators.required, Validators.min(0.01)]],
      tallaCm: ['', [Validators.required, Validators.min(0.01)]],
      tallaMedicion: ['L' as TallaMedicion, Validators.required],
      perimetroBraquialCm: [''],
      edemaBilateral: [0 as EdemaBilateral, Validators.required],
      motivoEdicion: [''],
      confirmacionBiv: [false],
    });
  }

  private patchFromEditing(): void {
    if (!this.form) {
      return;
    }
    if (!this.editingTamizaje) {
      this.form.reset({
        fechaTamizaje: new Date().toISOString().slice(0, 10),
        pesoKg: '',
        tallaCm: '',
        tallaMedicion: 'L',
        perimetroBraquialCm: '',
        edemaBilateral: 0,
        motivoEdicion: '',
        confirmacionBiv: false,
      });
      return;
    }
    const t = this.editingTamizaje;
    this.form.patchValue({
      fechaTamizaje: t.fechaTamizaje.slice(0, 10),
      pesoKg: t.pesoKg,
      tallaCm: t.tallaCm,
      tallaMedicion: t.tallaMedicion,
      perimetroBraquialCm: t.perimetroBraquialCm ?? '',
      edemaBilateral: t.edemaBilateral,
      motivoEdicion: t.motivoEdicion ?? '',
      confirmacionBiv: false,
    });
  }

  private updatePbState(): void {
    const meses = this.menor?.edadActualMeses ?? 0;
    this.pbOptional = meses < 6 || meses > 59;
    const pbControl = this.form?.get('perimetroBraquialCm');
    if (!pbControl) {
      return;
    }
    if (this.pbOptional) {
      pbControl.disable({ emitEvent: false });
    } else {
      pbControl.enable({ emitEvent: false });
    }
  }

  private updateTallaWarning(): void {
    const meses = this.menor?.edadActualMeses ?? 0;
    const medicion = this.form?.get('tallaMedicion')?.value;
    this.showTallaWarning = meses < 24 && medicion === 'H';
  }

  private persistDraft(): void {
    if (!this.casoId || this.isEditMode) {
      return;
    }
    try {
      localStorage.setItem(this.draftKey, JSON.stringify(this.form.getRawValue()));
    } catch {
      /* ignore quota errors */
    }
  }

  private restoreDraft(): void {
    if (!this.casoId || this.isEditMode) {
      return;
    }
    try {
      const raw = localStorage.getItem(this.draftKey);
      if (raw) {
        this.form.patchValue(JSON.parse(raw));
      }
    } catch {
      /* ignore parse errors */
    }
  }

  clearDraft(): void {
    localStorage.removeItem(this.draftKey);
  }

  private confirmBivIfNeeded(callback: () => void): void {
    const needsDialog =
      this.editingTamizaje?.bivFlag || this.bivConfirmRequired || this.form.get('confirmacionBiv')?.value;

    if (!needsDialog) {
      callback();
      return;
    }

    if (this.form.get('confirmacionBiv')?.value) {
      callback();
      return;
    }

    const ref = this.dialog.open(BivConfirmDialogComponent, {
      data: {},
      panelClass: 'biv-dialog-panel',
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.form.patchValue({ confirmacionBiv: true });
        callback();
      }
    });
  }
}

@Component({
  selector: 'app-biv-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose],
  template: `
    <div data-testid="biv-dialog">
      <h2 mat-dialog-title>Valor biológicamente implausible (BIV)</h2>
      <mat-dialog-content>
        El Z-score está fuera del rango esperado. ¿Confirma el registro?
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" data-testid="biv-dialog-cancel" [mat-dialog-close]="false">
          Cancelar
        </button>
        <button mat-flat-button color="warn" type="button" data-testid="biv-dialog-confirm" [mat-dialog-close]="true">
          Confirmar
        </button>
      </mat-dialog-actions>
    </div>
  `,
})
export class BivConfirmDialogComponent {}
