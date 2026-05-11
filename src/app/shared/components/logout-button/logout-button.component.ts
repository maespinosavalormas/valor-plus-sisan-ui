import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-logout-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './logout-button.component.html',
  styleUrls: ['./logout-button.component.scss']
})
export class LogoutButtonComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isLoggingOut = false;

  get buttonText(): string {
    return this.isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión';
  }

  onLogout(): void {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;
    console.log('LogoutButton: Starting logout process');

    this.authService.logout().pipe(
      finalize(() => {
        this.isLoggingOut = false;
        console.log('LogoutButton: Logout process finalized');
      })
    ).subscribe({
      next: () => {
        console.log('LogoutButton: Logout successful, navigating to login');
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        // No mostrar errores al usuario - logout silencioso
        console.error('LogoutButton: Logout error (silent):', error);
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
