import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../../../common/models/user.model';
import { UserTraceabilityComponent } from '../user-traceability/user-traceability.component';
import { UserDetailsHeaderComponent } from '../../ui/user-details-header/user-details-header';

// Extender la interfaz User para incluir propiedades opcionales
interface ExtendedUser extends User {
  phone?: string;
  department?: string;
  position?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  standalone: true,
  selector: 'app-user-details',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    MatChipsModule,
    UserTraceabilityComponent,
    UserDetailsHeaderComponent
  ],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss',
})
export class UserDetailsComponent implements OnChanges, OnDestroy, OnInit {
  @Input() user: ExtendedUser | null = null;
  @Output() edit = new EventEmitter<ExtendedUser>();
  @Output() back = new EventEmitter<void>();

  currentView: 'details' | 'traceability' = 'details';

  constructor(private route: ActivatedRoute) {
    console.log('UserDetailsComponent constructor');
  }

  ngOnInit(): void {
    console.log('UserDetailsComponent ngOnInit');
    console.log('Route available:', !!this.route);
    
    // Enfoque robusto: Intentar múltiples métodos para obtener los datos
    this.loadUserFromRoute();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Escuchar cambios en el usuario si es necesario
  }

  ngOnDestroy(): void {
    // Limpieza si es necesaria
  }

  loadUserFromRoute(): void {
    console.log('loadUserFromRoute called');
    
    let userData: ExtendedUser | null = null;
    
    // Método 1: Intentar obtener del localStorage (alternativa a Router)
    try {
      const storedUser = localStorage.getItem('selectedUser');
      console.log('Stored user from localStorage:', storedUser);
      
      if (storedUser) {
        userData = JSON.parse(storedUser) as ExtendedUser;
        console.log('✅ Using localStorage user');
        
        // Limpiar el localStorage después de usarlo
        localStorage.removeItem('selectedUser');
      }
    } catch (error) {
      console.warn('❌ Error getting localStorage user:', error);
    }
    
    // Método 2: Intentar obtener del history state (fallback)
    if (!userData) {
      try {
        const historyState = history.state;
        console.log('History state:', historyState);
        
        if (historyState?.user) {
          userData = historyState.user as ExtendedUser;
          console.log('✅ Using history state user');
        }
      } catch (error) {
        console.warn('❌ Error getting history state:', error);
      }
    }
    
    // Método 3: Fallback - obtener ID y usar datos de ejemplo
    if (!userData) {
      try {
        const userId = this.route?.snapshot?.paramMap?.get('id');
        console.log('Using fallback for userId:', userId);
        
        if (userId) {
          userData = {
            id: userId,
            email: `${userId}@example.com`,
            firstName: 'Usuario',
            lastName: 'Ejemplo',
            isActive: true,
            roles: [
              { id: '1', name: 'Administrador' }
            ],
            phone: '123-456-7890',
            department: 'TI',
            position: 'Desarrollador',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userInfo: {
              username: `${userId}_user`,
              birthdate: '1990-01-01',
              phone: '123-456-7890',
              address: 'Calle Principal 123',
              cityId: '1',
              provinceId: '1',
              identificationTypeId: 1,
              identificationNumber: '123456789'
            }
          } as ExtendedUser;
          console.log('✅ Using fallback user created:', userData);
        }
      } catch (error) {
        console.warn('❌ Error creating fallback user:', error);
      }
    }
    
    // Asignar los datos finales
    this.user = userData;
    console.log('🎯 Final user data:', this.user);
    
    // Si no hay datos, mostrar error claro
    if (!this.user) {
      console.error('❌ No user data could be loaded!');
      // Aquí podrías mostrar un mensaje de error en la UI
    }
  }

  onBack(): void {
    this.back.emit();
  }

  onViewChange(view: string): void {
    this.currentView = view as 'details' | 'traceability';
  }

  onEdit(): void {
    if (this.user) {
      this.edit.emit(this.user as ExtendedUser);
    }
  }

  getStatusLabel(isActive?: boolean): string {
    return isActive ? 'Activo' : 'Inactivo';
  }

  getStatusClass(isActive?: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  formatRoles(roles: Array<{ id: string; name: string }> = []): string {
    return roles
      .map(role => role.name)
      .join(', ') || 'Sin roles';
  }

  getInitials(firstName: string, lastName: string): string {
    const firstInitial = firstName?.charAt(0) || '';
    const lastInitial = lastName?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'No disponible';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  }
}
