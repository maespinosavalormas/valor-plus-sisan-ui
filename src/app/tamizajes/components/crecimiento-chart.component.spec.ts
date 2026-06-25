import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrecimientoChartComponent } from './crecimiento-chart.component';

jest.mock('chart.js', () => {
  const Chart = jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
  }));
  (Chart as { register: jest.Mock }).register = jest.fn();
  return { Chart, registerables: [] };
});

describe('CrecimientoChartComponent', () => {
  let component: CrecimientoChartComponent;
  let fixture: ComponentFixture<CrecimientoChartComponent>;

  beforeEach(async () => {
    jest.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (name: string) => {
        const tokens: Record<string, string> = {
          '--warning': '#ef233c',
          '--blue-primary': '#00d7ce',
          '--strong-blue-secondary': '#5981DF',
          '--blue-secondary': '#00c0e6',
          '--gray-secondary': '#E3E3E3',
          '--strong-gray-primary': '#717171',
          '--gray-tertiary': '#7A7A7A',
        };
        return tokens[name] ?? '';
      },
    } as CSSStyleDeclaration);

    await TestBed.configureTestingModule({
      imports: [CrecimientoChartComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(CrecimientoChartComponent);
    component = fixture.componentInstance;
    component.serie = [
      {
        fecha: '2024-06-01',
        zScorePt: -2,
        clasificacionPt: 'MODERADA',
        pesoKg: 8,
        tallaCm: 70,
      },
      {
        fecha: '2024-01-01',
        zScorePt: -1,
        clasificacionPt: 'EUTROFICO',
        pesoKg: 7,
        tallaCm: 68,
      },
    ];
    fixture.detectChanges();
  });

  it('renderiza chart tras view init', () => {
    const canvas = document.createElement('canvas');
    component.chartCanvas = { nativeElement: canvas } as never;
    component.ngAfterViewInit();
    const { Chart } = jest.requireMock('chart.js');
    expect(Chart).toHaveBeenCalled();
  });

  it('re-renderiza al cambiar serie', () => {
    const canvas = document.createElement('canvas');
    component.chartCanvas = { nativeElement: canvas } as never;
    component.ngAfterViewInit();
    const calls = jest.requireMock('chart.js').Chart.mock.calls.length;
    component.ngOnChanges({
      serie: {
        currentValue: component.serie,
        previousValue: [],
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    expect(jest.requireMock('chart.js').Chart.mock.calls.length).toBeGreaterThan(calls);
  });

  it('clasifica colores SEVERA y EUTROFICO en dataset', () => {
    component.serie = [
      {
        fecha: '2024-01-01',
        zScorePt: -3,
        clasificacionPt: 'SEVERA',
        pesoKg: 7,
        tallaCm: 65,
      },
      {
        fecha: '2024-06-01',
        zScorePt: 0,
        clasificacionPt: 'EUTROFICO',
        pesoKg: 9,
        tallaCm: 75,
      },
    ];
    const canvas = document.createElement('canvas');
    component.chartCanvas = { nativeElement: canvas } as never;
    component.ngAfterViewInit();
    const config = jest.requireMock('chart.js').Chart.mock.calls.at(-1)[1];
    expect(config.data.datasets[0].backgroundColor).toEqual(['#ef233c', '#00d7ce']);
  });
});
