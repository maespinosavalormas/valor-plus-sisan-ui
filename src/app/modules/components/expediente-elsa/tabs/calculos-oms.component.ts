import { Component, Input } from '@angular/core';
import { CalculosOMS } from '../../../models';

@Component({
  selector: 'app-calculos-oms',
  template: `
    <div class="calculos-container" *ngIf="calculos">
      <div class="irev-card" [ngClass]="'color-' + calculos.color">
        <h2 data-testid="irev-value">{{ calculos.interpretacion }}</h2>
        <div class="irev-score" [attr.data-testid]="'irev-color-' + calculos.color">
          IREV = {{ calculos.irev }} / 4
        </div>
      </div>

      <div class="gauge-grid">
        <div class="gauge-card">
          <h3>METs Semanales</h3>
          <div class="gauge-value">{{ calculos.mets_categoria }}</div>
          <p>{{ calculos.af_mets_totales }} METs</p>
        </div>
        <div class="gauge-card">
          <h3>Porciones Diarias</h3>
          <div class="gauge-value">{{ calculos.porciones_diarias_categoria }}</div>
          <p>{{ calculos.alim_total_porciones_dia }} porciones</p>
        </div>
        <div class="gauge-card">
          <h3>AUDIT-C</h3>
          <div class="gauge-value">{{ calculos.audit_c_interpretacion }}</div>
          <p>Score: {{ calculos.audit_c_score }}</p>
        </div>
      </div>

      <div class="risk-factors">
        <h3>Factores de Riesgo Identificados:</h3>
        <ul>
          <li *ngIf="calculos.factores_riesgo.tabaco">✓ Tabaco</li>
          <li *ngIf="calculos.factores_riesgo.dieta">✓ Dieta Desbalanceada</li>
          <li *ngIf="calculos.factores_riesgo.actividad">✓ Actividad Física Insuficiente</li>
          <li *ngIf="calculos.factores_riesgo.alcohol">✓ Consumo Riesgoso de Alcohol</li>
        </ul>
      </div>
    </div>
  `,
  styles: [
    `
      .calculos-container {
        padding: 20px;
      }
      .irev-card {
        padding: 30px;
        border-radius: 8px;
        margin-bottom: 30px;
        color: white;
        text-align: center;
      }
      .irev-card.color-verde {
        background-color: #4caf50;
      }
      .irev-card.color-amarillo {
        background-color: #ffb74d;
      }
      .irev-card.color-naranja {
        background-color: #ff9800;
        color: white;
      }
      .irev-card.color-rojo {
        background-color: #f44336;
      }
      .irev-score {
        font-size: 24px;
        font-weight: bold;
        margin-top: 10px;
      }
      .gauge-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }
      .gauge-card {
        border: 1px solid #ccc;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
      }
      .gauge-value {
        font-size: 18px;
        font-weight: bold;
        color: #1976d2;
        margin: 10px 0;
      }
      .risk-factors {
        background-color: #fff3e0;
        padding: 20px;
        border-left: 4px solid #ff9800;
        border-radius: 4px;
      }
      .risk-factors ul {
        list-style: none;
        padding: 0;
      }
      .risk-factors li {
        padding: 5px 0;
      }
    `,
  ],
})
export class CalculosOmsComponent {
  @Input() calculos: CalculosOMS;
}
