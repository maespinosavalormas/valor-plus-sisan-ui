import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-complements-details-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './complements-details-header.html',
  styleUrl: './complements-details-header.scss',
})
export class ComplementsDetailsHeaderComponent {
  @Input() complement: any = null;
  @Input() showBackButton: boolean = true;
  @Input() activeView: 'details' | 'traceability' = 'details';

  @Output() backClicked = new EventEmitter<void>();
  @Output() viewChanged = new EventEmitter<'details' | 'traceability'>();
  @Output() editClicked = new EventEmitter<void>();

  constructor(private router: Router) {}

  onBack(): void {
    this.backClicked.emit();
    this.router.navigate(['/complements']);
  }

  onViewChange(view: 'details' | 'traceability'): void {
    this.viewChanged.emit(view);
  }

  onEditClick(): void {
    this.editClicked.emit();
  }

  getTitle(): string {
    const nombre = this.complement?.primerNombreParticipante || this.complement?.nombre || '';
    const apellido = this.complement?.primerApellidoParticipante || '';
    const fullName = `${nombre} ${apellido}`.trim();
    return fullName ? `Complemento - ${fullName}` : 'Complemento';
  }
}
