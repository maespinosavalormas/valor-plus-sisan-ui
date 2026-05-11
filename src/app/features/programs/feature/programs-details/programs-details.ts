import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSelectChange } from '@angular/material/select';
import { ProgramHeaderComponent } from '../../ui/program-details-header/program-details-header';
import { MatDialog } from '@angular/material/dialog';
import { ProgramsFormComponent } from '../../ui/programs-form/programs-form';

@Component({
  selector: 'app-programs-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    ProgramHeaderComponent
  ],
  templateUrl: './programs-details.html',
  styleUrls: ['./programs-details.scss']
})
export class ProgramsDetailsComponent {
  program: any = null;
  currentView: 'info' | 'tasks' | 'traceability' | 'schedule' = 'info';
  selectedStatus: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Obtener el ID del programa de la ruta
    const programId = this.route.snapshot.paramMap.get('id');
    
    // Mock: buscar programa por ID (aquí irías a tu servicio)
    this.loadProgram(programId);
    
    // Inicializar el estado seleccionado
    if (this.program) {
      this.selectedStatus = this.program.status;
    }
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
        endDate: '2024-12-31',
        // Nuevos campos agregados
        objetivos: 'Mejorar el estado nutricional de los niños menores de 5 años en comunidades vulnerables mediante la entrega de suplementos alimenticios y educación en hábitos saludables.',
        objetivosEspecificos: [
          'Reducir la desnutrición aguda en un 30% en 12 meses',
          'Capacitar al 80% de las familias en prácticas alimentarias saludables',
          'Establecer 5 centros de distribución de suplementos en las comunidades más afectadas',
          'Realizar seguimiento mensual al 100% de los beneficiarios'
        ],
        responsables: ['Juan Pérez', 'María García', 'Carlos Rodríguez', 'Juan Jose Vergara Graciano', 'Juan David Parra Giraldo'],
        casosVinculados: [
          {
            numeroCaso: 'CAS-2024-001',
            nombrePaciente: 'María González López',
            estado: 'en proceso'
          },
          {
            numeroCaso: 'CAS-2024-002',
            nombrePaciente: 'Carlos Martínez Pérez',
            estado: 'completado'
          },
          {
            numeroCaso: 'CAS-2024-003',
            nombrePaciente: 'Ana Rodríguez Torres',
            estado: 'inactivo'
          },
          {
            numeroCaso: 'CAS-2024-004',
            nombrePaciente: 'José Hernández Gómez',
            estado: 'en proceso'
          },
          {
            numeroCaso: 'CAS-2024-005',
            nombrePaciente: 'Laura Sánchez Díaz',
            estado: 'completado'
          },
          {
            numeroCaso: 'CAS-2024-006',
            nombrePaciente: 'Pedro Ramírez Castro',
            estado: 'inactivo'
          },
          {
            numeroCaso: 'CAS-2024-007',
            nombrePaciente: 'Sofía Morales Vargas',
            estado: 'en proceso'
          },
          {
            numeroCaso: 'CAS-2024-008',
            nombrePaciente: 'Miguel Ángel Torres',
            estado: 'completado'
          },
          {
            numeroCaso: 'CAS-2024-009',
            nombrePaciente: 'Carmen López Ruiz',
            estado: 'inactivo'
          },
          {
            numeroCaso: 'CAS-2024-010',
            nombrePaciente: 'Antonio Benítez Rojas',
            estado: 'en proceso'
          },
          {
            numeroCaso: 'CAS-2024-011',
            nombrePaciente: 'Rosa María Jiménez',
            estado: 'completado'
          },
          {
            numeroCaso: 'CAS-2024-012',
            nombrePaciente: 'Francisco Javier Mora',
            estado: 'inactivo'
          }
        ],
        evidencias: [],
        comentarios: []
      };
    }
  }

  goBack(): void {
    this.router.navigate(['/programs']);
  }

  switchView(view: 'info'): void {
    this.currentView = view;
  }

  goToTasks(): void {
    if (this.program) {
      this.router.navigate(['/programs', this.program.id, 'tasks']);
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
    if (view === 'tasks') {
      this.goToTasks();
    } else if (view === 'traceability') {
      this.goToTraceability();
    } else if (view === 'schedule') {
      this.goToSchedule();
    }
  }

  changeProgramStatus(event: MatSelectChange): void {
    if (this.program) {
      const newStatus = event.value;
      this.program.status = newStatus;
      this.selectedStatus = newStatus;
      console.log('Estado del programa cambiado:', newStatus);
      // Aquí irías a tu servicio para actualizar en el backend
    }
  }

  updateProgram(): void {
    if (this.program) {
      const dialogRef = this.dialog.open(ProgramsFormComponent, {
        width: '600px',
        data: {
          isEdit: true,
          program: this.program
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Aquí irías a tu servicio para actualizar el programa
          console.log('Programa actualizado:', result);
          // Opcional: actualizar los datos locales
          this.program = { ...this.program, ...result };
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'ACTIVE':
        return 'status-active';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-active';
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

  // Métodos para manejar evidencias
  addEvidencia(): void {
    // Lógica para agregar archivo PDF
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const evidencia = {
          id: Date.now(),
          nombre: file.name,
          fecha: new Date().toISOString().split('T')[0],
          tamano: (file.size / 1024).toFixed(2) + ' KB'
        };
        this.program.evidencias.push(evidencia);
        console.log('Evidencia agregada:', evidencia);
      }
    };
    input.click();
  }

  deleteEvidencia(index: number): void {
    this.program.evidencias.splice(index, 1);
    console.log('Evidencia eliminada');
  }

  downloadEvidencia(evidencia: any): void {
    // Simular la descarga del PDF
    console.log('Descargando evidencia:', evidencia);
    
    // Crear un PDF de ejemplo para descargar
    const link = document.createElement('a');
    link.href = 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iagokAwolJSVGLzI='; // PDF base64 mínimo
    link.download = evidencia.nombre;
    link.target = '_blank';
    
    // Agregar el link al DOM, hacer click y removerlo
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('PDF descargado:', evidencia.nombre);
  }

  // Métodos para manejar comentarios
  addComentario(): void {
    const comentario = prompt('Agregar comentario:');
    if (comentario && comentario.trim()) {
      const nuevoComentario = {
        id: Date.now(),
        texto: comentario.trim(),
        fecha: new Date().toISOString(),
        autor: 'Usuario Actual' // Aquí iría el usuario logueado
      };
      this.program.comentarios.unshift(nuevoComentario);
      console.log('Comentario agregado:', nuevoComentario);
    }
  }

  deleteComentario(index: number): void {
    this.program.comentarios.splice(index, 1);
    console.log('Comentario eliminado');
  }

  toggleCommentActions(index: number): void {
    const actionsElement = document.getElementById('actions-' + index) as HTMLElement;
    if (actionsElement) {
      // Cerrar todos los demás menús abiertos
      document.querySelectorAll('.comment-options').forEach((el: Element) => {
        const element = el as HTMLElement;
        if (element.id !== 'actions-' + index) {
          element.style.display = 'none';
        }
      });
      
      // Toggle del menú actual
      if (actionsElement.style.display === 'none' || actionsElement.style.display === '') {
        actionsElement.style.display = 'flex';
      } else {
        actionsElement.style.display = 'none';
      }
    }
  }

  sortComments(): void {
    // Alternar entre orden cronológico y alfabético
    this.program.comentarios.reverse();
    console.log('Comentarios ordenados:', this.program.comentarios.length);
  }

  getEstadoClass(estado: string): string {
    switch(estado) {
      case 'en proceso':
        return 'estado-en-proceso';
      case 'completado':
        return 'estado-completado';
      case 'inactivo':
        return 'estado-inactivo';
      default:
        return 'estado-en-proceso';
    }
  }

}
