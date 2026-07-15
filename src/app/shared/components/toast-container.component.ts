import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-container" role="alert" aria-live="polite">
      @for (toast of toasts(); track toast.id) {
        <div
          class="toast-message"
          [class]="['toast-' + toast.type, 'data-testid=' + getTestId(toast.type)]"
        >
          <span class="toast-icon">{{ getIcon(toast.type) }}</span>
          <span class="toast-text">{{ toast.message }}</span>
          <button class="toast-close" (click)="removeToast(toast.id)" aria-label="Cerrar">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 400px;
    }

    .toast-message {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
    }

    .toast-success {
      background: #e8f5e9;
      border-left: 4px solid #4caf50;
      color: #2e7d32;
    }

    .toast-error {
      background: #ffebee;
      border-left: 4px solid #f44336;
      color: #c62828;
    }

    .toast-warning {
      background: #fff8e1;
      border-left: 4px solid #ffc107;
      color: #f57f17;
    }

    .toast-info {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      color: #1565c0;
    }

    .toast-icon {
      font-size: 1.2rem;
    }

    .toast-text {
      flex: 1;
      font-size: 0.9rem;
    }

    .toast-close {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      opacity: 0.6;
      padding: 0 0.25rem;
    }

    .toast-close:hover {
      opacity: 1;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `],
})
export class ToastComponent {
  private toastService = inject(ToastService);
  toasts = this.toastService.toasts$ as any;

  removeToast(id: string): void {
    this.toastService.remove(id);
  }

  getTestId(type: string): string {
    return `toast-${type}`;
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  }
}
