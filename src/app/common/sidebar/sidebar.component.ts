import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, RouterModule, NavigationEnd } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { filter } from 'rxjs/operators';
import { MatMenuModule } from '@angular/material/menu';
import { SidebarService } from '../services/sidebar.service';
import { AuthService, User as AuthUser } from '../../core/services/auth.service';
import { UsersService } from '../../features/users/data-access/services/users-service';
import { User as CompleteUser } from '../models/user.model';
import { LogoutButtonComponent } from '../../shared/components/logout-button/logout-button.component';
import { NotificationsService } from '../services/notifications.service';
import { Notification, NotificationStatus } from '../models/notification.model';

// Campos eliminados de la interfaz Notification local:
// - type: 'case_assignment' | 'case_update' | 'upgrade_request' | 'file_upload' | 'mention' | 'comment'
// - initials?: string
// - icon?: string
// - avatarColor: string
// - time: string
// - category: string
// - filter: 'all' | 'following' | 'archive'
// - attachment?: { name: string; size: string; }
// - preview?: string
// - actions?: boolean
// Ahora usamos la interfaz del backend: { id, caseId, message, isRead, createdAt }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    LogoutButtonComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  @ViewChild(MatSidenav, { static: true })
  sidenav!: MatSidenav;
  
  pageTitle: string = 'Dashboard';
  userInitials: string = 'U';
  userName: string = 'Usuario';
  userEmail: string = '';
  lifestylesExpanded: boolean = false;
  lifestylesPanelTop: number = 200;
  monitoringExpanded: boolean = false;
  monitoringPanelTop: number = 200;
  productiveUnitsExpanded: boolean = false;
  productiveUnitsPanelTop: number = 200;

  
  activeFilter: NotificationStatus = 'all';
  
  notifications: Notification[] = [];

  constructor(
    private router: Router, 
    private sidebarService: SidebarService, 
    private authService: AuthService,
    private usersService: UsersService,
    private cdr: ChangeDetectorRef,
    private notificationsService: NotificationsService
  ) {}

  ngOnInit() {
    this.updatePageTitle(this.router.url);
    
    // Register sidenav with service
    this.sidebarService.setSidenav(this.sidenav);
    
    // Load user data
    this.loadUserData();
    
    // Load notifications
    this.loadNotifications();
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updatePageTitle(event.url);
    });
  }

  private loadUserData(): void {
    // 1. Primero cargar datos del localStorage (instantáneo - no espera)
    const cachedUser = this.authService.getUser();
    if (cachedUser) {
      this.updateUserInfo(cachedUser);
    }

    // 2. Luego obtener datos frescos del backend
    this.usersService.getMyProfile().subscribe({
      next: (profile) => {
        this.updateUserInfo(profile);
      },
      error: (error) => {
        // Si falla la API, ya tenemos los datos del localStorage cargados
      }
    });
  }

  private loadNotifications(): void {
    this.notificationsService.getNotifications(this.activeFilter).subscribe({
      next: (response) => {
        this.notifications = response.content;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
      }
    });
  }

  private updateUserInfo(user: AuthUser | CompleteUser): void {
    // Extract first name and last name with proper formatting
    let firstName = (user.firstName || '').trim();
    let lastName = (user.lastName || '').trim();
    
    // Capitalize first letter of each name
    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
    
    // Set user name (first name + last name)
    if (firstName && lastName) {
      this.userName = `${firstName} ${lastName}`;
    } else if (firstName) {
      this.userName = firstName;
    } else if (lastName) {
      this.userName = lastName;
    } else {
      this.userName = 'Usuario';
    }
    
    // Set user email
    this.userEmail = user.email || 'usuario@ejemplo.com';
    
    // Generate initials (first letter of first name + first letter of last name)
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    this.userInitials = firstInitial && lastInitial 
      ? `${firstInitial}${lastInitial}` 
      : (firstInitial || lastInitial || 'U');
    
    // If we don't have firstName/lastName, try to extract from email
    if (!firstName && !lastName && user.email) {
      const emailName = user.email.split('@')[0];
      this.userName = emailName;
      this.userInitials = emailName.substring(0, 2).toUpperCase();
    }
    
    // Forzar detección de cambios para actualizar la UI inmediatamente
    this.cdr.detectChanges();
  }

  toggleLifestyles(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.lifestylesExpanded) {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      this.lifestylesPanelTop = rect.top;
    }
    
    this.lifestylesExpanded = !this.lifestylesExpanded;
  }

  isLifestylesActive(): boolean {
    return this.router.url.includes('lifestyles');
  }

  toggleMonitoring(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.monitoringExpanded) {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      this.monitoringPanelTop = rect.top;
    }
    
    this.monitoringExpanded = !this.monitoringExpanded;
  }

  isMonitoringActive(): boolean {
    return this.router.url.includes('monitoring');
  }

  toggleProductiveUnits(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.productiveUnitsExpanded) {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      this.productiveUnitsPanelTop = rect.top;
    }
    
    this.productiveUnitsExpanded = !this.productiveUnitsExpanded;
  }

  isProductiveUnitsActive(): boolean {
    return this.router.url.includes('productive-units');
  }

  private updatePageTitle(url: string): void {
    if (url.includes('home')) {
      this.pageTitle = 'Dashboard';
    } else if (url.includes('users')) {
      this.pageTitle = 'Gestión de Usuarios';
    } else if (url.includes('cases')) {
      this.pageTitle = 'Casos de Desnutrición';
    } else if (url.includes('pcd-emergencies')) {
      this.pageTitle = 'PCD y Emergencias';
    } else if (url.includes('legalization-packages')) {
      this.pageTitle = 'Legalización Paquetes';
    } else if (url.includes('legalization-rectification')) {
      this.pageTitle = 'Subsanación Legalización';
    } else if (url.includes('nutritional-follow-up')) {
      this.pageTitle = 'Seguimiento Nutricional';
    } else if (url.includes('psychosocial')) {
      this.pageTitle = 'Psicosocial';
    } else if (url.includes('complements')) {
      this.pageTitle = 'Complementos';
    } else if (url.includes('targeting-up')) {
      this.pageTitle = 'Focalizacion UP';
    } else if (url.includes('characterization-up')) {
      this.pageTitle = 'Caracterizacion UP';
    } else if (url.includes('at-comprehensive-up')) {
      this.pageTitle = 'AT Integral UP';
    } else if (url.includes('legalization-supplies')) {
      this.pageTitle = 'Legalizacion de Insumos UP';
    } else if (url.includes('physical-activity')) {
      this.pageTitle = 'Gestion de Actividad Fisica';
    } else if (url.includes('programs')) {
      this.pageTitle = 'Gestión de Programas';
    } else if (url.includes('traceability')) {
      this.pageTitle = 'Trazabilidad';
    } else if (url.includes('reports')) {
      this.pageTitle = 'Reportes';
    } else {
      this.pageTitle = 'Dashboard';
    }
  }

  // Métodos para filtros
  setFilter(filter: NotificationStatus): void {
    this.activeFilter = filter;
    this.loadNotifications();
  }

  getFilterCount(filter: NotificationStatus): number {
    if (filter === 'all') {
      return this.notifications.filter(n => !n.isRead).length;
    }
    if (filter === 'read') {
      return this.notifications.filter(n => n.isRead).length;
    }
    if (filter === 'unread') {
      return this.notifications.filter(n => !n.isRead).length;
    }
    return 0;
  }

  getFilteredNotifications(): Notification[] {
    if (this.activeFilter === 'all') {
      return this.notifications;
    }
    if (this.activeFilter === 'read') {
      return this.notifications.filter(n => n.isRead);
    }
    if (this.activeFilter === 'unread') {
      return this.notifications.filter(n => !n.isRead);
    }
    return this.notifications;
  }

  // Métodos para notificaciones
  markAllAsRead(): void {
    this.notifications.forEach(n => {
      if (this.activeFilter === 'all' || !n.isRead) {
        n.isRead = true;
      }
    });
  }

  handleNotificationClick(notification: Notification): void {
    // Si ya está leída, solo navegar al caso
    if (notification.isRead) {
      this.router.navigate(['/cases', notification.caseId]);
      return;
    }

    // Marcar como leída en el backend
    this.notificationsService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.isRead = true;
        // Navegar al caso asociado
        this.router.navigate(['/cases', notification.caseId]);
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
        // Aún navegar al caso aunque falle el marcado como leída
        this.router.navigate(['/cases', notification.caseId]);
      }
    });
  }

  handleAction(event: Event, notification: Notification, action: 'accept' | 'decline'): void {
    event.stopPropagation();
    
    if (action === 'accept') {
      // Aquí puedes hacer una llamada al backend para aceptar la solicitud
      // this.notificationsService.acceptRequest(notification.id).subscribe(...)
      
      notification.isRead = true;
      
      // Opcionalmente mostrar un mensaje de éxito
      // this.snackBar.open('Solicitud aceptada', 'Cerrar', { duration: 3000 });
      
    } else if (action === 'decline') {
      // Aquí puedes hacer una llamada al backend para rechazar la solicitud
      // this.notificationsService.declineRequest(notification.id).subscribe(...)
      
      notification.isRead = true;
    }
  }

  openSettings(): void {
    // Navegar a la página de configuración de notificaciones
    this.router.navigate(['/settings/notifications']);
  }

  // Métodos del usuario
  editProfile(): void {
    this.router.navigate(['/profile']);
  }

  // Método auxiliar para descargar archivos adjuntos
  downloadAttachment(event: Event, attachment: { name: string; size: string }): void {
    event.stopPropagation();
    // Aquí implementarías la lógica de descarga
    // this.fileService.download(attachment.id).subscribe(...)
    console.log('Descarga de archivos no implementada en el backend actual');
  }
}