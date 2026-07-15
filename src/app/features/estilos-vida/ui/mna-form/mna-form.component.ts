import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, Subject, combineLatest, merge, of } from 'rxjs';
import { map, shareReplay, startWith, takeUntil, timeout, catchError, distinctUntilChanged } from 'rxjs/operators';
import { MnaService, CreateMnaRequest } from '../../data-access/services/mna.service';

@Component({
  selector: 'app-mna-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mna-form.component.html',
  styleUrls: ['./mna-form.component.scss'],
})
export class MnaFormComponent implements OnInit, OnDestroy {
  @Input() patientId: string;
  @Input() tenantId: string;
  @Input() token: string;

  form: FormGroup;
  screeningScore$: Observable<number>;
  scoreTotal$: Observable<number>;
  assessmentRequired$: Observable<boolean>;
  classification$: Observable<'NORMAL' | 'RISK' | 'MALNUTRITION'>;
  error$: Observable<string | null> = of(null);
  successMessage$: Observable<string | null> = of(null);
  timeoutError$: Observable<string | null> = of(null);
  isOnline$: Observable<boolean>;

  saveDisabled = false;
  touched = false;

  private destroy$ = new Subject<void>();

  screeningQuestions = [
    { key: 'A', label: 'Pérdida de apetito (últimas 3 semanas)', options: [{ label: 'No', value: 0 }, { label: 'Sí', value: 1 }, { label: 'Mucha pérdida', value: 2 }] },
    { key: 'B', label: 'Pérdida de peso (últimas 3 semanas)', options: [{ label: '< 3 kg', value: 0 }, { label: '3-6 kg', value: 1 }, { label: '> 6 kg', value: 2 }, { label: 'No sabe', value: 3 }] },
    { key: 'C', label: 'Movilidad', options: [{ label: 'Normal', value: 0 }, { label: 'Cama/Silla > 5h', value: 1 }, { label: 'Encamado', value: 2 }] },
    { key: 'D', label: 'Estrés psicológico reciente', options: [{ label: 'No', value: 0 }, { label: 'Sí', value: 2 }] },
    { key: 'E', label: 'Problemas neuropsicológicos', options: [{ label: 'No', value: 0 }, { label: 'Leve', value: 1 }, { label: 'Severo', value: 2 }] },
    { key: 'F', label: 'IMC (peso/altura²)', options: [{ label: 'IMC < 19', value: 0 }, { label: '19 ≤ IMC < 21', value: 1 }, { label: '21 ≤ IMC < 23', value: 2 }, { label: 'IMC ≥ 23', value: 3 }] },
  ];

  assessmentQuestions = [
    { key: 'G', label: 'Vive independiente', options: [{ label: 'Sí', value: 1 }, { label: 'No', value: 0 }] },
    { key: 'H', label: 'Toma más de 3 medicamentos/día', options: [{ label: 'No', value: 0 }, { label: 'Sí', value: 1 }] },
    { key: 'I', label: 'Úlceras/lesiones de piel', options: [{ label: 'No', value: 0 }, { label: 'Sí', value: 3 }] },
    { key: 'J', label: 'Cuántas comidas completas al día', options: [{ label: 'Menos de 1', value: 0 }, { label: '1', value: 1 }, { label: '2', value: 2 }, { label: '3', value: 3 }] },
    { key: 'K', label: 'Consume productos lácteos/día', options: [{ label: 'No', value: 0 }, { label: 'Sí', value: 1 }] },
    { key: 'L', label: 'Consume proteína/día (huevo, carne, etc)', options: [{ label: 'No', value: 0 }, { label: 'Sí', value: 0.5 }] },
    { key: 'M', label: 'Consume frutas/verduras/día', options: [{ label: 'No', value: 0 }, { label: 'Sí', value: 1 }] },
    { key: 'N', label: 'Modo de alimentación', options: [{ label: 'Por sonda', value: 0 }, { label: 'Ayuda necesaria', value: 1 }, { label: 'Independiente', value: 2 }] },
    { key: 'O', label: 'Percepción del estado nutricional', options: [{ label: 'Peor que otros', value: 0 }, { label: 'Igual a otros', value: 1 }, { label: 'Mejor que otros', value: 2 }] },
    { key: 'P', label: 'Comparación de peso con hace 3 meses', options: [{ label: 'Más bajo', value: 0 }, { label: 'Igual', value: 1 }, { label: 'Más alto', value: 2 }] },
    { key: 'Q', label: 'Altura (cm)', options: [] },
    { key: 'R', label: 'Peso actual (kg)', options: [] },
  ];

