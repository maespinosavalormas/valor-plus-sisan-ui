import { Component, signal, OnInit, ViewEncapsulation, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs/operators';
import { User } from '../../../../common/models/user.model';
import { UsersFormComponent } from '../../ui/users-form/users-form';
import { UsersTableComponent } from '../../ui/users-list/users-list';
import { UsersService } from '../../../users/data-access/services/users-service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  selector: 'app-users-page',
  imports: [UsersTableComponent, MatIconModule, MatSnackBarModule],
  templateUrl: './users-page.html',
  styleUrls: ['./users-page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UsersPage implements OnInit {
  users: User[] = [];
  loading = true;
  error: string | null = null;
  private platformId = inject(PLATFORM_ID);

  constructor(
    private dialog: MatDialog,
    private usersService: UsersService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    // Solo cargar usuarios en el browser, no durante SSR
    if (isPlatformBrowser(this.platformId)) {
      this.loadUsers();
    }
    // Forzar detección de cambios inicial inmediato
    this.cdr.detectChanges();
  }
  loadUsers(): void {
    this.loading = true;
    this.error = null;
    this.usersService
      .getUsers()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (users) => {
          this.users = users;
          // Forzar detección de cambios para renderizar la lista
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar usuarios:', error);
          this.users = [];
          this.error = 'Error al cargar usuarios. Por favor, intente nuevamente.';
          this.showError(this.error);
          // Forzar detección de cambios para renderizar la lista
          this.cdr.detectChanges();
        },
      });
  }

  editUser(user: User): void {
    this.openUserForm(user);
  }

  toggleUserStatus(event: { user: User; isActive: boolean }): void {
    const { user } = event;
    console.log('[users-page] toggleUserStatus recibido:', { userId: user.id, isActive: user.isActive });

    if (!user.id) {
      console.error('[users-page] No se puede cambiar el estado: ID no válido');
      this.showError('No se pudo cambiar el estado del usuario: ID no válido');
      return;
    }

    // Usar el estado actual del usuario para decidir la acción
    if (user.isActive) {
      console.log('[users-page] Usuario activo → desactivar');
      this.deactivateUser(user.id);
    } else {
      console.log('[users-page] Usuario inactivo → activar');
      this.activateUser(user.id);
    }
  }

  activateUser(id: string): void {
    console.log('[users-page] Llamando activateUser:', id);
    this.usersService.activateUser(id).subscribe({
      next: (response) => {
        console.log('[users-page] activateUser exitoso:', response);
        this.showSuccess('Usuario activado correctamente');
        this.loadUsers();
      },
      error: (err) => {
        console.error('[users-page] Error al activar:', err);
        this.showError('Error al activar usuario: ' + (err.message || 'Error desconocido'));
        this.cdr.detectChanges();
      }
    });
  }

  deactivateUser(id: string): void {
    console.log('[users-page] Llamando deactivateUser:', id);
    this.usersService.deactivateUser(id).subscribe({
      next: (response) => {
        console.log('[users-page] deactivateUser exitoso:', response);
        this.showSuccess('Usuario desactivado correctamente');
        this.loadUsers();
      },
      error: (err) => {
        console.error('[users-page] Error al desactivar:', err);
        this.showError('Error al desactivar usuario: ' + (err.message || 'Error desconocido'));
        this.cdr.detectChanges();
      }
    });
  }

  openUserForm(user?: User): void {
    const dialogRef = this.dialog.open(UsersFormComponent, {
      width: '90%',
      maxWidth: '800px',
      maxHeight: '90vh',
      data: user || null,
      disableClose: true,
      hasBackdrop: true,
      backdropClass: 'dialog-backdrop-no-close'
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.deleted) {
          this.users = this.users.filter((u) => u.id !== user?.id);
          this.showSuccess('Usuario eliminado correctamente');
        } else if (user) {
          // Actualizar usuario en la lista
          const index = this.users.findIndex((u) => u.id === user.id);
          if (index !== -1) {
            this.users[index] = result;
          }
          this.showSuccess('Usuario actualizado correctamente');
        } else {
          // Agregar nuevo usuario a la lista
          this.users = [result, ...this.users];
          this.showSuccess('Usuario creado correctamente');
        }
      }
    });
  }
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }
  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }
}
