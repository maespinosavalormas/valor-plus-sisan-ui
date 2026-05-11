import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-legalization-packages-details-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './legalization-packages-details-header.component.html',
  styleUrl: './legalization-packages-details-header.component.scss'
})
export class LegalizationPackagesDetailsHeaderComponent {
  @Input() package: any = null;
  @Input() showBackButton: boolean = true;
  @Input() activeView: 'details' | 'traceability' = 'details';
  @Output() backClicked = new EventEmitter<void>();
  @Output() viewChanged = new EventEmitter<'details' | 'traceability'>();

  constructor(private router: Router) {}

  getStatusClass(): string {
    const deliveryStatus = this.getDeliveryStatus();
    switch (deliveryStatus.toLowerCase()) {
      case 'entregado':
        return 'status-active';
      case 'programado':
        return 'status-inactive';
      default:
        return 'status-inactive';
    }
  }

  getStatusLabel(): string {
    return this.getDeliveryStatus();
  }

  onBack(): void {
    this.backClicked.emit();
    // Also navigate back to legalization-packages page
    this.router.navigate(['/legalization-packages']);
  }

  onViewChange(view: 'details' | 'traceability'): void {
    this.viewChanged.emit(view);
  }

  private getDeliveryStatus(): string {
    const deliveryDate = this.package?.fechaEntrega;
    if (!deliveryDate) return 'Pendiente';

    const today = new Date();
    const delivery = new Date(deliveryDate);

    if (delivery <= today) {
      return 'Entregado';
    } else {
      return 'Programado';
    }
  }
}
