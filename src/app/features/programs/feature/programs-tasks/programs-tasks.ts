import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';

import { MatButtonModule } from '@angular/material/button';

import { MatDialog } from '@angular/material/dialog';

import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ActivatedRoute, Router } from '@angular/router';

import { ProgramHeaderComponent } from '../../ui/program-details-header/program-details-header';

import { TaskFormComponent } from '../../ui/task-form/task-form';

import { ConfirmDialogService } from '../../ui/confirm-dialog/confirm-dialog';



// Interfaz para las tareas

export interface Task {

  id: number;

  numeroActividad: string;

  nombreActividad: string;

  fechaInicio: string;

  fechaFin: string;


  description: string;

  status: string;

  date: string;

  icon: string;

  showActions: boolean;

  priority: string;

  title: string;

  responsable?: string | string[];

}



@Component({

  selector: 'app-programs-tasks',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    MatIconModule,

    MatButtonModule,

    MatProgressBarModule,

    ProgramHeaderComponent,

  ],

  templateUrl: './programs-tasks.html',

  styleUrls: ['./programs-tasks.scss']

})

export class ProgramsTasksComponent {

  program: any = null;



  // Datos mock de tareas para demostración

  mockTasks: Task[] = [

    {

      id: 1,

      title: 'Evaluación inicial',

      numeroActividad: 'ACT-001',

      nombreActividad: 'Evaluación nutricional inicial',

      fechaInicio: '2024-01-15',

      fechaFin: '2024-01-20',


      description: 'Realizar evaluación de estado nutricional de los beneficiarios',

      status: 'Terminada',

      priority: 'alta',

      date: '2024-01-15',

      icon: 'assessment',

      showActions: false,

      responsable: 'Juan Pérez, María García'

    },

    {

      id: 2,

      title: 'Entrega de suplementos',

      numeroActividad: 'ACT-002',

      nombreActividad: 'Distribución de suplementos nutricionales',

      fechaInicio: '2024-01-20',

      fechaFin: '2024-01-25',


      description: 'Distribuir suplementos nutricionales según protocolo establecido',

      status: 'En progreso',

      priority: 'media',

      date: '2024-01-20',

      icon: 'inventory',

      showActions: false,

      responsable: 'Carlos Rodríguez, Ana López'

    },

    {

      id: 3,

      title: 'Seguimiento mensual',

      numeroActividad: 'ACT-003',

      nombreActividad: 'Monitoreo y seguimiento nutricional',

      fechaInicio: '2024-02-01',

      fechaFin: '2024-02-15',


      description: 'Monitorear progreso y ajustar tratamiento si es necesario',

      status: 'Pendiente',

      priority: 'baja',

      date: '2024-02-01',

      icon: 'trending_up',

      showActions: false,

      responsable: 'Luis Martínez, Sofía Torres'

    }

  ];



  constructor(

    private route: ActivatedRoute,

    private router: Router,

    private dialog: MatDialog,

    private confirmDialogService: ConfirmDialogService

  ) {}



  ngOnInit(): void {

    // Obtener el ID del programa de la ruta

    const programId = this.route.snapshot.paramMap.get('id');

    

    // Mock: buscar programa por ID (aquí irías a tu servicio)

    this.loadProgram(programId);

  }



  loadProgram(id: string | null): void {

    // Mock: datos de ejemplo

    if (id) {

      this.program = {

        id: id,

        name: 'Programa de Nutrición Infantil',

        description: 'Programa integral de nutrición infantil enfocado en la prevención y tratamiento de la desnutrición en niños menores de 5 años en comunidades vulnerables.',

        status: 'ACTIVE',

        applications: 45,

        effectivenessRate: 78,

        startDate: '2024-01-01',

        endDate: '2024-12-31'

      };

    }

  }



  goBack(): void {

    this.router.navigate(['/programs']);

  }



  goToDetails(): void {

    if (this.program) {

      this.router.navigate(['/programs', this.program.id]);

    }

  }

  goToTraceability(): void {
    if (this.program) {
      this.router.navigate(['/programs', this.program.id, 'traceability']);
    }
  }

  goToSchedule(): void {
    if (this.program) {
      this.router.navigate(['/programs', this.program.id, 'schedule']);
    }
  }

