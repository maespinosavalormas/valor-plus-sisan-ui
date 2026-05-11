import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-characterization-up-details-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './characterization-up-details-header.html',
  styleUrl: './characterization-up-details-header.scss'
})
export class CharacterizationUpDetailsHeaderComponent {
  @Input() characterizationUp: any = null;
  @Input() showBackButton: boolean = true;
  @Input() activeView: 'details' | 'traceability' = 'details';
  @Output() backClicked = new EventEmitter<void>();
  @Output() viewChanged = new EventEmitter<'details' | 'traceability'>();
  @Output() editClicked = new EventEmitter<void>();

  constructor(private router: Router) {}

  onBack(): void {
    this.backClicked.emit();
    this.router.navigate(['/characterization-up']);
  }

  onViewChange(view: 'details' | 'traceability'): void {
    this.viewChanged.emit(view);
  }

  onEditClick(): void {
    this.editClicked.emit();
  }

  getTitle(): string {
    if (!this.characterizationUp) return 'Caracterización UP';
    return this.characterizationUp?.codigoUnidadProductiva || this.characterizationUp?.codigoUP || 'Caracterización UP';
  }

  getId(): string {
    return this.characterizationUp?.id || 'N/A';
  }
}
