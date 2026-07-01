import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FollowUpWallComponent } from './follow-up-wall.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SeguimientoEvolutivo, TIPO_ICONOS } from '../data-access/follow-up.contracts';
import { By } from '@angular/platform-browser';

describe('FollowUpWallComponent (T6)', () => {
  let component: FollowUpWallComponent;
  let fixture: ComponentFixture<FollowUpWallComponent>;

  const mockSeguimientos: SeguimientoEvolutivo[] = [
    {
      uuid: 's1',
      casoId: 'c1',
      tipo: 'MEDICA',
      texto: 'Nota 1',
      textoEscapado: true,
      autor: { id: 'a1', nombre: 'Dr. A', cargo: 'Médico' },
      fechaHora: '2024-01-01T10:00:00Z',
      createdAt: '2024-01-01T10:00:00Z',
    },
    {
      uuid: 's2',
      casoId: 'c1',
      tipo: 'NUTRICIONAL',
      texto: 'Cambio a recuperado',
      textoEscapado: true,
      autor: { id: 'a2', nombre: 'Dr. B', cargo: 'Nutricionista' },
      fechaHora: '2024-01-02T10:00:00Z',
      createdAt: '2024-01-02T10:00:00Z',
    },
    {
      uuid: 's3',
      casoId: 'c1',
      tipo: 'SOCIAL',
      texto: 'Evidencia adjunta',
      textoEscapado: true,
      autor: { id: 'a3', nombre: 'Enf. C', cargo: 'Enfermera' },
      fechaHora: '2024-01-03T10:00:00Z',
      evidenciaUuid: 'ev-1',
      createdAt: '2024-01-03T10:00:00Z',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FollowUpWallComponent,
        MatCardModule,
        MatIconModule,
        MatChipsModule,
        MatButtonModule,
        ScrollingModule,
        BrowserAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FollowUpWallComponent);
    component = fixture.componentInstance;
    component.seguimientos = mockSeguimientos;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Paginación diferida', () => {
    it('should show "Cargar más" button when hasMore is true', () => {
      component.hasMore = true;
      fixture.detectChanges();
      const button = fixture.debugElement.query(By.css('.load-more-container button'));
      expect(button).toBeTruthy();
    });

    it('should emit cargarMas when clicking load more', () => {
      const spy = jest.spyOn(component.cargarMas, 'emit');
      component.hasMore = true;
      fixture.detectChanges();
      const button = fixture.debugElement.query(By.css('.load-more-container button'));
      button.nativeElement.click();
      expect(spy).toHaveBeenCalled();
    });

    it('should disable load more button when loading', () => {
      component.hasMore = true;
      component.loading = true;
      fixture.detectChanges();
      const button = fixture.debugElement.query(By.css('.load-more-container button'));
      expect(button.nativeElement.disabled).toBe(true);
    });
  });

  describe('Filtros por tipo', () => {
    it('should list all filter chips', () => {
      const chips = fixture.debugElement.queryAll(By.css('.filter-chips mat-chip-option'));
      expect(chips.length).toBe(4); // 3 tipos + Todos
    });

    it('should emit filtrar with correct tipo when chip clicked', () => {
      const spy = jest.spyOn(component.filtrar, 'emit');
      const chips = fixture.debugElement.queryAll(By.css('.filter-chips mat-chip-option'));
      chips[0].nativeElement.click();
      expect(spy).toHaveBeenCalledWith('MEDICA');
    });
  });

  describe('Badge color e iconos (CA-08)', () => {
    it('should return correct icon for each tipo', () => {
      expect(component.getIcono('MEDICA')).toBe(TIPO_ICONOS['MEDICA'].icono);
      expect(component.getIcono('NUTRICIONAL')).toBe(TIPO_ICONOS['NUTRICIONAL'].icono);
      expect(component.getIcono('SOCIAL')).toBe(TIPO_ICONOS['SOCIAL'].icono);
    });

    it('should return correct color for each tipo', () => {
      expect(component.getColor('MEDICA')).toBe(TIPO_ICONOS['MEDICA'].color);
      expect(component.getColor('NUTRICIONAL')).toBe(TIPO_ICONOS['NUTRICIONAL'].color);
      expect(component.getColor('SOCIAL')).toBe(TIPO_ICONOS['SOCIAL'].color);
    });
  });

  describe('TrackBy', () => {
    it('should track by uuid', () => {
      expect(component.trackByFn(0, mockSeguimientos[0])).toBe('s1');
    });
  });
});
