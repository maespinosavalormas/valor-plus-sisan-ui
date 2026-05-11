import { Component, OnInit, AfterViewInit, inject, ViewChild, ElementRef, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Router, ActivatedRoute } from '@angular/router';
// import { LeafletModule } from '@asymmetrik/ngx-leaflet';
// import * as L from 'leaflet';

@Component({
  selector: 'app-at-comprehensive-up-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './at-comprehensive-up-form-page.component.html',
  styleUrls: ['./at-comprehensive-up-form-page.component.scss']
})
export class AtComprehensiveUpFormPageComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  form!: FormGroup;
  isEditMode = false;
  title: string = 'Crear AT Integral UP';

  // Map reference
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  // Map properties
  options: any;
  layers: any[] = [];
  marker: any;
  map: any; // Manual map instance

  // Dynamic leaflet
  L: any;

  // Coordinate display properties
  displayedLatitud: string = 'No seleccionada';
  displayedLongitud: string = 'No seleccionada';

  isBrowser = isPlatformBrowser(this.platformId);

  // Data arrays for dropdowns
  regions = ['Antioquia', 'Cundinamarca', 'Valle del Cauca', 'Santander'];
  municipios = ['Medellín', 'Bogotá', 'Cali', 'Bucaramanga'];
  zonas = ['Zona 1', 'Zona 2', 'Zona 3'];
  veredas = ['Vereda 1', 'Vereda 2', 'Vereda 3'];
  tiposDocumento = ['CC', 'CE', 'TI', 'RC', 'PAS'];
  tiposUnidadProductiva = ['Familiares', 'Escolares', 'Comunitarias', 'Indigenas Municipios', 'Indigenas Almendros'];
  tiposBarrioVereda = ['Barrio', 'Vereda'];
  funcionesFuncionario = ['Técnico', 'Profesional', 'Asistente', 'Otro'];
  fasesProcesoProduccion = ['Siembra', 'Crecimiento', 'Cosecha', 'Post-cosecha'];
  productosDisponibles = ['Tomate', 'Lechuga', 'Zanahoria', 'Cebolla', 'Papa', 'Otro'];
  situacionesUnidadProductiva = ['Activa', 'Inactiva'];
  estadosImplementacion = ['Sí', 'No', 'Parcialmente'];

  // File selection tracking
  selectedFiles: { [key: string]: string } = {};

  async ngOnInit() {
    this.initializeForm();
    this.initializeMap();
    this.checkEditMode();
  }

  async ngAfterViewInit() {
    if (this.isBrowser) {
      // Delay to ensure the map element is rendered
      setTimeout(async () => {
        await this.initializeMap();
      }, 100);
    }
  }

  initializeForm() {
    this.form = this.fb.group({
      // SECCION 1: Información General
      codigoUnidadProductiva: ['', Validators.required],
      nombreCompletoBeneficiario: [{ value: '', disabled: true }],
      tipoUnidadProductiva: ['', Validators.required],
      noSeEncuentraCaracterizado: [{ value: '', disabled: true }],

      // SECCION 2: Datos Representante Unidad Productiva
      nombreResponsable: [{ value: '', disabled: true }],
      tipoDocumentoResponsable: ['', Validators.required],
      numeroDocumentoResponsable: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      telefonoContactoResponsable: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      convenio: [{ value: '', disabled: true }],
      region: ['', Validators.required],
      municipio: ['', Validators.required],
      zona: ['', Validators.required],
      tipoBarrioVereda: ['', Validators.required],
      nombreBarrio: ['', Validators.required],
      vereda: ['', Validators.required],
      direccionUbicacion: ['', Validators.required],

      // SECCION 3: Información del funcionario
      numeroDocumentoFuncionario: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      nombreFuncionario: ['', Validators.required],
      funcionFuncionario: ['', Validators.required],
      fechaAsistenciaTecnica: ['', Validators.required],
      numeroAsistenciaTecnica: ['', Validators.required],

      // SECCION 4: Detalles de la asistencia
      latitud: ['', Validators.required],
      longitud: ['', Validators.required],
      faseProcesoProduccion: ['', Validators.required],

      // SECCION 5: Detalles de la cosecha
      productosProducidos: this.fb.array([]),

      // SECCION 6: Detalles de la asistencia tecnica
      mostrarSituacionPrevia: [{ value: '', disabled: true }],
      situacionEncontrada: ['', Validators.required],
      mostrarRecomendacionPrevia: [{ value: '', disabled: true }],
      recomendacionesTecnicas: ['', Validators.required],
      fotografiaInterior: [''],
      unidadProductivaImplementada: ['', Validators.required],
      unidadProductivaActiva: ['', Validators.required],

      // SECCION 7: Consentimiento informado
      fechaHoraFinalizacion: [{ value: '', disabled: true }],
      consentimientoDatosPersonales: ['', Validators.required],
      consentimientoImagenesAudios: ['', Validators.required],
      firmaRepresentante: [''],
      anoRealizacionEncuesta: [{ value: '', disabled: true }],
    });

    // Set current year for survey year
    const currentYear = new Date().getFullYear();
    this.form.get('anoRealizacionEncuesta')?.setValue(currentYear);

    // Set completion timestamp
    this.form.get('fechaHoraFinalizacion')?.setValue(new Date().toISOString().slice(0, 16));

    // Conditional logic
    this.setupConditionalLogic();
  }

  setupConditionalLogic() {
    // Add any conditional logic here if needed
    // For example, showing/hiding fields based on other field values
  }

  checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.title = 'Editar AT Integral UP';
      this.loadFormData(id);
    }
  }

  loadFormData(id: string) {
    // Get data from router state or fetch by ID
    const navigation = this.router.getCurrentNavigation();
    const item = navigation?.extras.state?.['item'];

    if (item) {
      // Pre-fill form with item data - adjust as needed
      this.form.patchValue({
        // Set edit values here based on item data
      });
    }
  }

  // Initialize map (commented out for now)
  // initializeMap(): void {
  //   if (this.mapContainer) {
  //     this.map = L.map(this.mapContainer.nativeElement).setView([6.2442, -75.5812], 13);

  async initializeMap() {
    if (!this.isBrowser) {
      console.log('Cannot initialize map: not browser');
      return;
    }

    if (!this.mapContainer) {
      console.log('Map container element not found');
      return;
    }

    try {
      console.log('Starting leaflet import');
      // Dynamic import of leaflet
      const L = await import('leaflet');
      console.log('Leaflet imported successfully:', L);
      this.L = L.default || L;

      // Configure marker icons to use unpkg CDN for better reliability
      this.L.Icon.Default.prototype.options.iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';

      // Create map instance manually on the element
      this.map = this.L.map(this.mapContainer.nativeElement).setView([6.25184, -75.56359], 13); // Medellín coordinates
      console.log('Map created:', this.map);

      // Add tile layer
      this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      // Invalidate size to ensure proper rendering
      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);

      // Handle map clicks
      this.map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        console.log('Map clicked:', lat, lng);
        this.onMapClick(lat, lng);
      });

    } catch (error) {
      console.error('Error loading leaflet:', error);
    }
  }

  onMapReady(map: any) {
    if (this.isBrowser) {
      setTimeout(() => map.invalidateSize(), 0);
    }
  }

  onMapClick(lat: number, lng: number) {
    if (!this.isBrowser || !this.L) return;

    const markerIcon = this.L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      shadowSize: [41, 41]
    });

    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = this.L.marker([lat, lng], { draggable: true, icon: markerIcon });
      this.marker.on('dragend', () => {
        const position = this.marker.getLatLng();
        this.updateCoordinates(position.lat, position.lng);
      });
      this.marker.addTo(this.map);
    }

    this.updateCoordinates(lat, lng);
  }

  updateCoordinates(lat: number, lng: number) {
    console.log('Updating coordinates:', lat, lng);
    const latStr = lat.toFixed(6);
    const lngStr = lng.toFixed(6);
    this.displayedLatitud = latStr;
    this.displayedLongitud = lngStr;
    this.form.get('latitud')?.setValue(latStr);
    this.form.get('longitud')?.setValue(lngStr);
    console.log('Form values:', this.form.get('latitud')?.value, this.form.get('longitud')?.value);
    console.log('Displayed values:', this.displayedLatitud, this.displayedLongitud);
    this.cdr.detectChanges();
  }

  onCoordinatesInput() {
    const lat = parseFloat(this.form.get('latitud')?.value);
    const lng = parseFloat(this.form.get('longitud')?.value);

    if (!isNaN(lat) && !isNaN(lng)) {
      this.updateMarker(lat, lng);
    }
  }

  updateMarker(lat: number, lng: number) {
    if (!this.isBrowser || !this.L) return;

    const markerIcon = this.L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      shadowSize: [41, 41]
    });

    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = this.L.marker([lat, lng], { draggable: true, icon: markerIcon });
      this.marker.on('dragend', () => {
        const position = this.marker.getLatLng();
        this.updateCoordinates(position.lat, position.lng);
      });
      this.marker.addTo(this.map);
    }
  }

  updateTecnicoInfo() {
    // Update readonly fields based on selections
    const region = this.form.get('region')?.value;
    const municipio = this.form.get('municipio')?.value;

    if (region && municipio) {
      this.form.patchValue({
        nombreResponsable: `Representante ${municipio}`,
        convenio: `Convenio ${region}`,
        region: region,
        municipio: municipio,
        zona: 'Zona Norte',
        tipoBarrioVereda: 'Barrio',
        nombreBarrio: 'Barrio Ejemplo',
        vereda: 'Vereda Ejemplo',
      });
    }
  }

  get productosProducidos(): FormArray {
    return this.form.get('productosProducidos') as FormArray;
  }

  addProducto(): void {
    const productoForm = this.fb.group({
      seleccioneProducto: ['', Validators.required],
      cualProducto: [''],
      kilosProducidos: [0, [Validators.required, Validators.min(0)]],
      listaProductosTotal: [{ value: '', disabled: true }],
      productosCheck: [{ value: false, disabled: true }],
      sumaKilosProducidos: [{ value: 0, disabled: true }],
      fotoSeguimiento: [''],
      kilosAutoconsumo: [0, [Validators.required, Validators.min(0)]],
      kilosPAE: [0, [Validators.required, Validators.min(0)]],
      kilosTrueque: [0, [Validators.required, Validators.min(0)]],
      kilosVentaDirecta: [0, [Validators.required, Validators.min(0)]],
      kilosDonacion: [0, [Validators.required, Validators.min(0)]],
      kilosHoteles: [0, [Validators.required, Validators.min(0)]],
      kilosRestaurantes: [0, [Validators.required, Validators.min(0)]],
      kilosCafeteria: [0, [Validators.required, Validators.min(0)]],
      sumaTodosDestinos: [{ value: 0, disabled: true }],
      totalProducidoMenosDestinos: [{ value: 0, disabled: true }],
      totalDestinosKg: [{ value: '', disabled: true }],
      diferenciaProduccion: [{ value: '', disabled: true }],
    });

    // Watch for changes to calculate totals
    this.setupProductoCalculations(productoForm);

    this.productosProducidos.push(productoForm);
  }

  removeProducto(index: number): void {
    this.productosProducidos.removeAt(index);
    this.calculateTotales();
  }

  setupProductoCalculations(productoForm: FormGroup): void {
    // Watch for product selection
    productoForm.get('seleccioneProducto')?.valueChanges.subscribe(value => {
      const cualControl = productoForm.get('cualProducto');
      if (value === 'Otro') {
        cualControl?.setValidators([Validators.required]);
      } else {
        cualControl?.clearValidators();
        cualControl?.setValue('');
      }
      cualControl?.updateValueAndValidity();
    });

    // Watch for destination changes to calculate totals
    const destinationFields = [
      'kilosAutoconsumo', 'kilosPAE', 'kilosTrueque', 'kilosVentaDirecta',
      'kilosDonacion', 'kilosHoteles', 'kilosRestaurantes', 'kilosCafeteria'
    ];

    destinationFields.forEach(field => {
      productoForm.get(field)?.valueChanges.subscribe(() => {
        this.calculateProductoTotales(productoForm);
      });
    });

    // Watch for kilosProducidos changes
    productoForm.get('kilosProducidos')?.valueChanges.subscribe(value => {
      productoForm.get('productosCheck')?.setValue(value > 0);
      this.calculateProductoTotales(productoForm);
    });
  }

  calculateProductoTotales(productoForm: FormGroup): void {
    const kilosProducidos = productoForm.get('kilosProducidos')?.value || 0;
    const destinos = [
      productoForm.get('kilosAutoconsumo')?.value || 0,
      productoForm.get('kilosPAE')?.value || 0,
      productoForm.get('kilosTrueque')?.value || 0,
      productoForm.get('kilosVentaDirecta')?.value || 0,
      productoForm.get('kilosDonacion')?.value || 0,
      productoForm.get('kilosHoteles')?.value || 0,
      productoForm.get('kilosRestaurantes')?.value || 0,
      productoForm.get('kilosCafeteria')?.value || 0,
    ];

    const sumaDestinos = destinos.reduce((sum, value) => sum + value, 0);
    const diferencia = kilosProducidos - sumaDestinos;

    productoForm.patchValue({
      sumaTodosDestinos: sumaDestinos,
      totalProducidoMenosDestinos: diferencia,
      totalDestinosKg: `${sumaDestinos} kg`,
      diferenciaProduccion: `${diferencia} kg`,
    });

    this.calculateTotales();
  }

  calculateTotales(): void {
    // Calculate totals across all products
    let totalKilos = 0;
    let totalDestinos = 0;

    this.productosProducidos.controls.forEach(producto => {
      totalKilos += producto.get('kilosProducidos')?.value || 0;
      totalDestinos += producto.get('sumaTodosDestinos')?.value || 0;
    });

    // Update form with totals if needed
    // This could be used for summary fields if required
  }

  onBirthDateChange() {
    const birthDate = this.form.get('fechaNacimientoResponsable')?.value;
    if (birthDate) {
      const age = this.calculateAge(birthDate);
      this.form.get('edadResponsable')?.setValue(age);
    }
  }

  // Helper method to calculate age
  calculateAge(birthDate: string): number {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  onFileSelected(event: any, fieldName: string) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFiles[fieldName] = file.name;
      this.form.get(fieldName)?.setValue(file);
    }
  }

  onSave() {
    if (this.form.valid) {
      console.log('Form data:', this.form.value);
      // TODO: Implement save logic
      this.router.navigate(['/at-comprehensive-up']);
    }
  }

  onCancel() {
    this.router.navigate(['/at-comprehensive-up']);
  }
}
