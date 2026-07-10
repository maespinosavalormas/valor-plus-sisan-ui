import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

interface SeverityItem{
  title:string
  description:string
  value:number
  icon:string
  type:string
}

interface MunicipioData {
  municipio: string;
  casos: number;
}

interface MunicipalityData {
  name: string;
  cases: number;
}

interface StatsData {
  totalCases: number;
  activeCases: number;
  resolvedCases: number;
  pendingCases: number;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  resolutionRate?: number;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements AfterViewInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(async () => {
        if (typeof document !== 'undefined') {
          const { TrendChart } = await import('../ui/trend-chart/trend-chart.component');
          const { PieChart } = await import('../ui/category-chart/category-chart.component');
          const trendChart = new TrendChart();
          const pieChart = new PieChart();
          trendChart.init();
          pieChart.init();
        }
      }, 0);
    }
  }

  onPeriodChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    // Handle period change if needed
  }
  severityData:SeverityItem[]=[

    {
      title:'Casos Severos',
      description:'Requieren intervención inmediata',
      value:28,
      icon:'fa-solid fa-triangle-exclamation',
      type:'severe'
    },

    {
      title:'Casos Moderados',
      description:'En tratamiento activo',
      value:62,
      icon:'fa-solid fa-wave-square',
      type:'moderate'
    },

    {
      title:'En Riesgo',
      description:'Monitoreo preventivo',
      value:45,
      icon:'fa-solid fa-users',
      type:'risk'
    }
  ]

  municipioData: MunicipioData[] = [
    { municipio: 'Medellín', casos: 45 },
    { municipio: 'Envigado', casos: 28 },
    { municipio: 'Bello', casos: 31 },
    { municipio: 'Itagüí', casos: 17 },
    { municipio: 'Sabaneta', casos: 15 },
    { municipio: 'Caldas', casos: 13 }
  ];

  maxValue = 60;
  xAxisTicks = [0, 15, 30, 45, 60];

  getBarWidth(casos: number): number {
    return (casos / this.maxValue) * 100;
  }
}
