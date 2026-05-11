import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-targeting-up-details-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './targeting-up-details-header.html',
  styleUrl: './targeting-up-details-header.scss'
})
export class TargetingUpDetailsHeaderComponent {
  @Input() targetingUp: any = null;
  @Input() showBackButton: boolean = true;
  @Input() activeView: 'details' | 'traceability' = 'details';
  @Output() backClicked = new EventEmitter<void>();
  @Output() viewChanged = new EventEmitter<'details' | 'traceability'>();
  @Output() editClicked = new EventEmitter<void>();

  constructor(private router: Router) {}

  onBack(): void {
    this.backClicked.emit();
    this.router.navigate(['/targeting-up']);
  }

  onViewChange(view: 'details' | 'traceability'): void {
    this.viewChanged.emit(view);
  }

  onEditClick(): void {
    this.editClicked.emit();
  }

  getTitle(): string {
    if (!this.targetingUp) return 'Focalización UP';
    return this.targetingUp?.tipoUnidadProductiva || this.targetingUp?.tipoUP || 'Focalización UP';
  }

  getId(): string {
    return this.targetingUp?.id || 'N/A';
  }
}
