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
  selector: 'app-legalization-supplies-form-page',
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
  templateUrl: './legalization-supplies-form-page.component.html',
  styleUrls: ['./legalization-supplies-form-page.component.scss']
})
export class LegalizationSuppliesFormPageComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  form!: FormGroup;
  isEditMode = false;
  title: string = 'Crear Legalización Insumos UP';

  // Map reference
  // @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

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
  tipoSistemaCondicionesProtegidas = ['Sistema 1', 'Sistema 2', 'Sistema 3'];
  tiposEntrega = ['Entrega Tipo 1', 'Entrega Tipo 2', 'Entrega Tipo 3'];
  articulos = ['Artículo 1', 'Artículo 2', 'Artículo 3'];
  unidadesMedida = ['Kg', 'Litros', 'Unidades'];

  // Map for calculated fields
  entregaSeleccionadaMap: { [key: string]: string } = {
    'Entrega Tipo 1': 'Entrega 1 Seleccionada',
    'Entrega Tipo 2': 'Entrega 2 Seleccionada',
    'Entrega Tipo 3': 'Entrega 3 Seleccionada',
  };

  // File selection tracking
  selectedFiles: { [key: string]: string } = {};

  async ngOnInit() {
    this.initializeForm();
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
      nombreBeneficiario: [{ value: '', disabled: true }],
      tipoUnidadProductiva: ['', Validators.required],
      noCaracterizado: [{ value: 'No se encuentra caracterizado', disabled: true }],

      // SECCION 2: Datos Representante Unidad Productiva
      nombreResponsable: [{ value: '', disabled: true }],
      tipoDocumentoResponsable: [{ value: '', disabled: true }],
      numeroDocumentoResponsable: [{ value: '', disabled: true }],
      telefonoContacto: ['', Validators.required],
      convenio: ['', Validators.required],
      region: [{ value: '', disabled: true }],
      municipio: [{ value: '', disabled: true }],
      zona: [{ value: '', disabled: true }],
      tipoBarrioVereda: [{ value: '', disabled: true }],
      nombreBarrio: [{ value: '', disabled: true }],
      vereda: [{ value: '', disabled: true }],
      direccionUbicacion: ['', Validators.required],

      // SECCION 3: Información del funcionario
      numeroDocumentoFuncionario: ['', Validators.required],
      nombresApellidosFuncionario: ['', Validators.required],
      telefonoFuncionario: [{ value: '', disabled: true }],

      // SECCION 4: Información de la entrega
      tipoSistemaCondicionesProtegidas: ['', Validators.required],
      fechaEntrega: ['', Validators.required],

      // SECCION 5: Detalles de la entrega
      entregasRealizadas: this.fb.array([]),

      // SECCION 6: Soporte
      evidenciaFotografica: [''],
      utilizaActaFisica: ['', Validators.required],
      actaFisicaEscaneada: [''],

      // SECCION 7: Firmas
      firmaRepresentante: [''],
      firmaFuncionarioMunicipio: [''],
    });

    // Set current year or other defaults if needed

    // Watch for changes
    this.form.get('utilizaActaFisica')?.valueChanges.subscribe(value => {
      const actaControl = this.form.get('actaFisicaEscaneada');
      if (value === 'si') {
        actaControl?.setValidators([Validators.required]);
      } else {
        actaControl?.clearValidators();
      }
      actaControl?.updateValueAndValidity();
    });
  }

  checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.title = 'Editar Legalización Insumos UP';
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

  // Form array getters
  getEntregasRealizadas(): FormArray {
    return this.form.get('entregasRealizadas') as FormArray;
  }

  getDetalleArticulos(entregaIndex: number): FormArray {
    return this.getEntregasRealizadas().at(entregaIndex).get('detalleArticulos') as FormArray;
  }

  // Add entrega to entregas realizadas
  addEntrega(): void {
    const entregaForm = this.fb.group({
      tipoEntrega: ['', Validators.required],
      tipoEntregaFijo: [{ value: '', disabled: true }],
      entregaSeleccionada: [{ value: '', disabled: true }],
      detalleArticulos: this.fb.array([]),
    });

    // Watch for tipoEntrega changes
    entregaForm.get('tipoEntrega')?.valueChanges.subscribe(value => {
      entregaForm.get('tipoEntregaFijo')?.setValue(value || '');
      entregaForm.get('entregaSeleccionada')?.setValue(value ? this.entregaSeleccionadaMap[value] || '' : '');
    });

    this.getEntregasRealizadas().push(entregaForm);
  }

  // Remove entrega from entregas realizadas
  removeEntrega(index: number): void {
    this.getEntregasRealizadas().removeAt(index);
  }

  // Add articulo to detalle articulos
  addArticulo(entregaIndex: number): void {
    const articuloForm = this.fb.group({
      articuloSeleccionado: ['', Validators.required],
      medidas: ['', Validators.required],
      unidadMedida: ['', Validators.required],
      cantidadContratada: ['', Validators.required],
      cantidadEntregada: [0, Validators.required],
    });

    this.getDetalleArticulos(entregaIndex).push(articuloForm);
  }

  // Remove articulo from detalle articulos
  removeArticulo(entregaIndex: number, articuloIndex: number): void {
    this.getDetalleArticulos(entregaIndex).removeAt(articuloIndex);
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

    const mapElement = document.getElementById('map-container');
    if (!mapElement) {
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
      this.map = this.L.map(mapElement).setView([6.25184, -75.56359], 13); // Medellín coordinates
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

  onMapReady(map: L.Map) {
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

  updateTecnicoInfo() {
    // Update readonly fields based on selections
    const region = this.form.get('region')?.value;
    const municipio = this.form.get('municipio')?.value;

    if (region && municipio) {
      this.form.patchValue({
        nombreRepresentanteUnidad: `Representante ${municipio}`,
        convenio: `Convenio ${region}`,
        funcionarioVisita: `Funcionario ${municipio}`,
        region: region,
        municipio: municipio,
        zona: 'Zona Norte',
        tipoBarrioVereda: 'Barrio',
        nombreBarrio: 'Barrio Ejemplo',
        vereda: 'Vereda Ejemplo',
      });
    }
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
      // Here you would save the data
      this.router.navigate(['/legalization-supplies']);
    }
  }

  onCancel() {
    this.router.navigate(['/legalization-supplies']);
  }
}
