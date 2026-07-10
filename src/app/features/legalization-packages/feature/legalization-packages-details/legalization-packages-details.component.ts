import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LegalizationPackagesDetailsHeaderComponent } from '../../ui/legalization-packages-details-header/legalization-packages-details-header.component';
import { LegalizationPackagesTraceabilityComponent } from '../legalization-packages-traceability/legalization-packages-traceability.component';

@Component({
  selector: 'app-legalization-packages-details',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, LegalizationPackagesDetailsHeaderComponent, LegalizationPackagesTraceabilityComponent],
  templateUrl: './legalization-packages-details.component.html',
  styleUrl: './legalization-packages-details.component.scss'
})
export class LegalizationPackagesDetailsComponent implements OnInit {
  @Input() package: any;
  @Output() back = new EventEmitter<void>();
  @Output() viewChanged = new EventEmitter<string>();

  currentView: 'details' | 'traceability' = 'details';

  constructor(private router: Router) {}

  ngOnInit() {}

  onBack() {
    this.back.emit();
  }

  onViewChange(view: 'details' | 'traceability') {
    this.currentView = view;
    this.viewChanged.emit(view);
  }

  onEdit() {
    // Navigate to edit page or emit edit event
    console.log('Edit clicked for package:', this.package);
    this.router.navigate(['/edit-package', this.package.id]);
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES');
  }
}
