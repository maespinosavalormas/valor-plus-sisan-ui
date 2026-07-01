import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

/**
 * Header del expediente evolutivo
 * CA-04: Días en programa
 * CA-10: Sparkline ΔZ de alto contraste con tooltips (accesibilidad)
 */
@Component({
  selector: 'app-evolutionary-header',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTooltipModule,
    MatIconModule,
  ],
  template: `
    <mat-card class="header-card" role="region" aria-label="Resumen del expediente evolutivo" data-testid="evolutionary-header">
      <div class="header-content">
        <!-- Días en programa (CA-04) -->
        <div class="dias-container" role="status" aria-live="polite" data-testid="header-dias">
          <span class="dias-numero" [attr.aria-label]="diasEnPrograma + ' días en el programa'">
            {{ diasEnPrograma }}
          </span>
          <span class="dias-label">días en programa</span>
        </div>

        <!-- Sparkline ΔZ con tooltips (CA-10) -->
        <div class="sparkline-container" *ngIf="sparklineData?.length" role="img" 
             [attr.aria-label]="'Gráfico de evolución de Z-score: ' + descripcionSparkline"
             data-testid="header-sparkline">
          <h4 id="sparkline-title">Evolución ΔZ-score</h4>
          <div class="sparkline-wrapper" role="figure" aria-labelledby="sparkline-title">
            <svg viewBox="0 0 400 80" preserveAspectRatio="none" class="sparkline-svg"
                 [attr.aria-describedby]="'sparkline-desc'">
              <!-- Fondo con bandas de referencia -->
              <rect x="0" y="0" width="400" height="20" fill="#e8f5e9" opacity="0.5" />
              <rect x="0" y="20" width="400" height="40" fill="#fff8e1" opacity="0.5" />
              <rect x="0" y="60" width="400" height="20" fill="#ffebee" opacity="0.5" />
              
              <!-- Línea de referencia Z=0 -->
              <line x1="0" y1="40" x2="400" y2="40" stroke="#666" stroke-width="1" stroke-dasharray="4,4" />
              
              <!-- Línea de datos con alto contraste -->
              <polyline
                [attr.points]="generateSparklinePoints()"
                fill="none"
                stroke="#1565c0"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round" />
              
              <!-- Puntos interactivos con tooltips -->
              <circle
                *ngFor="let punto of puntosSparkline; let i = index"
                [attr.cx]="punto.x"
                [attr.cy]="punto.y"
                r="6"
                fill="#0d47a1"
                class="sparkline-point"
                role="button"
                [matTooltip]="punto.tooltip"
                matTooltipPosition="above"
                tabindex="0"
                (keydown.enter)="onPointFocus(i)"
                [attr.aria-label]="punto.ariaLabel" />
            </svg>
            <p id="sparkline-desc" class="visually-hidden">
              {{ descripcionSparkline }}
            </p>
          </div>
          
          <!-- Leyenda de accesibilidad -->
          <div class="sparkline-legend" role="list" aria-label="Leyenda del gráfico">
            <div class="legend-item" role="listitem">
              <span class="legend-color" style="background: #e8f5e9;"></span>
              <span>Z-score normal (-2 a +2)</span>
            </div>
            <div class="legend-item" role="listitem">
              <span class="legend-color" style="background: #fff8e1;"></span>
              <span>Riesgo leve (moderado)</span>
            </div>
            <div class="legend-item" role="listitem">
              <span class="legend-color" style="background: #ffebee;"></span>
              <span>Desnutrición severa (Z < -3)</span>
            </div>
          </div>
        </div>

        <!-- Estado actual del caso -->
        <div class="estado-container" role="status" data-testid="header-estado">
          <span class="estado-badge" [class]="'estado-' + estadoActual?.toLowerCase()" data-testid="header-estado-badge">
            {{ estadoActual }}
          </span>
          <span class="estado-label">Estado actual</span>
        </div>
      </div>
    </mat-card>
  `,
  styles: [`
    .header-card {
      margin-bottom: 16px;
      padding: 16px;
    }
    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 32px;
      flex-wrap: wrap;
    }
    .dias-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 140px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    .dias-numero {
      font-size: 56px;
      font-weight: 700;
      color: #1565c0;
      line-height: 1;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }
    .dias-label {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.7);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 8px;
      font-weight: 500;
    }
    .sparkline-container {
      flex: 1;
      min-width: 300px;
    }
    .sparkline-container h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: rgba(0, 0, 0, 0.8);
      font-weight: 500;
    }
    .sparkline-wrapper {
      position: relative;
      height: 80px;
      background: #fafafa;
      border-radius: 4px;
      padding: 8px;
    }
    .sparkline-svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    .sparkline-point {
      cursor: pointer;
      transition: r 0.2s, fill 0.2s;
    }
    .sparkline-point:hover, .sparkline-point:focus {
      r: 8;
      fill: #d32f2f;
      outline: none;
    }
    .sparkline-legend {
      display: flex;
      gap: 16px;
      margin-top: 8px;
      font-size: 12px;
      flex-wrap: wrap;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 3px;
      border: 1px solid rgba(0,0,0,0.1);
    }
    .estado-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      min-width: 120px;
    }
    .estado-badge {
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .estado-activo { background: #e3f2fd; color: #1565c0; }
    .estado-recuperado { background: #e8f5e9; color: #2e7d32; }
    .estado-fallecido { background: #f5f5f5; color: #616161; }
    .estado-abandono { background: #fff3e0; color: #ef6c00; }
    .estado-traslado { background: #f3e5f5; color: #7b1fa2; }
    .estado-label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }
    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: stretch;
      }
      .sparkline-container {
        min-width: auto;
        order: -1;
      }
    }
  `],
})
export class EvolutionaryHeaderComponent {
  @Input() diasEnPrograma = 0;
  @Input() sparklineData: { fecha: string; deltaZ: number }[] = [];
  @Input() estadoActual: string = 'ACTIVO';

