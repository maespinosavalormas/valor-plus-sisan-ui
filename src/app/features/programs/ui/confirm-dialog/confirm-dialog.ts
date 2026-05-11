import { Component, Inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'success' | 'warning' | 'error';
}

export interface ConfirmResult {
  confirmed: boolean;
  data?: any;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './confirm-dialog.html',
  styleUrls: ['./confirm-dialog.scss'],
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    // Establecer valores por defecto
    this.data.confirmText = this.data.confirmText || 'Confirmar';
    this.data.cancelText = this.data.cancelText || 'Cancelar';
    this.data.type = this.data.type || 'success';
  }

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  getIcon(): string {
    switch (this.data.type) {
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'check_circle';
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  constructor(private dialog: MatDialog) {}

  confirmCreateCase(): Observable<boolean> {
    const data: ConfirmDialogData = {
      title: 'Confirmar Creación de Caso',
      message: '¿Está seguro que desea crear este caso? Esta acción no se puede deshacer.',
      confirmText: 'Crear',
      cancelText: 'Cancelar',
      type: 'success'
    };

    return this.dialog.open(ConfirmDialogComponent, {
      data,
      width: '400px',
      disableClose: true
    }).afterClosed();
  }

  confirmUpdateCase(): Observable<boolean> {
    const data: ConfirmDialogData = {
      title: 'Confirmar Actualización de Caso',
      message: '¿Está seguro que desea actualizar este caso? Esta acción modificará los datos existentes.',
      confirmText: 'Actualizar',
      cancelText: 'Cancelar',
      type: 'warning'
    };

    return this.dialog.open(ConfirmDialogComponent, {
      data,
      width: '400px',
      disableClose: true
    }).afterClosed();
  }

  confirmDeleteCase(): Observable<boolean> {
    const data: ConfirmDialogData = {
      title: 'Confirmar Eliminación de Caso',
      message: '¿Está seguro que desea eliminar este caso? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'error'
    };

    return this.dialog.open(ConfirmDialogComponent, {
      data,
      width: '400px',
      disableClose: true
    }).afterClosed();
  }

  confirmCreateProgram(): Observable<boolean> {
    const data: ConfirmDialogData = {
      title: 'Confirmar Creación de Programa',
      message: '¿Está seguro que desea crear este programa? Esta acción no se puede deshacer.',
      confirmText: 'Crear',
      cancelText: 'Cancelar',
      type: 'success'
    };

    return this.dialog.open(ConfirmDialogComponent, {
      data,
      width: '400px',
      disableClose: true
    }).afterClosed();
  }

  confirmUpdateProgram(): Observable<boolean> {
    const data: ConfirmDialogData = {
      title: 'Confirmar Actualización de Programa',
      message: '¿Está seguro que desea actualizar este programa? Esta acción modificará los datos existentes.',
      confirmText: 'Actualizar',
      cancelText: 'Cancelar',
      type: 'warning'
    };

    return this.dialog.open(ConfirmDialogComponent, {
      data,
      width: '400px',
      disableClose: true
    }).afterClosed();
  }

  confirmDeleteProgram(): Observable<boolean> {
    const data: ConfirmDialogData = {
      title: 'Confirmar Eliminación de Programa',
      message: '¿Está seguro que desea eliminar este programa? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'error'
    };

    return this.dialog.open(ConfirmDialogComponent, {
      data,
      width: '400px',
      disableClose: true
    }).afterClosed();
  }

  confirmCreateTask(): Observable<boolean> {
    const data: ConfirmDialogData = {
      title: 'Confirmar Creación de Actividad',
      message: '¿Está seguro que desea crear esta actividad? Esta acción no se puede deshacer.',
      confirmText: 'Crear',
      cancelText: 'Cancelar',
      type: 'success'
    };

    return this.dialog.open(ConfirmDialogComponent, {
      data,
      width: '400px',
      disableClose: true
    }).afterClosed();
  }

  confirmUpdateTask(): Observable<boolean> {
    const data: ConfirmDialogData = {
      title: 'Confirmar Actualización de Actividad',
      message: '¿Está seguro que desea actualizar esta actividad? Esta acción modificará los datos existentes.',
      confirmText: 'Actualizar',
      cancelText: 'Cancelar',
      type: 'warning'
    };

    return this.dialog.open(ConfirmDialogComponent, {
      data,
      width: '400px',
      disableClose: true
    }).afterClosed();
  }

  confirmDeleteTask(): Observable<boolean> {
    const data: ConfirmDialogData = {
      title: 'Confirmar Eliminación de Actividad',
      message: '¿Está seguro que desea eliminar esta actividad? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'error'
    };

    return this.dialog.open(ConfirmDialogComponent, {
      data,
      width: '400px',
      disableClose: true
    }).afterClosed();
  }

  customConfirm(data: ConfirmDialogData): Observable<boolean> {
    return this.dialog.open(ConfirmDialogComponent, {
      data,
      width: '400px',
      disableClose: true
    }).afterClosed();
  }
}
