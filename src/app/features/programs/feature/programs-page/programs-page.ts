import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ProgramsListComponent } from '../../ui/programs-list/programs-list';
import { ProgramsFormComponent } from '../../ui/programs-form/programs-form';

@Component({
  selector: 'app-programs-page',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, ProgramsListComponent],
  templateUrl: './programs-page.html',
  styleUrl: './programs-page.scss'
})
export class ProgramsPageComponent {
  programs: any[] = [
    {
      id: 1,
      name: 'Programa de Nutrición Infantil',
      description: 'Programa enfocado en la nutrición de niños menores de 5 años',
      status: 'ACTIVE',
      startDate: '2024-01-15',
      endDate: '2024-12-31',
      beneficiaries: 1500,
      responsables: ['Juan Pérez', 'María García', 'Carlos Rodríguez', 'Juan Jose Vergara Graciano', 'Juan David Parra Giraldo']
    },
    {
      id: 2,
      name: 'Programa de Suplementación',
      description: 'Distribución de suplementos nutricionales en comunidades vulnerables',
      status: 'ACTIVE',
      startDate: '2024-02-01',
      endDate: '2024-11-30',
      beneficiaries: 2300,
      responsables: ['Ana López', 'Luis Martínez']
    },
    {
      id: 3,
      name: 'Programa de Educación Alimentaria',
      description: 'Capacitación sobre hábitos alimenticios saludables',
      status: 'INACTIVE',
      startDate: '2023-09-01',
      endDate: '2024-06-30',
      beneficiaries: 800,
      responsables: ['Sofía Torres', 'Diego Hernández', 'Patricia Morales']
    }
  ];

  constructor(private dialog: MatDialog) {}

  openProgramForm(): void {
    const dialogRef = this.dialog.open(ProgramsFormComponent, {
      width: '60%',
      maxWidth: '2000px',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.programs.push({
          ...result,
          status: 'ACTIVE',
          beneficiaries: 0
        });
        console.log('Programa creado:', result);
      }
    });
  }

  editProgram(program: any): void {
    const dialogRef = this.dialog.open(ProgramsFormComponent, {
      width: '60%',
      maxWidth: '2000px',
      data: { isEdit: true, program }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.programs.findIndex(p => p.id === program.id);
        if (index !== -1) {
          this.programs[index] = { ...this.programs[index], ...result };
        }
        console.log('Programa actualizado:', result);
      }
    });
  }

  toggleProgramStatus(program: any): void {
    program.status = program.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    console.log('Estado del programa cambiado:', program);
  }
}