  puntosSparkline: { x: number; y: number; tooltip: string; ariaLabel: string }[] = [];

  ngOnInit(): void {
    this.calcularPuntosSparkline();
  }

  ngOnChanges(): void {
    this.calcularPuntosSparkline();
  }

  private calcularPuntosSparkline(): void {
    if (!this.sparklineData?.length) {
      this.puntosSparkline = [];
      return;
    }

    const width = 400;
    const height = 80;
    const padding = 10;
    const minDelta = Math.min(...this.sparklineData.map((d) => d.deltaZ), -4);
    const maxDelta = Math.max(...this.sparklineData.map((d) => d.deltaZ), 2);
    const range = maxDelta - minDelta || 1;
    const stepX = (width - 2 * padding) / (this.sparklineData.length - 1 || 1);

    this.puntosSparkline = this.sparklineData.map((d, i) => {
      const x = padding + i * stepX;
      const normalizedY = ((d.deltaZ - minDelta) / range) * (height - 2 * padding);
      const y = height - padding - normalizedY;
      const fecha = new Date(d.fecha).toLocaleDateString('es-CO');
      
      return {
        x,
        y,
        tooltip: `Fecha: ${fecha}\nΔZ-score: ${d.deltaZ.toFixed(2)}`,
        ariaLabel: `Punto ${i + 1}: Fecha ${fecha}, cambio en Z-score ${d.deltaZ.toFixed(2)}`,
      };
    });
  }

  generateSparklinePoints(): string {
    return this.puntosSparkline.map((p) => `${p.x},${p.y}`).join(' ');
  }

  get descripcionSparkline(): string {
    if (!this.sparklineData?.length) return 'Sin datos de evolución';
    const ultimo = this.sparklineData[this.sparklineData.length - 1];
    const primero = this.sparklineData[0];
    const tendencia = ultimo.deltaZ > primero.deltaZ ? 'mejoría' : 'deterioro';
    return `Serie de ${this.sparklineData.length} mediciones. Tendencia: ${tendencia}. Último valor: ${ultimo.deltaZ.toFixed(2)}`;
  }

  onPointFocus(index: number): void {
    // Handler para navegación por teclado (accesibilidad)
    console.log('Punto seleccionado:', this.sparklineData[index]);
  }
}
