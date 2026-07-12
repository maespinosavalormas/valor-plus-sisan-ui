import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, combineLatest, debounceTime, startWith, takeUntil } from 'rxjs';
import { ElsaFacade } from '../../data-access/facade/elsa.facade';
import { initialListQuery } from '../../data-access/elsa.state';
import {
  ElsaListQuery,
  ElsaSortBy,
  ElsaSortDir,
  RiskLevel,
} from '../../data-access/elsa.contracts';

const RISK_LEVELS: RiskLevel[] = ['BAJO', 'MEDIO', 'ALTO'];

@Component({
  selector: 'app-elsa-list-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './elsa-list-page.component.html',
  styleUrls: ['./elsa-list-page.component.scss'],
})
export class ElsaListPageComponent implements OnInit, OnDestroy {
  readonly facade = inject(ElsaFacade);
  readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  readonly riskLevels = RISK_LEVELS;
  readonly displayedColumns = [
    'patientId',
    'evaluationDate',
    'riskNutrition',
    'riskPhysicalActivity',
    'riskAlcohol',
    'metsScore',
    'nutritionScore',
    'alcoholScore',
    'createdAt',
  ];

  readonly patientIdCtrl = new FormControl<string>('', { nonNullable: true });
  readonly riskAlimCtrl = new FormControl<RiskLevel | ''>('', { nonNullable: true });
  readonly riskActividadCtrl = new FormControl<RiskLevel | ''>('', { nonNullable: true });
  readonly riskAlcoholCtrl = new FormControl<RiskLevel | ''>('', { nonNullable: true });
  readonly dateFromCtrl = new FormControl<string>('', { nonNullable: true });
  readonly dateToCtrl = new FormControl<string>('', { nonNullable: true });

  private query: ElsaListQuery = { ...initialListQuery };

  ngOnInit(): void {
    this.facade.cargarLista(this.query);

    combineLatest([
      this.patientIdCtrl.valueChanges.pipe(startWith(this.patientIdCtrl.value)),
      this.riskAlimCtrl.valueChanges.pipe(startWith(this.riskAlimCtrl.value)),
      this.riskActividadCtrl.valueChanges.pipe(startWith(this.riskActividadCtrl.value)),
      this.riskAlcoholCtrl.valueChanges.pipe(startWith(this.riskAlcoholCtrl.value)),
      this.dateFromCtrl.valueChanges.pipe(startWith(this.dateFromCtrl.value)),
      this.dateToCtrl.valueChanges.pipe(startWith(this.dateToCtrl.value)),
    ])
      .pipe(debounceTime(400), takeUntil(this.destroy$))
      .subscribe(([patientId, riskAlim, riskActividad, riskAlcohol, dateFrom, dateTo]) => {
        this.query = {
          ...this.query,
          page: 1,
          patientId: patientId?.trim() || undefined,
          riskAlim: riskAlim || undefined,
          riskActividad: riskActividad || undefined,
          riskAlcohol: riskAlcohol || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        };
        this.facade.cargarLista(this.query);
      });
  }

  onPage(event: PageEvent): void {
    this.query = { ...this.query, page: event.pageIndex + 1, pageSize: event.pageSize };
    this.facade.cargarLista(this.query);
  }

  onSort(sort: Sort): void {
    const sortBy: ElsaSortBy =
      sort.active === 'evaluationDate' ? 'EVALUATION_DATE' : 'CREATED_AT';
    const sortDir: ElsaSortDir = sort.direction === 'asc' ? 'ASC' : 'DESC';
    this.query = { ...this.query, page: 1, sortBy, sortDir };
    this.facade.cargarLista(this.query);
  }

  retry(): void {
    this.facade.cargarLista(this.query);
  }

  goToDetail(id: string): void {
    this.router.navigate(['/estilos-vida', id]);
  }

  goToNew(): void {
    this.router.navigate(['/estilos-vida', 'nuevo']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
