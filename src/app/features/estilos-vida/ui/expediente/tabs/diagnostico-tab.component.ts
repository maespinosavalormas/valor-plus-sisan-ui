import { Component, Input, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CalculatedMetrics } from '../../../data-access/services/mna-expediente.service';

declare const echarts: unknown;

@Component({
  selector: 'app-diagnostico-tab',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tab2-container">
      <!-- Sección: Métricas WHO -->
      <div class="info-section">
        <div class="section-header">
          <div class="section-icon">
            <mat-icon>analytics</mat-icon>
          </div>
          <div class="section-title">
            <h4>Métricas WHO - Diagnóstico</h4>
          </div>
        </div>
        <div class="section-content">
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
      </div>
    </div>
  `,
  styles: [`
    .tab2-container {
      padding: 0;
    }

    .info-section {
      margin-bottom: 20px;

      .section-header {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 0 10px 12px;
        background-color: var(--white);
        border-radius: 8px 8px 0 0;
        border-bottom: 1px solid var(--gray-primary);

        .section-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: var(--blue-primary);
          flex-shrink: 0;

          mat-icon {
            font-size: 24px;
            color: var(--white);
          }
        }

        .section-title {
          flex: 1;

          h4 {
            font-size: 16px;
            font-weight: 600;
            color: var(--strong-blue-primary);
            line-height: 1.3;
            margin: 0;
          }
        }
      }

      .section-content {
        padding: 16px 20px;
        background-color: var(--white);
        border-radius: 0 0 8px 8px;
      }
    }

    .gauges-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .gauge-card {
      background: var(--white);
      border: 1px solid var(--gray-secondary);
      border-radius: 8px;
      padding: 16px;
      text-align: center;

      h4 {
        margin: 0 0 16px 0;
        color: var(--strong-gray-primary);
        font-size: 14px;
        font-weight: 500;
      }
    }

    .chart-container {
      width: 100%;
      height: 250px;
    }

    .level-label {
      margin-top: 16px;
      font-weight: 600;
      font-size: 14px;
      padding: 8px 12px;
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
      color: var(--strong-gray-primary);
      background: var(--background-pages);
    }

    .metrics-info {
      background: var(--background-pages);
      padding: 16px;
      border-radius: 6px;
      font-size: 13px;
      color: var(--strong-gray-primary);

      p {
        margin: 6px 0;
      }
    }

    @media (max-width: 768px) {
      .info-section {
        .section-header {
          padding: 0 8px 10px;

          .section-icon {
            width: 36px;
            height: 36px;

            mat-icon {
              font-size: 20px;
            }
          }

          .section-title h4 {
            font-size: 14px;
          }
        }

        .section-content {
          padding: 12px 16px;
        }
      }

      .gauges-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .gauge-card {
        padding: 12px;

        h4 {
          font-size: 13px;
        }
      }

      .chart-container {
        height: 200px;
      }

      .metrics-info {
        padding: 12px;
        font-size: 12px;
      }
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