  constructor(
    private fb: FormBuilder,
    private mnaService: MnaService,
  ) {
    this.form = this.buildForm();
  }

  ngOnInit(): void {
    this.screeningScore$ = this.form.valueChanges.pipe(
      startWith(this.form.value),
      map((val) => this.calculateScreeningScore(val)),
      shareReplay(1),
    );

    this.assessmentRequired$ = this.screeningScore$.pipe(
      map((score) => score <= 11),
      distinctUntilChanged(),
    );

    this.scoreTotal$ = combineLatest([
      this.form.valueChanges.pipe(startWith(this.form.value)),
      this.screeningScore$,
    ]).pipe(
      map(([val, screeningScore]) =>
        this.calculateTotalScore(val, screeningScore),
      ),
    );

    this.classification$ = this.scoreTotal$.pipe(
      map((total) => this.mnaService.classifyOMS(total)),
    );

    this.isOnline$ = merge(
      of(navigator.onLine),
      // @ts-ignore
      fromEvent(window, 'online').pipe(map(() => true)),
      // @ts-ignore
      fromEvent(window, 'offline').pipe(map(() => false)),
    );

    this.setupFormValidation();
  }

  buildForm(): FormGroup {
    const group: any = { patientId: [this.patientId, Validators.required] };
    for (const q of this.screeningQuestions) {
      group[`question${q.key}`] = ['', Validators.required];
    }
    for (const q of this.assessmentQuestions) {
      group[`question${q.key}`] = [''];
    }
    group['useCCWhenBedridden'] = [false];
    return this.fb.group(group);
  }

  setupFormValidation(): void {
    this.assessmentRequired$
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
      )
      .subscribe((required) => {
        const assessmentKeys = ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'];
        assessmentKeys.forEach((key) => {
          const control = this.form.get(`question${key}`);
          if (required) {
            control.setValidators(Validators.required);
          } else {
            control.clearValidators();
          }
          control.updateValueAndValidity({ emitEvent: false });
        });
      });
  }

  calculateScreeningScore(values: any): number {
    const keys = ['A', 'B', 'C', 'D', 'E', 'F'];
    return keys.reduce((sum, key) => sum + (parseFloat(values[`question${key}`]) || 0), 0);
  }

  calculateTotalScore(values: any, screeningScore: number): number {
    return this.mnaService.calculateTotalScore(
      this.formValuesToMap(values),
      screeningScore,
    );
  }

  private formValuesToMap(values: any): Record<string, number> {
    const map: Record<string, number> = {};
    for (const q of [...this.screeningQuestions, ...this.assessmentQuestions]) {
      const val = parseFloat(values[`question${q.key}`]);
      if (!isNaN(val)) {
        map[q.key] = val;
      }
    }
    return map;
  }

  onSave(): void {
    if (this.form.invalid) {
      this.error$ = of('Por favor complete todos los campos requeridos');
      return;
    }

    this.saveDisabled = true;
    const answersMap = this.formValuesToMap(this.form.value);
    const payload: CreateMnaRequest = {
      patientId: this.patientId,
      answers: Object.entries(answersMap).map(([key, value]) => ({
        questionKey: key,
        value: value as number,
      })),
    };

    this.mnaService
      .createMna(payload, this.tenantId, this.token)
      .pipe(
        timeout(30000),
        catchError((err) => {
          if (err.name === 'TimeoutError') {
            localStorage.setItem('mna_draft', JSON.stringify(this.form.value));
            this.timeoutError$ = of('Timeout. Datos guardados localmente. Intente nuevamente cuando tenga conexión.');
          }
          return throwError(() => err);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (res) => {
          this.successMessage$ = of(
            `Formulario guardado. Score: ${res.scoreTotal} (${this.mnaService.getClassificationLabel(res.classification)})`,
          );
          setTimeout(() => this.form.reset(), 2000);
        },
        error: (err) => {
          if (err?.error?.message) {
            this.error$ = of(err.error.message);
          } else {
            localStorage.setItem('mna_draft', JSON.stringify(this.form.value));
            this.error$ = of('Error al guardar. Datos salvados localmente.');
          }
        },
        finalize: () => {
          this.saveDisabled = false;
        },
      });
  }

  onReset(): void {
    this.form.reset();
    this.touched = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

import { fromEvent } from 'rxjs';
import { throwError } from 'rxjs';
