import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReportsFormComponent } from '../reports-form/reports-form.component';

interface Report {
  id: string;
  title: string;
  description: string;
  query: string;
}

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [CommonModule, MatInputModule, MatButtonModule, MatIconModule, FormsModule, MatDialogModule],
  templateUrl: './reports-list.component.html',
  styleUrls: ['./reports-list.component.scss']
})
export class ReportsListComponent {
  searchTerm: string = '';

  constructor(private router: Router) {}

  reports: Report[] = [
    {
      id: '1',
      title: 'Casos de Medellin y Envigado',
      description:
        'Reporte detallado de casos de desnutrición en los municipios de Medellín y Envigado, incluyendo distribución por edad y severidad.',
      query:
        "SELECT m.nombre AS municipio, COUNT(c.id) AS total_casos, AVG(EXTRACT(YEAR FROM AGE(p.fecha_nacimiento))) AS edad_promedio, c.severidad FROM casos c JOIN pacientes p ON c.paciente_id = p.id JOIN municipios m ON p.municipio_id = m.id WHERE m.nombre IN ('Medellín', 'Envigado') GROUP BY m.nombre, c.severidad ORDER BY total_casos DESC;",
    },
    {
      id: '2',
      title: 'Casos por Grupo Etario',
      description:
        'Distribución de casos de desnutrición agrupados por rangos de edad, útil para identificar poblaciones más vulnerables.',
      query:
        "SELECT CASE WHEN EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) < 1 THEN '0-1 años' WHEN EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) BETWEEN 1 AND 5 THEN '1-5 años' WHEN EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) BETWEEN 6 AND 12 THEN '6-12 años' WHEN EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) BETWEEN 13 AND 18 THEN '13-18 años' ELSE 'Adultos' END AS grupo_etario, COUNT(c.id) AS total_casos, AVG(c.peso_actual / POWER(c.talla_actual/100, 2)) AS imc_promedio FROM casos c JOIN pacientes p ON c.paciente_id = p.id GROUP BY grupo_etario ORDER BY total_casos DESC;",
    },
    {
      id: '3',
      title: 'Casos por Severidad',
      description:
        'Clasificación de casos según nivel de severidad (leve, moderada, severa), incluyendo indicadores de recuperación.',
      query:
        'SELECT c.severidad, COUNT(c.id) AS total_casos, COUNT(CASE WHEN c.estado = \'recuperado\' THEN 1 END) AS recuperados, COUNT(CASE WHEN c.estado = \'activo\' THEN 1 END) AS activos, ROUND(COUNT(CASE WHEN c.estado = \'recuperado\' THEN 1 END)::decimal / COUNT(c.id) * 100, 2) AS tasa_recuperacion FROM casos c GROUP BY c.severidad ORDER BY total_casos DESC;',
    },
    {
      id: '4',
      title: 'Tendencia Mensual de Casos',
      description:
        'Evolución temporal de nuevos casos de desnutrición reportados por mes, permitiendo identificar patrones estacionales.',
      query:
        "SELECT DATE_TRUNC('month', c.fecha_diagnostico) AS mes, COUNT(c.id) AS nuevos_casos, c.severidad FROM casos c WHERE c.fecha_diagnostico >= NOW() - INTERVAL '12 months' GROUP BY mes, c.severidad ORDER BY mes DESC;",
    },
    {
      id: '5',
      title: 'Municipios Más Afectados',
      description:
        'Ranking de municipios con mayor incidencia de casos de desnutrición, incluyendo densidad poblacional.',
      query:
        'SELECT m.nombre AS municipio, m.poblacion, COUNT(c.id) AS total_casos, ROUND(COUNT(c.id)::decimal / m.poblacion * 1000, 2) AS casos_por_mil_habitantes FROM casos c JOIN pacientes p ON c.paciente_id = p.id JOIN municipios m ON p.municipio_id = m.id GROUP BY m.nombre, m.poblacion ORDER BY casos_por_mil_habitantes DESC LIMIT 10;',
    },
    {
      id: '6',
      title: 'Efectividad de Programas Nutricionales',
      description:
        'Evaluación del impacto de los diferentes programas nutricionales en la recuperación de pacientes.',
      query:
        'SELECT pr.nombre AS programa, COUNT(c.id) AS total_pacientes, COUNT(CASE WHEN c.estado = \'recuperado\' THEN 1 END) AS recuperados, ROUND(COUNT(CASE WHEN c.estado = \'recuperado\' THEN 1 END)::decimal / COUNT(c.id) * 100, 2) AS efectividad, AVG(EXTRACT(DAY FROM (c.fecha_recuperacion - c.fecha_diagnostico))) AS dias_promedio_recuperacion FROM casos c JOIN programas pr ON c.programa_id = pr.id WHERE c.estado = \'recuperado\' GROUP BY pr.nombre ORDER BY efectividad DESC;',
    },
  ];

  get filteredReports(): Report[] {
    if (!this.searchTerm.trim()) {
      return this.reports;
    }
    const term = this.searchTerm.toLowerCase();
    return this.reports.filter(
      (r) =>
        r.title.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term)
    );
  }

  get resultsLabel(): string {
    const count = this.filteredReports.length;
    return count === 1
      ? '1 reporte encontrado'
      : `${count} reportes encontrados`;
  }

  trackByFn(index: number, item: Report) {
    return item.id;
  }

  onView(report: Report): void {
    this.router.navigate(['/reports/view-reports-page'], {
      queryParams: { reportId: report.id },
    });
  }

  onDownload(report: Report): void {
    console.log('Descargar reporte:', report.title);
    // Aqui puedes disparar la descarga del archivo
  }
}
