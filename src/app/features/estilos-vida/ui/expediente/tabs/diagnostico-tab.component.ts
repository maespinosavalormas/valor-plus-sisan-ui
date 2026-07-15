import { Component, Input, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculatedMetrics } from '../../../data-access/services/mna-expediente.service';

declare const echarts: unknown;

@Component({
  selector: 'app-diagnostico-tab',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tab2-container">
      <h3>Métricas WHO - Diagnóstico</h3>
      
      <div class="gauges-grid">
        <!-- Gauge Sarcopenia Risk -->
        <div class="gauge-card" data-testid="gauge-sarcopenia-risk">
          <h4>Riesgo de Sarcopenia (EWGSOP 2019)</h4>
          <div #sarcopeniaGauge id="sarcopenia-gauge" class="chart-container"></div>
          <p class="level-label" [class]="'level-' + this.metrics.riesgo_sarcopenia_color">
            {{ this.metrics.riesgo_sarcopenia_calculado }}
          </p>
        </div>

        <!-- Gauge ICDI -->
        <div class="gauge-card" data-testid="gauge-icdi-ingesta">
          <h4>Diversidad Dietética (ICDI - OMS 2021)</h4>
          <div #icdiGauge id="icdi-gauge" class="chart-container"></div>
          <p class="level-label" [class]="'level-' + this.metrics.clasificacion_ingesta_color">
            {{ this.metrics.clasificacion_ingesta }} ({{ this.metrics.porcentaje_ingesta_icdi }}%)
          </p>
        </div>
      </div>

      <div class="metrics-info">
        <p><strong>EWGSOP 2019:</strong> Evaluación de riesgo de pérdida muscular basada en movilidad, perímetros y pérdida de peso.</p>
        <p><strong>OMS DDS 2021:</strong> Índice de diversidad dietética basado en 9 grupos de alimentos.</p>
      </div>
    </div>
  `,
  styles: [`
    .tab2-container {
      padding: 0.5rem;
    }

    h3 {
      color: #333;
      border-bottom: 2px solid #1976d2;
      padding-bottom: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .gauges-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .gauge-card {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
    }

    .gauge-card h4 {
      margin: 0 0 1rem 0;
      color: #555;
      font-size: 0.95rem;
    }

    .chart-container {
      width: 100%;
      height: 250px;
    }

    .level-label {
      margin-top: 1rem;
      font-weight: 600;
      font-size: 1rem;
      padding: 0.5rem;
      border-radius: 4px;
    }

    .level-verde {
      color: #2e7d32;
      background: #e8f5e9;
    }

    .level-amarillo {
      color: #f57f17;
      background: #fff8e1;
    }

    .level-naranja {
      color: #ef6c00;
      background: #fff3e0;
    }

    .level-rojo {
      color: #c62828;
      background: #ffebee;
    }

    .level-gris {
      color: #757575;
      background: #f5f5f5;
    }

    .metrics-info {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 6px;
      font-size: 0.85rem;
      color: #666;
    }

    .metrics-info p {
      margin: 0.25rem 0;
    }
  `],
})
export class DiagnosticoTabComponent implements OnInit, OnDestroy {
  @Input() metrics!: CalculatedMetrics;

  private sarcopeniaChart: unknown | null = null;
  private icdiChart: unknown | null = null;

  ngOnInit(): void {
    this.initCharts();
  }

  ngOnDestroy(): void {
    this.sarcopeniaChart?.dispose();
    this.icdiChart?.dispose();
  }

  private initCharts(): void {
    if (typeof window === 'undefined' || !window.echarts) {
      console.warn('echarts not loaded');
      return;
    }

    // Sarcopenia Gauge
    this.sarcopeniaChart = echarts.init(document.getElementById('sarcopenia-gauge'));
    this.updateSarcopeniaGauge();

    // ICDI Gauge
    this.icdiChart = echarts.init(document.getElementById('icdi-gauge'));
    this.updateIcdiGauge();
  }

  private updateSarcopeniaGauge(): void {
    if (!this.sarcopeniaChart) return;

    const level = this.this.metrics.riesgo_sarcopenia_calculado;
    const color = this.getScoreColor(this.this.metrics.riesgo_sarcopenia_color);

    // Mapear nivel a score 0-12
    let score = 0;
    if (level.includes('Alto')) score = 2;
    else if (level.includes('Moderado')) score = 5;
    else if (level.includes('Bajo')) score = 8;
    else score = 11;

    this.sarcopeniaChart.setOption({
      series: [{
        type: 'gauge',
        min: 0,
        max: 12,
        progress: { show: true, width: 18 },
        axisLine: {
          lineStyle: {
            width: 18,
            color: [
              [0.25, color],
              [0.5, '#ff9800'],
              [0.75, '#ffc107'],
              [1, '#4caf50'],
            ],
          },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 16,
          formatter: '{value}/12',
          color: '#333',
        },
        data: [{ value: score, name: 'Riesgo Sarcopenia' }],
      }],
      ariaLabel: `Riesgo sarcopenia: ${level}, valor ${score} de 12`,
    });
  }

  private updateIcdiGauge(): void {
    if (!this.icdiChart) return;

    const percentage = this.this.metrics.porcentaje_ingesta_icdi;
    const color = this.getScoreColor(this.this.metrics.clasificacion_ingesta_color);

    this.icdiChart.setOption({
      series: [{
        type: 'gauge',
        min: 0,
        max: 100,
        progress: { show: true, width: 18 },
        axisLine: {
          lineStyle: {
            width: 18,
            color: [
              [0.25, '#f44336'],
              [0.5, '#ff9800'],
              [0.75, '#ffc107'],
              [1, '#4caf50'],
            ],
          },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 16,
          formatter: '{value}%',
          color: '#333',
        },
        data: [{ value: percentage, name: 'ICDI' }],
      }],
      ariaLabel: `ICDI ingesta: ${percentage}%, clasificación: ${this.this.metrics.clasificacion_ingesta}`,
    });
  }

  private getScoreColor(colorName: string): string {
    const colors: Record<string, string> = {
      verde: '#4caf50',
      amarillo: '#ffc107',
      naranja: '#ff9800',
      rojo: '#f44336',
      gris: '#9e9e9e',
    };
    return colors[colorName] || '#9e9e9e';
  }
}
