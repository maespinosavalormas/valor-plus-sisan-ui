import { ChangeDetectorRef, Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NutritionalMonitoringFormComponent } from '../../ui/nutritional-monitoring-form/nutritional-monitoring-form.component';

export interface NutritionalMonitoringItem {
  id: string;
  fecha: string;
  peso: number;
  talla: number;
  pc: number;
  imc: number;
  clasificacion: string;
  observaciones: string;
}

export interface Case {
  upgdCode: string;
}

@Component({
  selector: 'app-case-nutritional-monitoring',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDialogModule
  ],
  templateUrl: './case-nutritional-monitoring.component.html',
  styleUrls: ['./case-nutritional-monitoring.component.scss']
})
export class CaseNutritionalMonitoringComponent implements OnInit {
  @Input() embedded: boolean = false;
  @Input() selectedCaseInfo: Case | null = null;
  @Output() close = new EventEmitter<void>();
  
  nutritionalForm: FormGroup;
  showAddForm: boolean = false;
  
  // Search and filter properties
  searchTerm: string = '';
  selectedClassification: string = 'all';
  filteredData: NutritionalMonitoringItem[] = [];
  
  nutritionalData: NutritionalMonitoringItem[] = [
    {
      id: '1',
      fecha: '2024-01-15',
      peso: 65.5,
      talla: 165.2,
      pc: 42.5,
      imc: 24.0,
      clasificacion: 'Normal',
      observaciones: 'Paciente estable, buen apetito'
    },
    {
      id: '2',
      fecha: '2024-01-22',
      peso: 66.0,
      talla: 165.2,
      pc: 43.0,
      imc: 24.2,
      clasificacion: 'Normal',
      observaciones: 'Ligero aumento de peso, continua tratamiento'
    },
    {
      id: '3',
      fecha: '2024-01-29',
      peso: 66.8,
      talla: 165.2,
      pc: 43.2,
      imc: 24.5,
      clasificacion: 'Normal',
      observaciones: 'Progreso favorable, mantiene adherencia'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.nutritionalForm = this.fb.group({
      fecha: ['', Validators.required],
      peso: ['', Validators.required],
      talla: ['', Validators.required],
      pc: [''],
      observaciones: ['']
    });
    
    this.filteredData = [...this.nutritionalData];
  }

  // Search and filter methods
  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  onClassificationFilterChange(value: string): void {
    this.selectedClassification = value;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedClassification = 'all';
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.nutritionalData];
    
    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.fecha.toLowerCase().includes(searchLower) ||
        item.peso.toString().includes(searchLower) ||
        item.talla.toString().includes(searchLower) ||
        item.pc?.toString().includes(searchLower) ||
        item.imc.toString().includes(searchLower) ||
        item.clasificacion.toLowerCase().includes(searchLower) ||
        (item.observaciones && item.observaciones.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply classification filter
    if (this.selectedClassification !== 'all') {
      filtered = filtered.filter(item => 
        item.clasificacion === this.selectedClassification
      );
    }
    
    this.filteredData = filtered;
  }

  ngOnInit(): void {
    // Cargar datos de monitoreo nutricional si es necesario
  }

  toggleAddForm(): void {
    this.openNutritionalMonitoringDialog();
  }

  openNutritionalMonitoringDialog(): void {
    const dialogRef = this.dialog.open(NutritionalMonitoringFormComponent, {
      width: '90%',
      maxWidth: '800px',
      maxHeight: '95vh',
      data: {
        isEdit: false,
        monitoringData: null
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Convertir los datos del formulario al formato esperado
        const newMonitoring: NutritionalMonitoringItem = {
          id: (this.nutritionalData.length + 1).toString(),
          fecha: new Date().toISOString().split('T')[0], // Fecha actual
          peso: this.extractPesoFromData(result),
          talla: this.extractTallaFromData(result),
          pc: this.extractPCFromData(result),
          imc: 0, // Se calculará después
          clasificacion: result.clasificacionEstadoNutricional || 'Sin clasificar',
          observaciones: this.generateObservations(result)
        };
        
        // Calcular IMC
        newMonitoring.imc = this.calculateIMC(newMonitoring.peso, newMonitoring.talla);

        this.nutritionalData.push(newMonitoring);
        // Refrescar la lista visible y forzar CD: este callback es async y el
        // componente se embebe dentro de un padre OnPush (cases-details), que
        // de lo contrario saltaría este subárbol y no mostraría el nuevo registro.
        this.applyFilters();
        this.cdr.markForCheck();
      }
    });
  }

  extractPesoFromData(data: any): number {
    // Intentar extraer peso del campo pesoTalla o usar un valor por defecto
    if (data.pesoTalla && !isNaN(parseFloat(data.pesoTalla))) {
      return parseFloat(data.pesoTalla);
    }
    return 0; // Valor por defecto si no se encuentra
  }

  extractTallaFromData(data: any): number {
    // Intentar extraer talla del campo tallaEdad o usar un valor por defecto
    if (data.tallaEdad && !isNaN(parseFloat(data.tallaEdad))) {
      return parseFloat(data.tallaEdad);
    }
    return 0; // Valor por defecto si no se encuentra
  }

  extractPCFromData(data: any): number {
    // Intentar extraer PC del campo pc o usar un valor por defecto
    if (data.pc && !isNaN(parseFloat(data.pc))) {
      return parseFloat(data.pc);
    }
    return 0; // Valor por defecto si no se encuentra
  }

  generateObservations(data: any): string {
    const observations: string[] = [];
    
    // Agregar información de signos de enfermedad
    if (data.signosEnfermedadActual) {
      const signos: string[] = [];
      Object.entries(data.signosEnfermedadActual).forEach(([key, value]) => {
        if (value === true) {
          const signoLabel = this.getSignoLabel(key);
          if (signoLabel) signos.push(signoLabel);
        }
      });
      if (signos.length > 0) {
        observations.push(`Signos: ${signos.join(', ')}`);
      }
    }
    
    // Agregar información de frecuencia de enfermedad
    if (data.enfermaConFrecuencia === 'si' && data.cualTiene && data.cualTiene.length > 0) {
      observations.push(`Frecuencia: ${data.cualTiene.join(', ')}`);
    } else if (data.enfermaConFrecuencia === 'no') {
      observations.push('No enferma con frecuencia');
    }
    
    // Agregar información de medidas antropométricas
    const medidas: string[] = [];
    if (data.tallaEdad) medidas.push(`Talla/Edad: ${data.tallaEdad}`);
    if (data.pc) medidas.push(`PC: ${data.pc}`);
    if (data.pesoTalla) medidas.push(`Peso/Talla: ${data.pesoTalla}`);
    if (data.imdEdad) medidas.push(`IMD/Edad: ${data.imdEdad}`);
    
    if (medidas.length > 0) {
      observations.push(`Medidas: ${medidas.join(', ')}`);
    }
    
    return observations.join(' | ') || 'Sin observaciones adicionales';
  }

  getSignoLabel(key: string): string {
    const labels: { [key: string]: string } = {
      'problemasOido': 'Problemas de oído',
      'fiebre': 'Fiebre',
      'dolorAbdominal': 'Dolor abdominal',
      'dolorGarganta': 'Dolor de garganta',
      'lesionesCutaneas': 'Lesiones cutáneas',
      'era': 'ERA',
      'dolorCabeza': 'Dolor de cabeza',
      'diarrea': 'Diarrea',
      'sintomasVisuales': 'Síntomas Visuales/Oculares',
      'sintomasUrinarios': 'Síntomas Urinarios',
      'dolorExtremidades': 'Dolor en extremidades',
      'noPresenta': 'No Presenta'
    };
    return labels[key] || key;
  }

  addMonitoring(): void {
    if (this.nutritionalForm.valid) {
      const newMonitoring: NutritionalMonitoringItem = {
        id: (this.nutritionalData.length + 1).toString(),
        fecha: this.nutritionalForm.value.fecha,
        peso: parseFloat(this.nutritionalForm.value.peso),
        talla: parseFloat(this.nutritionalForm.value.talla),
        pc: 0, // No hay campo PC en el formulario simple, valor por defecto
        imc: this.calculateIMC(parseFloat(this.nutritionalForm.value.peso), parseFloat(this.nutritionalForm.value.talla)),
        clasificacion: this.getClassification(this.calculateIMC(parseFloat(this.nutritionalForm.value.peso), parseFloat(this.nutritionalForm.value.talla))),
        observaciones: this.nutritionalForm.value.observaciones
      };
      
      this.nutritionalData.push(newMonitoring);
      this.applyFilters();
      this.nutritionalForm.reset();
      this.showAddForm = false;
    }
  }

  calculateIMC(peso: number, talla: number): number {
    const tallaMetros = talla / 100;
    return Math.round((peso / (tallaMetros * tallaMetros)) * 10) / 10;
  }

  getClassification(imc: number): string {
    if (imc < 18.5) return 'Bajo peso';
    if (imc < 25) return 'Normal';
    if (imc < 30) return 'Sobrepeso';
    return 'Obesidad';
  }

  getClassBadgeClass(clasificacion: string): string {
    switch (clasificacion.toLowerCase()) {
      case 'bajo peso':
        return 'classification-bajo-peso';
      case 'normal':
        return 'classification-normal';
      case 'sobrepeso':
        return 'classification-sobrepeso';
      case 'obesidad':
        return 'classification-obesidad';
      default:
        return 'classification-normal';
    }
  }

  goBack(): void {
    if (this.embedded) {
      this.close.emit();
    } else {
      // Navegar hacia atrás si no está embedded
    }
  }
}
