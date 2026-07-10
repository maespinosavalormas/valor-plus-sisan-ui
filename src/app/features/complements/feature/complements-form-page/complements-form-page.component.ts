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
  selector: 'app-complements-form-page',
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
  templateUrl: './complements-form-page.component.html',
  styleUrl: './complements-form-page.component.scss'
})
export class ComplementsFormPageComponent implements OnInit, AfterViewInit {
  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute, @Inject(PLATFORM_ID) private platformId: any, private cdr: ChangeDetectorRef) {
    this.initializeForm();
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  form!: FormGroup;
  isEditMode = false;
  title: string = 'Crear Complemento';

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

  isBrowser: boolean;

  // Data arrays for dropdowns
  regions = ['Antioquia', 'Cundinamarca', 'Valle del Cauca', 'Santander'];
  municipios = ['Medellín', 'Bogotá', 'Cali', 'Bucaramanga'];
  tiposDocumento = ['CC', 'CE', 'TI', 'RC', 'PAS'];
  sexos = ['Masculino', 'Femenino'];
  tiposPoblacion = ['Tipo 1', 'Tipo 2', 'Tipo 3'];
  periodosEntrega = ['Período 1', 'Período 2', 'Período 3'];
  lugaresEncuentro = ['Lugar 1', 'Lugar 2', 'Lugar 3'];
  grupos = ['Grupo 1', 'Grupo 2', 'Grupo 3'];
  quienesReciben = ['Participante', 'Cuidador', 'Otro'];
  tiposRegistro = ['Firma digital', 'Planilla física'];

  // Alert flag
  mostrarAlertaBeneficiarioYaRecibio = false;

  // File selection tracking
  selectedFiles: { [key: string]: string } = {};

  async ngOnInit() {
    this.initializeForm();
    this.cdr.detectChanges();
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
      // SECCION 1: Responsable de la entrega
      region: ['', Validators.required],
      municipio: ['', Validators.required],
      nombresApellidosEntrega: ['', Validators.required],
      tipoDocumentoEntrega: ['', Validators.required],
      numeroDocumentoEntrega: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],

      // SECCION 2: Tipo de población
      tipoPoblacionParticipante: ['', Validators.required],
      numeroDocumentoParticipante: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],

      // Participant info (precargados)
      tipoDocumentoParticipanteInfo: [{ value: '', disabled: true }],
      primerNombreParticipante: [{ value: '', disabled: true }],
      segundoNombreParticipante: [{ value: '', disabled: true }],
      primerApellidoParticipante: [{ value: '', disabled: true }],
      segundoApellidoParticipante: [{ value: '', disabled: true }],
      edadParticipante: [{ value: '', disabled: true }],
      generoParticipante: [{ value: '', disabled: true }],
      regionParticipante: [{ value: '', disabled: true }],
      municipioParticipante: [{ value: '', disabled: true }],
      telefonoContactoBeneficiario: [{ value: '', disabled: true }],
      numeroTelefonicoActual: ['', Validators.required],
      direccionUbicacion: [{ value: '', disabled: true }],

      // Participant info (precargados) - second set
      numeroDocumentoParticipante2: ['', Validators.required],
      tipoDocumentoParticipanteInfo2: [{ value: '', disabled: true }],
      primerNombreParticipante2: [{ value: '', disabled: true }],
      segundoNombreParticipante2: [{ value: '', disabled: true }],
      primerApellidoParticipante2: [{ value: '', disabled: true }],
      segundoApellidoParticipante2: [{ value: '', disabled: true }],
      generoParticipante2: [{ value: '', disabled: true }],
      regionParticipante2: [{ value: '', disabled: true }],
      municipioParticipante2: [{ value: '', disabled: true }],
      telefonoContactoBeneficiario2: [{ value: '', disabled: true }],
      numeroTelefonicoActual2: ['', Validators.required],
      direccionUbicacion2: [{ value: '', disabled: true }],
      fechaEntrega: ['', Validators.required],
      periodoEntrega: ['', Validators.required],
      municipioEntrega: [{ value: '', disabled: true }],
      lugarEncuentro: ['', Validators.required],
      grupo: ['', Validators.required],
      quienRecibeComplemento: ['', Validators.required],

      // Cuidador info (precargados)
      tipoDocumentoCuidador: [{ value: '', disabled: true }],
      numeroDocumentoCuidador: [{ value: '', disabled: true }],
      primerNombreCuidador: [{ value: '', disabled: true }],
      segundoNombreCuidador: [{ value: '', disabled: true }],
      primerApellidoCuidador: [{ value: '', disabled: true }],
      segundoApellidoCuidador: [{ value: '', disabled: true }],
      numeroTelefonicoContacto1: [{ value: '', disabled: true }],
      numeroTelefonicoContacto2: [{ value: '', disabled: true }],
      tipoParticipante: [{ value: '', disabled: true }],

      // Cuidador info (precargados) - second set
      tipoDocumentoCuidador2: [{ value: '', disabled: true }],
      numeroDocumentoCuidador2: [{ value: '', disabled: true }],
      primerNombreCuidador2: [{ value: '', disabled: true }],
      segundoNombreCuidador2: [{ value: '', disabled: true }],
      primerApellidoCuidador2: [{ value: '', disabled: true }],
      segundoApellidoCuidador2: [{ value: '', disabled: true }],
      numeroTelefonicoContacto12: [{ value: '', disabled: true }],
      numeroTelefonicoContacto22: [{ value: '', disabled: true }],
      tipoParticipante2: [{ value: '', disabled: true }],

      // Cuidador info (precargados) - third set
      tipoDocumentoCuidador3: [{ value: '', disabled: true }],
      numeroDocumentoCuidador3: [{ value: '', disabled: true }],
      primerNombreCuidador3: [{ value: '', disabled: true }],
      segundoNombreCuidador3: [{ value: '', disabled: true }],
      primerApellidoCuidador3: [{ value: '', disabled: true }],
      segundoApellidoCuidador3: [{ value: '', disabled: true }],
      numeroTelefonicoContacto13: [{ value: '', disabled: true }],
      numeroTelefonicoContacto23: [{ value: '', disabled: true }],

      // SECCION 4: Consentimiento informado
      adjuntarAutorizacion: [''],
      consentimientoDatosPersonales: ['', Validators.required],
      consentimientoImagenesAudios: ['', Validators.required],
      fotografiaDocumentoIdentidadParticipante: [''],
      fotografiaDocumentoIdentidadCuidador: [''],
      fotografiaPersonaRecibe: [''],
      tipoRegistro: ['', Validators.required],
      firmaPersonaRecibe: [''],
      fotografiaPlanillaFirma: [''],
    });

    // Watch for changes
    this.form.get('numeroDocumentoParticipante')?.valueChanges.subscribe(value => {
      if (value) {
        this.cargarDatosParticipante(value);
      }
    });

    this.form.get('quienRecibeComplemento')?.valueChanges.subscribe(value => {
      if (value) {
        this.cargarDatosCuidador(value);
      }
    });
  }

  checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.title = 'Editar Complemento';
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
  getIntegrantesGrupoFamiliar(): FormArray {
    return this.form.get('integrantesGrupoFamiliar') as FormArray;
  }

  getParticipantesUnidadProductiva(): FormArray {
    return this.form.get('participantesUnidadProductiva') as FormArray;
  }

  // Add integrante to grupo familiar
  addIntegrante(): void {
    const integranteForm = this.fb.group({
      parentescoFamiliar: ['', Validators.required],
      tipoDocumentoIdentidad: ['', Validators.required],
      numeroDocumentoIdentidad: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      primerNombre: ['', Validators.required],
      segundoNombre: [''],
      primerApellido: ['', Validators.required],
      segundoApellido: [''],
      fechaNacimiento: ['', Validators.required],
      edad: [{ value: '', disabled: true }],
      sexo: ['', Validators.required],
      participaProgramaPrimeraInfancia: ['', Validators.required],
      cualProgramaPrimeraInfancia: [''],
      cualOtroPrograma: [''],
    });

    // Watch for birth date changes
    integranteForm.get('fechaNacimiento')?.valueChanges.subscribe(value => {
      if (value) {
        const age = this.calculateAge(value);
        integranteForm.get('edad')?.setValue(age.toString());
      }
    });

    // Watch for programa primera infancia
    integranteForm.get('participaProgramaPrimeraInfancia')?.valueChanges.subscribe(value => {
      const cualControl = integranteForm.get('cualProgramaPrimeraInfancia');
      const otroControl = integranteForm.get('cualOtroPrograma');
      if (value === 'si') {
        cualControl?.setValidators([Validators.required]);
      } else {
        cualControl?.clearValidators();
        otroControl?.clearValidators();
      }
      cualControl?.updateValueAndValidity();
      otroControl?.updateValueAndValidity();
    });

    integranteForm.get('cualProgramaPrimeraInfancia')?.valueChanges.subscribe(value => {
      const otroControl = integranteForm.get('cualOtroPrograma');
      if (value && value.includes('Otro')) {
        otroControl?.setValidators([Validators.required]);
      } else {
        otroControl?.clearValidators();
      }
      otroControl?.updateValueAndValidity();
    });

    this.getIntegrantesGrupoFamiliar().push(integranteForm);
  }

  // Remove integrante from grupo familiar
  removeIntegrante(index: number): void {
    this.getIntegrantesGrupoFamiliar().removeAt(index);
  }

  // Add participante to unidad productiva
  addParticipante(): void {
    const participanteForm = this.fb.group({
      tipoDocumentoParticipante: ['', Validators.required],
      numeroDocumentoParticipante: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      primerNombreParticipante: ['', Validators.required],
      segundoNombreParticipante: [''],
      primerApellidoParticipante: ['', Validators.required],
      segundoApellidoParticipante: [''],
      fechaNacimientoParticipante: ['', Validators.required],
      edadParticipante: [{ value: '', disabled: true }],
      sexoParticipante: ['', Validators.required],
      telefonoContactoParticipante: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    });

    // Watch for birth date changes
    participanteForm.get('fechaNacimientoParticipante')?.valueChanges.subscribe(value => {
      if (value) {
        const age = this.calculateAge(value);
        participanteForm.get('edadParticipante')?.setValue(age.toString());
      }
    });

    this.getParticipantesUnidadProductiva().push(participanteForm);
  }

  // Remove participante from unidad productiva
  removeParticipante(index: number): void {
    this.getParticipantesUnidadProductiva().removeAt(index);
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

  cargarDatosParticipante(documento: string) {
    // Simulate loading data based on document number
    // In real implementation, this would call a service to fetch data
    const mockData = {
      tipoDocumento: 'CC',
      primerNombre: 'Juan',
      segundoNombre: 'Carlos',
      primerApellido: 'Pérez',
      segundoApellido: 'Gómez',
      edad: '25',
      genero: 'Masculino',
      region: 'Antioquia',
      municipio: 'Medellín',
      telefono: '3001234567',
      direccion: 'Calle 123 #45-67'
    };

    this.form.patchValue({
      tipoDocumentoParticipanteInfo: mockData.tipoDocumento,
      primerNombreParticipante: mockData.primerNombre,
      segundoNombreParticipante: mockData.segundoNombre,
      primerApellidoParticipante: mockData.primerApellido,
      segundoApellidoParticipante: mockData.segundoApellido,
      edadParticipante: mockData.edad,
      generoParticipante: mockData.genero,
      regionParticipante: mockData.region,
      municipioParticipante: mockData.municipio,
      telefonoContactoBeneficiario: mockData.telefono,
      direccionUbicacion: mockData.direccion
    });

    // Check if beneficiary already received complement
    this.mostrarAlertaBeneficiarioYaRecibio = Math.random() > 0.5; // Random for demo
  }

  cargarDatosCuidador(quienRecibe: string) {
    // Simulate loading caregiver data based on recipient
    const mockData = {
      tipoDocumento: 'CC',
      numeroDocumento: '123456789',
      primerNombre: 'María',
      segundoNombre: 'Elena',
      primerApellido: 'Rodríguez',
      segundoApellido: 'López',
      telefono1: '3012345678',
      telefono2: '3023456789',
      tipoParticipante: 'Cuidador'
    };

    this.form.patchValue({
      tipoDocumentoCuidador: mockData.tipoDocumento,
      numeroDocumentoCuidador: mockData.numeroDocumento,
      primerNombreCuidador: mockData.primerNombre,
      segundoNombreCuidador: mockData.segundoNombre,
      primerApellidoCuidador: mockData.primerApellido,
      segundoApellidoCuidador: mockData.segundoApellido,
      numeroTelefonicoContacto1: mockData.telefono1,
      numeroTelefonicoContacto2: mockData.telefono2,
      tipoParticipante: mockData.tipoParticipante
    });

    // Pre-load authorization file (mock)
    this.selectedFiles['adjuntarAutorizacion'] = 'autorizacion.pdf';
    this.form.get('adjuntarAutorizacion')?.setValue('autorizacion.pdf');
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
      this.router.navigate(['/complements']);
    }
  }

  onCancel() {
    this.router.navigate(['/complements']);
  }
}
