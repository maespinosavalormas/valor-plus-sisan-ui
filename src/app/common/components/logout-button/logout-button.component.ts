import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './logout-button.component.html',
  styleUrls: ['./logout-button.component.scss']
})
export class LogoutButtonComponent {
  isLoggingOut = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogout(): void {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;
    console.log('LogoutButton: Starting logout process');

    this.authService.logout().subscribe({
      next: () => {
        console.log('LogoutButton: Logout successful');
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('LogoutButton: Logout error:', error);
        // Incluso si hay error, navegamos al login
        this.router.navigate(['/auth/login']);
      },
      complete: () => {
        this.isLoggingOut = false;
        console.log('LogoutButton: Logout completed');
      }
    });
  }
}
