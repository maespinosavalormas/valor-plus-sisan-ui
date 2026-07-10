import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReportsListComponent } from '../../ui/reports-list/reports-list.component';
import { ReportsFormComponent } from '../../ui/reports-form/reports-form.component';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    MatDialogModule,
    ReportsListComponent,
    ReportsFormComponent,
  ],
  templateUrl: './reports-page.html',
  styleUrl: './reports-page.scss'
})
export class ReportsPageComponent {
  constructor(private dialog: MatDialog) {}

  openCreateForm(): void {
    const dialogRef = this.dialog.open(ReportsFormComponent, {
      width: '90%',
      maxWidth: '800px',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'save') {
        console.log('Nuevo reporte creado:', result.reportData);
        // Aqui puedes refrescar la lista o mostrar una notificación
      }
    });
  }
}
