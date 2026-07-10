import { Component, ViewChild, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgramHeaderComponent } from '../../ui/program-details-header/program-details-header';

export interface ScheduleItem {
  id: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  responsible: string;
  priority: 'low' | 'medium' | 'high';
}

@Component({
  selector: 'app-programs-schedule',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressBarModule,
    FormsModule,
    ProgramHeaderComponent
  ],
  templateUrl: './programs-schedule.component.html',
  styleUrl: './programs-schedule.component.scss'
})
export class ProgramsScheduleComponent {
  @ViewChild('timelineHeader', { read: ElementRef }) timelineHeader!: ElementRef;
  @ViewChild('scrollContainer', { read: ElementRef }) scrollContainer!: ElementRef;
  
  program: any = null;
  scheduleItems: ScheduleItem[] = [];
  filteredItems: ScheduleItem[] = [];
  selectedStatus: string = '';
  selectedPriority: string = 'all';
  
  // Filtros de período
  selectedPeriod: string = 'month';
  selectedWeek: string | number = 'all';
  selectedMonth: string | number = 'all';
  selectedYear: string | number = 'all';
  
  // Opciones para los filtros
  weeks: { value: number; label: string }[] = [];
  months: { value: number; label: string }[] = [];
  years: number[] = [];

  // CONSTANTES DE ANCHO - DEBEN COINCIDIR CON EL CSS
  private readonly YEAR_WIDTH = 240;   // px por año en vista anual
  private readonly MONTH_WIDTH = 80;   // px por mes en vista mensual
  private readonly DAY_WIDTH = 30;     // px por día en vista diaria

