import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-legalization-supplies-details-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './legalization-supplies-details-header.html',
  styleUrl: './legalization-supplies-details-header.scss',
})
export class LegalizationSuppliesDetailsHeaderComponent {
  @Input() legalization: any = null;
  @Input() showBackButton: boolean = true;
  @Input() activeView: 'details' | 'traceability' = 'details';

  @Output() backClicked = new EventEmitter<void>();
  @Output() viewChanged = new EventEmitter<'details' | 'traceability'>();
  @Output() editClicked = new EventEmitter<void>();

  constructor(private router: Router) {}

  onBack(): void {
    this.backClicked.emit();
    this.router.navigate(['/legalization-supplies']);
  }

  onViewChange(view: 'details' | 'traceability'): void {
    this.viewChanged.emit(view);
  }

  onEditClick(): void {
    this.editClicked.emit();
  }

  getTitle(): string {
    const codigo = this.legalization?.codigoUnidadProductiva || this.legalization?.codigoUP || '';
    return codigo?.trim() ? `Legalización Insumos UP - ${codigo}` : 'Legalización Insumos UP';
  }
}
