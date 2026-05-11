import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-psychosocial-details-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './psychosocial-details-header.html',
  styleUrl: './psychosocial-details-header.scss',
})
export class PsychosocialDetailsHeaderComponent {
  @Input() psychosocial: any = null;
  @Input() showBackButton: boolean = true;
  @Input() activeView: 'details' | 'traceability' = 'details';

  @Output() backClicked = new EventEmitter<void>();
  @Output() viewChanged = new EventEmitter<'details' | 'traceability'>();
  @Output() editClicked = new EventEmitter<void>();

  constructor(private router: Router) {}

  onBack(): void {
    this.backClicked.emit();
    this.router.navigate(['/psychosocial']);
  }

  onViewChange(view: 'details' | 'traceability'): void {
    this.viewChanged.emit(view);
  }

  onEditClick(): void {
    this.editClicked.emit();
  }

  getTitle(): string {
    const nombre = this.psychosocial?.nombresNino || this.psychosocial?.nombre || '';
    return nombre?.trim() ? `Psicosocial - ${nombre}` : 'Psicosocial';
  }
}
