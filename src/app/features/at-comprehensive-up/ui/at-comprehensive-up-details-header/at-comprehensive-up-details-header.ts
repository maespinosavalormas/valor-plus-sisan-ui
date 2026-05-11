import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-at-comprehensive-up-details-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './at-comprehensive-up-details-header.html',
  styleUrl: './at-comprehensive-up-details-header.scss'
})
export class AtComprehensiveUpDetailsHeaderComponent {
  @Input() atComprehensiveUp: any = null;
  @Input() showBackButton: boolean = true;
  @Input() activeView: 'details' | 'traceability' = 'details';
  @Output() backClicked = new EventEmitter<void>();
  @Output() viewChanged = new EventEmitter<'details' | 'traceability'>();
  @Output() editClicked = new EventEmitter<void>();

  constructor(private router: Router) {}

  onBack(): void {
    this.backClicked.emit();
    this.router.navigate(['/at-comprehensive-up']);
  }

  onViewChange(view: 'details' | 'traceability'): void {
    this.viewChanged.emit(view);
  }

  onEditClick(): void {
    this.editClicked.emit();
  }

  getTitle(): string {
    if (!this.atComprehensiveUp) return 'AT Integral UP';
    return (
      this.atComprehensiveUp?.codigoUnidadProductiva ||
      this.atComprehensiveUp?.codigoUP ||
      this.atComprehensiveUp?.numeroAsistenciaTecnica ||
      'AT Integral UP'
    );
  }
}
