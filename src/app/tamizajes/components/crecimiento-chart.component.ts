import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { TamizajePunto } from '../core/contracts/tamizaje.contracts';

Chart.register(...registerables);

@Component({
  selector: 'app-crecimiento-chart',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './crecimiento-chart.component.html',
  styleUrl: './crecimiento-chart.component.scss',
})
export class CrecimientoChartComponent implements OnChanges, AfterViewInit {
  @Input() serie: TamizajePunto[] = [];
  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['serie'] && this.chartCanvas) {
      this.renderChart();
    }
  }

  private renderChart(): void {
    if (!this.chartCanvas?.nativeElement) {
      return;
    }

    const sorted = [...this.serie].sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );
    const labels = sorted.map((p) => p.fecha.slice(0, 10));
    const data = sorted.map((p) => p.zScorePt);
    const colors = sorted.map((p) => classificationColor(p.clasificacionPt));

    const lineColor = cssVar('--blue-primary');
    const gridColor = cssVar('--gray-secondary');
    const alertColor = cssVar('--warning');

    this.chart?.destroy();

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Z-score P/T',
            data,
            borderColor: lineColor,
            backgroundColor: colors,
            pointBackgroundColor: colors,
            pointRadius: 6,
            tension: 0.2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, labels: { color: cssVar('--strong-gray-primary') } },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (ctx) => `Z: ${ctx.parsed.y?.toFixed(2)}`,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: cssVar('--gray-tertiary') },
            grid: { color: gridColor },
          },
          y: {
            min: -4,
            max: 4,
            ticks: { color: cssVar('--gray-tertiary') },
            grid: {
              color: (ctx) =>
                ctx.tick.value === -2 || ctx.tick.value === -3 ? alertColor : gridColor,
            },
          },
        },
      },
    };

    this.chart = new Chart(this.chartCanvas.nativeElement, config);
  }
}

function cssVar(name: string, fallback = ''): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function classificationColor(clasificacion: string): string {
  switch (clasificacion) {
    case 'SEVERA':
      return cssVar('--warning');
    case 'MODERADA':
      return cssVar('--strong-blue-secondary', cssVar('--blue-secondary'));
    default:
      return cssVar('--blue-primary');
  }
}
