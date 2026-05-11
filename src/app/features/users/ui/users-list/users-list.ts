import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { User } from '../../../../common/models/user.model';
import { Router } from '@angular/router';
import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog';

@Component({
  standalone: true,
  selector: 'app-users-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './users-list.html',
  styleUrls: ['./users-list.scss'],
})
export class UsersTableComponent implements OnChanges {
  @Input() users: User[] = [];

  @Output() edit = new EventEmitter<User>();
  @Output() toggleStatus = new EventEmitter<{ user: User; isActive: boolean }>();
  @Output() view = new EventEmitter<User>();

  displayedColumns: string[] = ['name', 'email', 'role', 'state', 'actions'];

  /** Filtros */
  selectedRole: string = 'ALL';
  filteredUsers: User[] = [];
  roleCounts: Record<string, number> = {};

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['users']) {
      this.updateRoleCounts();
      this.applyFilter();
    }
  }

  /** Actualiza los contadores de usuarios por rol */
  private updateRoleCounts(): void {
    this.roleCounts = {
      ALL: this.users.length,
      ADMIN: 0,
      HEALTH_PROVIDER: 0,
      MUNICIPALITY: 0,
      OFFICIAL: 0,
      COMMITTEE: 0
    };

    this.users.forEach(user => {
      if (user.roles && user.roles.length > 0) {
        user.roles.forEach(role => {
          // Mapear nombres de roles a códigos
          switch(role.name) {
            case 'Administrador':
              this.roleCounts['ADMIN']++;
              break;
            case 'Prestador de salud':
              this.roleCounts['HEALTH_PROVIDER']++;
              break;
            case 'Municipio':
              this.roleCounts['MUNICIPALITY']++;
              break;
            case 'Funcionario':
              this.roleCounts['OFFICIAL']++;
              break;
            case 'Comité':
              this.roleCounts['COMMITTEE']++;
              break;
          }
        });
      }
    });
  }

  /** Obtiene el contador para un rol específico */
  getRoleCount(role: string): number {
    return this.roleCounts[role] || 0;
  }

  

  /** Aplica el filtro actual */
  applyFilter(): void {
    if (this.selectedRole === 'ALL') {
      this.filteredUsers = [...this.users];
      return;
    }

    // Mapear códigos de rol a nombres
    const roleMap: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'HEALTH_PROVIDER': 'Prestador de salud',
      'MUNICIPALITY': 'Municipio',
      'OFFICIAL': 'Funcionario',
      'COMMITTEE': 'Comité'
    };

    const roleName = roleMap[this.selectedRole];
    this.filteredUsers = this.users.filter(user =>
      user.roles?.some(role => role.name === roleName)
    );
  }

  /** Cambia el filtro por rol */
  filterByRole(role: string): void {
    this.selectedRole = role;
    this.applyFilter();
  }

  /** Estado */
  getStatusLabel(isActive?: boolean): string {
    return isActive ? 'Activo' : 'Inactivo';
  }

  getStatusClass(isActive?: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  /** Roles */
  formatRoles(roles: Array<{ id: string; name: string }> = []): string {
    return roles
      .map(role => this.formatRoleName(role.name))
      .join(', ') || 'Sin roles';
  }

  private formatRoleName(role: string): string {
    const roleNames: { [key: string]: string } = {
      ADMIN: 'Administrador',
      HEALTH_PROVIDER: 'Prestador de salud',
      MUNICIPALITY: 'Municipio',
      OFFICIAL: 'Funcionario',
      COMMITTEE: 'Comité',
    };

    return roleNames[role] || role;
  }

  /** Avatar */
  getInitials(firstName: string, lastName: string): string {
    const firstInitial = firstName?.charAt(0) || '';
    const lastInitial = lastName?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }

  /** Acciones */
  onEdit(user: User): void {
    this.edit.emit(user);
  }

  onView(user: User): void {
    console.log('onView called with user:', user);
    this.view.emit(user);
    
    // Guardar los datos del usuario en localStorage
    try {
      localStorage.setItem('selectedUser', JSON.stringify(user));
      console.log('✅ User saved to localStorage:', user);
    } catch (error) {
      console.warn('❌ Error saving user to localStorage:', error);
    }
    
    // Navegar a la página de detalles del usuario
    console.log('Navigating to user details');
    this.router.navigate(['/users', user.id, 'details']);
  }

  onToggleStatus(user: User, newStatus: boolean): void {
    console.log('[users-list] onToggleStatus llamado:', { userId: user.id, currentStatus: user.isActive, requestedStatus: newStatus });

    if (user.isActive === newStatus) {
      console.log('[users-list] Estado ya es el solicitado, no se hace nada');
      return;
    }

    const action = newStatus ? 'activar' : 'inactivar';
    const actionTitle = newStatus ? 'Activar Usuario' : 'Desactivar Usuario';
    const dialogType = newStatus ? 'success' : 'warning';

    const dialogData: ConfirmDialogData = {
      title: actionTitle,
      message: `¿Está seguro de ${action} a ${user.firstName} ${user.lastName}?`,
      confirmText: newStatus ? 'Activar' : 'Desactivar',
      cancelText: 'Cancelar',
      type: dialogType
    };

    console.log('[users-list] Abriendo dialogo de confirmacion');
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('[users-list] Dialogo cerrado, resultado:', result);
      if (result) {
        console.log('[users-list] Emitiendo toggleStatus:', { user, isActive: newStatus });
        this.toggleStatus.emit({ user, isActive: newStatus });
      } else {
        console.log('[users-list] Usuario cancelo el dialogo');
      }
    });
  }
}
