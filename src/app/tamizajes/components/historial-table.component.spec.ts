import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistorialTableComponent } from './historial-table.component';
import { Tamizaje } from '../core/contracts/tamizaje.contracts';

const row = {
  id: 't1',
  fechaTamizaje: '2024-01-01',
  perimetroBraquialCm: 10,
} as Tamizaje;

describe('HistorialTableComponent', () => {
  let component: HistorialTableComponent;
  let fixture: ComponentFixture<HistorialTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialTableComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(HistorialTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('isPbBajo true when pb < 11.5 (CA-08)', () => {
    expect(component.isPbBajo(11)).toBe(true);
    expect(component.isPbBajo(11.5)).toBe(false);
    expect(component.isPbBajo(null)).toBe(false);
  });

  it('onEdit emite tamizaje', () => {
    const spy = jest.fn();
    component.edit.subscribe(spy);
    component.onEdit(row);
    expect(spy).toHaveBeenCalledWith(row);
  });
});