  onViewChange(view: 'info' | 'tasks' | 'traceability' | 'schedule'): void {
    if (view === 'info') {
      this.goToDetails();
    } else if (view === 'traceability') {
      this.goToTraceability();
    } else if (view === 'schedule') {
      this.goToSchedule();
    }
  }

  createTask(): void {

    if (this.program) {

      const dialogRef = this.dialog.open(TaskFormComponent, {

        width: '70%',

        maxWidth: '2000px',

        data: { programId: this.program.id, isEdit: false }

      });



      dialogRef.afterClosed().subscribe((result: any) => {

        if (result) {

          console.log('Nueva tarea creada:', result);

          // Agregar la tarea a la lista local

          this.mockTasks.push({

            id: Date.now(),

            title: result.nombreActividad || result.title || '',

            numeroActividad: 'ACT-' + (this.mockTasks.length + 1).toString().padStart(3, '0'),

            nombreActividad: result.nombreActividad || result.nombreActividad || '',

            fechaInicio: result.fechaInicio || result.fechaInicio || '',

            fechaFin: result.fechaFin || result.fechaFin || '',


            description: result.descripcion || result.descripcion || '',

            status: 'Pendiente',

            priority: 'media',

            date: new Date().toISOString().split('T')[0],

            icon: 'assignment',

            showActions: false

          });

        }

      });

    }

  }



  getStatusLabel(status: string): string {

    switch(status) {

      case 'ACTIVE':

        return 'Activo';

      case 'COMPLETED':

        return 'Finalizado';

      case 'CANCELLED':

        return 'Cancelado';

      default:

        return 'Activo';

    }

  }



  getTaskStatusClass(status: string): string {

    switch(status) {

      case 'Pendiente':

      case 'pending':

        return 'pending';

      case 'En progreso':

      case 'in-progress':

        return 'in-progress';

      case 'Terminada':

      case 'completed':

        return 'completed';

      case 'Cancelada':

      case 'cancelled':

        return 'cancelled';

      default:

        return 'pending';

    }

  }



  // Métodos para acciones de tareas

  toggleActionsMenu(task: any): void {

    // Cerrar otros menús abiertos

    this.mockTasks.forEach(t => {

      if (t.id !== task.id) {

        t.showActions = false;

      }

    });

    

    // Toggle el menú actual

    task.showActions = !task.showActions;

  }



  formatResponsables(responsable: string | string[] | undefined): string {

    if (!responsable) {

      return 'No asignado';

    }

    

    if (Array.isArray(responsable)) {

      return responsable.join(', ');

    }

    

    return responsable;

  }



  editTask(task: Task): void {

    const dialogRef = this.dialog.open(TaskFormComponent, {

      width: '70%',

      maxWidth: '2000px',

      data: { 

        programId: this.program?.id, 

        isEdit: true,

        taskData: {

          id: task.id,

          nombreActividad: task.nombreActividad,

          fechaInicioActividad: task.fechaInicio,

          fechaFinActividad: task.fechaFin,

          responsable: task.responsable,

          cronograma: []

        }

      }

    });



    dialogRef.afterClosed().subscribe((result: any) => {

      if (result) {

        console.log('Tarea actualizada:', result);

        // Actualizar la tarea en la lista

        const index = this.mockTasks.findIndex(t => t.id === task.id);

        if (index !== -1) {

          this.mockTasks[index] = {

            ...this.mockTasks[index],

            nombreActividad: result.nombreActividad || task.nombreActividad,

            fechaInicio: result.fechaInicioActividad || task.fechaInicio,

            fechaFin: result.fechaFinActividad || task.fechaFin,

            responsable: result.responsable || task.responsable,

            description: result.descripcion || task.description

          };

        }

      }

    });

  }



  deleteTask(task: any): void {

    this.confirmDialogService.confirmDeleteTask().subscribe((confirmed: boolean) => {
      if (confirmed) {
        console.log('Eliminando tarea:', task);
        
        // Aquí irías a tu servicio para eliminar
        const index = this.mockTasks.findIndex(t => t.id === task.id);
        
        if (index !== -1) {
          this.mockTasks.splice(index, 1);
        }
      }
    });

  }

}