  // Redimensionamiento del contenedor de información
  infoContainerWidth: number = 400; // Ancho inicial aumentado
  private isResizing: boolean = false;
  private startX: number = 0;
  private startWidth: number = 0;
  private readonly MIN_WIDTH = 300;   // Reducido para permitir más expansión
  private readonly MAX_WIDTH = 2000;   // Aumentado para permitir más contenido

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private renderer: Renderer2
  ) {
    this.initializeFilterOptions();
  }

  ngOnInit(): void {
    const programId = this.route.snapshot.paramMap.get('id');
    this.loadProgram(programId);
    this.loadScheduleItems();
  }

  initializeFilterOptions(): void {
    // Generar semanas (52 semanas del año)
    this.weeks = [];
    for (let i = 1; i <= 52; i++) {
      this.weeks.push({
        value: i,
        label: `Semana ${i}`
      });
    }

    // Generar meses
    this.months = [
      { value: 1, label: 'Enero' },
      { value: 2, label: 'Febrero' },
      { value: 3, label: 'Marzo' },
      { value: 4, label: 'Abril' },
      { value: 5, label: 'Mayo' },
      { value: 6, label: 'Junio' },
      { value: 7, label: 'Julio' },
      { value: 8, label: 'Agosto' },
      { value: 9, label: 'Septiembre' },
      { value: 10, label: 'Octubre' },
      { value: 11, label: 'Noviembre' },
      { value: 12, label: 'Diciembre' }
    ];

    // Generar años (actual y 3 años siguientes)
    const currentYear = new Date().getFullYear();
    this.years = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
  }

  loadProgram(id: string | null): void {
    if (id) {
      // Mock: datos de ejemplo
      this.program = {
        id: id,
        name: 'Programa de Nutrición Infantil',
        status: 'ACTIVE'
      };
    }
  }

  loadScheduleItems(): void {
    // Mock: datos de ejemplo del cronograma
    this.scheduleItems = [
      {
        id: 1,
        title: 'Evaluación Inicial',
        description: 'Evaluación del estado nutricional de los beneficiarios',
        startDate: new Date('2025-01-14'),
        endDate: new Date('2025-01-29'),
        status: 'completed',
        responsible: 'Dr. Carlos Méndez',
        priority: 'high'
      },
      {
        id: 2,
        title: 'Capacitación Personal',
        description: 'Capacitación del personal de salud en nutrición infantil',
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-02-15'),
        status: 'completed',
        responsible: 'Lic. María González',
        priority: 'medium'
      },
      {
        id: 3,
        title: 'Distribución Suplementos',
        description: 'Entrega de suplementos alimenticios a beneficiarios',
        startDate: new Date('2025-02-16'),
        endDate: new Date('2025-03-31'),
        status: 'in-progress',
        responsible: 'Nut. Ana López',
        priority: 'high'
      },
      {
        id: 4,
        title: 'Seguimiento Mensual',
        description: 'Monitoreo del progreso de los beneficiarios',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-12-31'),
        status: 'in-progress',
        responsible: 'Dr. Carlos Méndez',
        priority: 'medium'
      },
      {
        id: 5,
        title: 'Evaluación Final',
        description: 'Evaluación de resultados del programa',
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-31'),
        status: 'pending',
        responsible: 'Lic. María González',
        priority: 'high'
      }
    ];
    this.filterItems();
  }

  onBackClick(): void {
    this.router.navigate(['/programs']);
  }

  onViewChange(view: string): void {
    if (view === 'info') {
      this.router.navigate(['/programs', this.program.id]);
    } else if (view === 'tasks') {
      this.router.navigate(['/programs', this.program.id, 'tasks']);
    } else if (view === 'traceability') {
      this.router.navigate(['/programs', this.program.id, 'traceability']);
    }
  }

  /**
   * Sincroniza el scroll horizontal del contenedor principal con el header
   */
  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const scrollLeft = target.scrollLeft;
    
    // Sincronizar el header del timeline
    if (this.timelineHeader && this.timelineHeader.nativeElement) {
      this.timelineHeader.nativeElement.scrollLeft = scrollLeft;
    }
  }

  /**
   * Sincroniza el scroll del header con el contenedor principal
   */
  onHeaderScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const scrollLeft = target.scrollLeft;
    
    // Sincronizar el contenedor de scroll principal
    if (this.scrollContainer && this.scrollContainer.nativeElement) {
      this.scrollContainer.nativeElement.scrollLeft = scrollLeft;
    }
  }

  /**
   * Calcula el ancho total del timeline basado en la vista actual
   */
  getTimelineWidth(): number {
    if (this.selectedYear === 'all') {
      // Vista anual: YEAR_WIDTH * número de años
      return this.years.length * this.YEAR_WIDTH;
    } else if (this.selectedMonth === 'all') {
      // Vista mensual: MONTH_WIDTH * 12 meses
      return 12 * this.MONTH_WIDTH;
    } else {
      // Vista diaria: DAY_WIDTH * días del mes
      const filterMonth = typeof this.selectedMonth === 'string' ? parseInt(this.selectedMonth) : this.selectedMonth;
      const filterYear = typeof this.selectedYear === 'string' ? parseInt(this.selectedYear) : this.selectedYear;
      const daysInMonth = new Date(filterYear, filterMonth, 0).getDate();
      return daysInMonth * this.DAY_WIDTH;
    }
  }

  /**
   * Inicia el redimensionamiento del contenedor de información
   */
  onResizeStart(event: MouseEvent): void {
    event.preventDefault();
    this.isResizing = true;
    this.startX = event.clientX;
    this.startWidth = this.infoContainerWidth;
    
    // Agregar clase al gantt-card para cambiar el cursor
    const ganttCard = document.querySelector('.gantt-card');
    if (ganttCard) {
      this.renderer.addClass(ganttCard, 'resizing');
    }
  }

  /**
   * Maneja el movimiento del mouse durante el redimensionamiento
   */
  @HostListener('document:mousemove', ['$event'])
  onResize(event: MouseEvent): void {
    if (!this.isResizing) return;
    
    const deltaX = event.clientX - this.startX;
    const newWidth = this.startWidth + deltaX;
    
    // Aplicar límites de ancho
    if (newWidth >= this.MIN_WIDTH && newWidth <= this.MAX_WIDTH) {
      this.infoContainerWidth = newWidth;
    }
  }

  /**
   * Finaliza el redimensionamiento
   */
  @HostListener('document:mouseup')
  onResizeEnd(): void {
    if (this.isResizing) {
      this.isResizing = false;
      
      // Remover clase del gantt-card
      const ganttCard = document.querySelector('.gantt-card');
      if (ganttCard) {
        this.renderer.removeClass(ganttCard, 'resizing');
      }
    }
  }

  filterItems(): void {
    this.filteredItems = this.scheduleItems.filter(item => {
      const statusMatch = this.selectedStatus === '' || item.status === this.selectedStatus;
      const priorityMatch = this.selectedPriority === 'all' || item.priority === this.selectedPriority;
      
      // Filtrar por período
      let periodMatch = true;
      const itemDate = new Date(item.startDate);
      
      if (this.selectedPeriod === 'week') {
        periodMatch = this.isItemInWeek(itemDate, this.selectedWeek, this.selectedYear);
      } else if (this.selectedPeriod === 'month') {
        periodMatch = this.isItemInMonth(itemDate, this.selectedMonth, this.selectedYear);
      } else if (this.selectedPeriod === 'year') {
        periodMatch = this.isItemInYear(itemDate, this.selectedYear);
      }
      
      return statusMatch && priorityMatch && periodMatch;
    });
  }

  onStatusFilterChange(status: string): void {
    this.selectedStatus = status;
    this.filterItems();
  }

  onPeriodFilterChange(period: string): void {
    this.selectedPeriod = period;
    this.filterItems();
  }

  onWeekFilterChange(week: string | number): void {
    this.selectedWeek = week;
    this.filterItems();
  }

  onMonthFilterChange(month: string | number): void {
    this.selectedMonth = month;
    this.filterItems();
  }

  onYearFilterChange(year: string | number): void {
    this.selectedYear = year;
    this.filterItems();
  }

  clearFilters(): void {
    this.selectedStatus = '';
    this.selectedYear = 'all';
    this.selectedMonth = 'all';
    this.filterItems();
  }

  // Métodos de ayuda para filtrado por período
  isItemInWeek(date: Date, week: string | number, year: string | number): boolean {
    const itemYear = date.getFullYear();
    const filterYear = typeof year === 'string' ? parseInt(year) : year;
    
    if (itemYear !== filterYear) return false;
    
    if (week === 'all') return true;
    
    const filterWeek = typeof week === 'string' ? parseInt(week) : week;
    
    // Método simple para calcular semana del año
    const startOfYear = new Date(filterYear, 0, 1);
    const daysSinceStart = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((daysSinceStart + startOfYear.getDay() + 1) / 7);
    
    return weekNumber === filterWeek;
  }

  isItemInMonth(date: Date, month: string | number, year: string | number): boolean {
    const itemMonth = date.getMonth() + 1; // getMonth() retorna 0-11, sumamos 1 para 1-12
    const itemYear = date.getFullYear();
    const filterMonth = typeof month === 'string' ? parseInt(month) : month;
    const filterYear = typeof year === 'string' ? parseInt(year) : year;
    
    if (month === 'all' && year === 'all') return true;
    if (month === 'all') return itemYear === filterYear;
    if (year === 'all') return itemMonth === filterMonth;
    
    return itemMonth === filterMonth && itemYear === filterYear;
  }

  isItemInYear(date: Date, year: string | number): boolean {
    const filterYear = typeof year === 'string' ? parseInt(year) : year;
    return date.getFullYear() === filterYear;
  }

  getWeeksInMonth(month: string | number, year: string | number): { value: number; label: string }[] {
    const filterMonth = typeof month === 'string' ? parseInt(month) : month;
    const filterYear = typeof year === 'string' ? parseInt(year) : year;
    
    const firstDay = new Date(filterYear, filterMonth - 1, 1);
    const lastDay = new Date(filterYear, filterMonth, 0);
    const daysInMonth = lastDay.getDate();
    
    const weeks: { value: number; label: string }[] = [];
    
    // Calcular semanas correctamente basadas en el calendario
    let currentWeek = 1;
    let weekStart = 1;
    
    while (weekStart <= daysInMonth) {
      weeks.push({
        value: currentWeek,
        label: `Semana ${currentWeek}`
      });
      
      // Calcular el inicio de la siguiente semana
      const weekStartDay = new Date(filterYear, filterMonth - 1, weekStart);
      const dayOfWeek = weekStartDay.getDay(); // 0 = Domingo, 1 = Lunes, etc.
      
      // Calcular cuántos días faltan para llegar al domingo (6) o al final del mes
      let daysUntilSunday = 6 - dayOfWeek;
      if (dayOfWeek === 0) {
        daysUntilSunday = 6; // Si es domingo, la semana va hasta el siguiente sábado
      }
      
      weekStart += daysUntilSunday + 1;
      currentWeek++;
    }
    
    return weeks;
  }

  getDaysInMonth(month: string | number, year: string | number): number[] {
    const filterMonth = typeof month === 'string' ? parseInt(month) : month;
    const filterYear = typeof year === 'string' ? parseInt(year) : year;
    const lastDay = new Date(filterYear, filterMonth, 0);
    const daysInMonth = lastDay.getDate();
    const days: number[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'completed':
        return 'status-completed';
      case 'in-progress':
        return 'status-in-progress';
      case 'delayed':
        return 'status-delayed';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-pending';
    }
  }

  getStatusLabel(status: string): string {
    switch(status) {
      case 'completed':
        return 'Completado';
      case 'in-progress':
        return 'En Progreso';
      case 'delayed':
        return 'Retrasado';
      case 'pending':
        return 'Pendiente';
      default:
        return 'Pendiente';
    }
  }

  getPriorityClass(priority: string): string {
    switch(priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  }

  getPriorityLabel(priority: string): string {
    switch(priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return 'Media';
    }
  }

  addScheduleItem(): void {
    // TODO: Implementar diálogo para agregar nuevo ítem
    console.log('Agregar nuevo ítem al cronograma');
  }

  editScheduleItem(item: ScheduleItem): void {
    // TODO: Implementar diálogo para editar ítem
    console.log('Editar ítem:', item);
  }

  deleteScheduleItem(item: ScheduleItem): void {
    // TODO: Implementar confirmación y eliminación
    console.log('Eliminar ítem:', item);
  }

  /**
   * Calcula el estilo (posición y ancho) de la barra de tareas
   * SINCRONIZADO CON LAS CONSTANTES DEL CSS
   */
  getTaskBarStyle(item: ScheduleItem): any {
    const startDate = new Date(item.startDate);
    const endDate = new Date(item.endDate);
    
    let leftPosition = 0;
    let width = 40; 
    
    // ========== VISTA POR AÑOS ==========
    // Cada año ocupa YEAR_WIDTH px (240px)
    if (this.selectedYear === 'all') {
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();
      const yearIndex = this.years.indexOf(startYear);
      
      if (yearIndex !== -1) {
        // Calcular posición de inicio
        const startMonth = startDate.getMonth();
        const startDay = startDate.getDate();
        const daysInStartMonth = new Date(startYear, startMonth + 1, 0).getDate();
        const monthFraction = (startMonth + (startDay / daysInStartMonth)) / 12;
        
        leftPosition = (yearIndex * this.YEAR_WIDTH) + (monthFraction * this.YEAR_WIDTH);
        
        // Calcular ancho en años
        const yearsDiff = endYear - startYear;
        const endMonth = endDate.getMonth();
        const endDay = endDate.getDate();
        const daysInEndMonth = new Date(endYear, endMonth + 1, 0).getDate();
        const endMonthFraction = (endMonth + (endDay / daysInEndMonth)) / 12;
        
        const totalYearFraction = yearsDiff + endMonthFraction - monthFraction;
        width = totalYearFraction * this.YEAR_WIDTH;
      }
      
    // ========== VISTA POR MESES (año específico, mes = 'all') ==========
    // Cada mes ocupa MONTH_WIDTH px (80px)
    } else if (this.selectedMonth === 'all') {
      const startMonth = startDate.getMonth(); // 0-11
      const endMonth = endDate.getMonth();
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();
      const filterYear = typeof this.selectedYear === 'string' ? parseInt(this.selectedYear) : this.selectedYear;
      
      // Solo mostrar si la tarea está en el año filtrado
      if (startYear === filterYear || endYear === filterYear) {
        // Calcular posición de inicio
        const startDay = startDate.getDate();
        const daysInStartMonth = new Date(startYear, startMonth + 1, 0).getDate();
        const dayFraction = startDay / daysInStartMonth;
        
        leftPosition = (startMonth * this.MONTH_WIDTH) + (dayFraction * this.MONTH_WIDTH);
        
        // Calcular ancho
        if (startYear === endYear) {
          // Mismo año: calcular diferencia de meses
          const monthsDiff = endMonth - startMonth;
          const endDay = endDate.getDate();
          const daysInEndMonth = new Date(endYear, endMonth + 1, 0).getDate();
          const endDayFraction = endDay / daysInEndMonth;
          
          width = (monthsDiff * this.MONTH_WIDTH) + (endDayFraction * this.MONTH_WIDTH) - (dayFraction * this.MONTH_WIDTH);
        } else {
          // Diferentes años: mostrar desde el mes de inicio hasta diciembre
          width = ((12 - startMonth) * this.MONTH_WIDTH) - (dayFraction * this.MONTH_WIDTH);
        }
      } else {
        // Ocultar si no está en el año filtrado
        leftPosition = -9999;
        width = 0;
      }
      
    // ========== VISTA POR DÍAS (año y mes específicos) ==========
    } else {
      const filterMonth = typeof this.selectedMonth === 'string' ? parseInt(this.selectedMonth) : this.selectedMonth;
      const filterYear = typeof this.selectedYear === 'string' ? parseInt(this.selectedYear) : this.selectedYear;
      
      const startMonth = startDate.getMonth() + 1; 
      const startYear = startDate.getFullYear();
      const startDay = startDate.getDate();
      
      const endMonth = endDate.getMonth() + 1;
      const endYear = endDate.getFullYear();
      const endDay = endDate.getDate();
      
      // Solo mostrar barras del mes y año seleccionados
      if (startMonth === filterMonth && startYear === filterYear) {
        // Posición de inicio (día - 1 porque los índices empiezan en 0)
        leftPosition = (startDay - 1) * this.DAY_WIDTH;
        
        // Calcular ancho
        if (endMonth === filterMonth && endYear === filterYear) {
          // La tarea termina en el mismo mes
          const daysDiff = endDay - startDay + 1; // +1 para incluir el último día
          width = daysDiff * this.DAY_WIDTH;
        } else {
          // La tarea se extiende más allá del mes actual
          const daysInMonth = new Date(filterYear, filterMonth, 0).getDate();
          width = (daysInMonth - startDay + 1) * this.DAY_WIDTH;
        }
      } else if (endMonth === filterMonth && endYear === filterYear && startYear < filterYear || (startYear === filterYear && startMonth < filterMonth)) {
        // La tarea empezó antes pero termina en este mes
        leftPosition = 0;
        width = endDay * this.DAY_WIDTH;
      } else if (startYear < filterYear || (startYear === filterYear && startMonth < filterMonth) && 
                 (endYear > filterYear || (endYear === filterYear && endMonth > filterMonth))) {
        // La tarea atraviesa todo el mes
        const daysInMonth = new Date(filterYear, filterMonth, 0).getDate();
        leftPosition = 0;
        width = daysInMonth * this.DAY_WIDTH;
      } else {
        leftPosition = -9999;
        width = 0;
      }
    }
    
    return {
      'left': `${leftPosition}px`,
      'width': `${Math.max(width, 40)}px` 
    };
  }

  getWeekNumber(date: Date, month: number, year: number): number {
    const firstDay = new Date(year, month - 1, 1);
    const dayOfMonth = date.getDate();
    return Math.ceil((dayOfMonth + firstDay.getDay()) / 7);
  }

  getTaskDuration(item: ScheduleItem): string {
    const start = new Date(item.startDate);
    const end = new Date(item.endDate);
    
    // Asegurar que las fechas sean válidas
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Fecha inválida';
    }
    
    // Calcular diferencia en milisegundos y convertir a días
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    // Validar que el resultado sea razonable
    if (diffDays < 0) return '0 días';
    if (diffDays > 3650) return 'Más de 10 años'; // Límite de 10 años
    
    if (diffDays === 1) return '1 día';
    return `${diffDays} días`;
  }

  getProgressPercentage(item: ScheduleItem): number {
    switch(item.status) {
      case 'completed':
        return 100;
      case 'in-progress':
        return 60;
      case 'delayed':
        return 30;
      case 'pending':
        return 0;
      default:
        return 0;
    }
  }

  getProgressClass(status: string): string {
    switch(status) {
      case 'completed':
        return 'progress-complete';
      case 'in-progress':
        return 'progress-in-progress';
      case 'delayed':
        return 'progress-delayed';
      case 'pending':
        return 'progress-pending';
      default:
        return 'progress-pending';
    }
  }
}