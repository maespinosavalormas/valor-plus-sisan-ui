import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auth-alert',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './auth-alert.component.html',
  styleUrls: ['./auth-alert.component.scss']
})
export class AuthAlertComponent {
  @Input() type: 'error' | 'warning' | 'info' | 'success' = 'error';
  @Input() title: string = '';
  @Input() message: string = '';
  
  private _visible = false;
  @Input()
  get visible(): boolean {
    return this._visible;
  }
  set visible(value: boolean) {
    console.log('AuthAlertComponent: visible setter called with value:', value);
    this._visible = value;
    if (value) {
      this.show();
    } else {
      this.hide();
    }
    // Forzar detección de cambios inmediatamente
    this.cdr.detectChanges();
  }
  
  @Input() autoClose: boolean = true;
  @Input() duration: number = 5000;

  @Output() closeAlert = new EventEmitter<void>();

  private timer: any;
  isClosing = false;

  constructor(private cdr: ChangeDetectorRef) {
    console.log('AuthAlertComponent: constructor called');
  }

  ngOnChanges(): void {
    console.log('AuthAlertComponent: ngOnChanges called, visible:', this._visible);
  }

  show(): void {
    console.log('AuthAlertComponent: show() called');
    this.isClosing = false;
    if (this.autoClose) {
      this.timer = setTimeout(() => {
        this.close();
      }, this.duration);
    }
    // Forzar actualización inmediata
    this.cdr.detectChanges();
  }

  hide(): void {
    console.log('AuthAlertComponent: hide() called');
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    // Forzar actualización inmediata
    this.cdr.detectChanges();
  }

  close(): void {
    console.log('AuthAlertComponent: close() called');
    this.isClosing = true;
    this.hide();
    setTimeout(() => {
      this.closeAlert.emit();
    }, 300);
  }

  getIcon(): string {
    switch (this.type) {
      case 'error':
        return 'error_outline';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'success':
        return 'check_circle';
      default:
        return 'info';
    }
  }
}
