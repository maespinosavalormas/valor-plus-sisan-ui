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
  selector: 'app-characterization-up-form-page',
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
  templateUrl: './characterization-up-form-page.component.html',
  styleUrls: ['./characterization-up-form-page.component.scss']
})
export class CharacterizationUpFormPageComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  form!: FormGroup;
  isEditMode = false;
  title: string = 'Crear Caracterización UP';

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
  tiposEncuesta = ['Tipo 1', 'Tipo 2', 'Tipo 3'];
  tiposBarrioVereda = ['Barrio', 'Vereda'];
  sexos = ['Masculino', 'Femenino', 'Otro'];
  estadosCiviles = ['Soltero', 'Casado', 'Divorciado', 'Viudo'];
  gruposEtnicos = ['Mestizo', 'Afrocolombiano', 'Indigena', 'Otro'];
  gruposVulnerables = ['Víctimas del conflicto', 'Desplazados', 'Población LGTBIQ+', 'Personas con discapacidad'];
  ocupaciones = ['Agricultor', 'Docente', 'Comerciante', 'Otra'];
  actividadesLaborales = ['Producción agrícola', 'Docencia', 'Comercio', 'Otra'];
  parentescosFamiliares = ['Padre', 'Madre', 'Hijo', 'Hija', 'Hermano', 'Hermana', 'Abuelo', 'Abuela'];
  programasPrimeraInfancia = ['Programa 1', 'Programa 2', 'Otro'];
  lugaresComercializacion = ['Mercado local', 'Tienda propia', 'Venta directa', 'Otro'];
  estrategiasAprovechamiento = ['Reciclaje', 'Reutilización', 'Donación', 'Otro'];
  destinosProduccion = ['Consumo propio', 'Venta', 'Donación', 'Otro'];

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
      tipoUnidadProductiva: ['', Validators.required],
      nombreRepresentanteUnidad: [{ value: '', disabled: true }],
      convenio: [{ value: '', disabled: true }],
      funcionarioVisita: [{ value: '', disabled: true }],
      latitud: ['', Validators.required],
      longitud: ['', Validators.required],
      region: [{ value: '', disabled: true }],
      municipio: [{ value: '', disabled: true }],
      zona: [{ value: '', disabled: true }],
      tipoBarrioVereda: [{ value: '', disabled: true }],
      nombreBarrio: [{ value: '', disabled: true }],
      vereda: [{ value: '', disabled: true }],
      direccionUbicacion: ['', Validators.required],
      telefonoContacto: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      tipoEncuesta: ['', Validators.required],
      victimaConflicto: ['', Validators.required],
      numeroRUV: [''],

      // SECCION 2: Representante UP
      tipoDocumentoResponsable: [{ value: '', disabled: true }],
      numeroDocumentoResponsable: [{ value: '', disabled: true }],
      primerNombreResponsable: [{ value: '', disabled: true }],
      segundoNombreResponsable: [{ value: '', disabled: true }],
      primerApellidoResponsable: [{ value: '', disabled: true }],
      segundoApellidoResponsable: [{ value: '', disabled: true }],
      fechaNacimientoResponsable: ['', Validators.required],
      edadResponsable: [{ value: '', disabled: true }],
      sexoResponsable: ['', Validators.required],
      estadoCivilResponsable: ['', Validators.required],
      grupoEtnicoResponsable: ['', Validators.required],
      gruposVulnerablesResponsable: ['', Validators.required],
      ocupacionResponsable: ['', Validators.required],
      cualOcupacionResponsable: [''],
      actividadLaboralResponsable: ['', Validators.required],
      nombreIEResponsable: [{ value: '', disabled: true }],
      codigoDaneResponsable: [{ value: '', disabled: true }],
      areaDisponibleResponsable: [{ value: '', disabled: true }],
      numeroMiembrosAsociacion: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      numeroEstudiantesParticipantes: [{ value: '', disabled: true }],
      numeroEstudiantesPrimaria: [{ value: '', disabled: true }],
      numeroEstudiantesSecundaria: [{ value: '', disabled: true }],
      experienciaAlimentosFrescos: [{ value: '', disabled: true }],
      nombreAsociacion: ['', Validators.required],
      codigoNitAsociacion: ['', Validators.required],
      telefonoContactoRepresentante: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      correoContactoRepresentante: ['', [Validators.required, Validators.email]],
      areaDisponibleAsociacion: [{ value: '', disabled: true }],

      // SECCION 3: CARAC GRU FAM
      integrantesGrupoFamiliar: this.fb.array([]),

      // SECCION 4: CARAC GRUP UPC
      numeroMiembrosParticipantesAsociacion: ['', Validators.required],
      participantesUnidadProductiva: this.fb.array([]),

      // SECCION 5: Residuos
      experienciaProduccionAlimentos: ['', Validators.required],
      utilizaSemillasNativas: ['', Validators.required],
      otrosProcesosProduccionAgricola: ['', Validators.required],
      cualesOtrosProcesosProduccion: [''],
      realizaComercializacion: ['', Validators.required],
      dondeComercializacion: [''],
      registradaCompan: [''],
      participadoCompan: [''],
      separacionResiduosHogar: ['', Validators.required],
      separacionResiduosEducativo: ['', Validators.required],
      estrategiasAprovechamientoResiduos: ['', Validators.required],
      cuentaCompostera: [''],
      destinoProduccionInstitucion: ['', Validators.required],

      // SECCION 6: Consentimiento informado
      fechaHoraFinalizacion: [{ value: '', disabled: true }],
      consentimientoDatosPersonales: ['', Validators.required],
      consentimientoImagenesAudios: ['', Validators.required],
      firmaRepresentante: [''],
      anoRealizacionEncuesta: [{ value: '', disabled: true }],
    });

    // Set current year for survey year
    const currentYear = new Date().getFullYear();
    this.form.get('anoRealizacionEncuesta')?.setValue(currentYear);

    // Watch for changes
    this.form.get('victimaConflicto')?.valueChanges.subscribe(value => {
      const ruvControl = this.form.get('numeroRUV');
      if (value === 'si') {
        ruvControl?.setValidators([Validators.required]);
      } else {
        ruvControl?.clearValidators();
      }
      ruvControl?.updateValueAndValidity();
    });

    this.form.get('ocupacionResponsable')?.valueChanges.subscribe(value => {
      const cualControl = this.form.get('cualOcupacionResponsable');
      if (value === 'Otra') {
        cualControl?.setValidators([Validators.required]);
      } else {
        cualControl?.clearValidators();
      }
      cualControl?.updateValueAndValidity();
    });

    this.form.get('otrosProcesosProduccionAgricola')?.valueChanges.subscribe(value => {
      const cualesControl = this.form.get('cualesOtrosProcesosProduccion');
      if (value === 'si') {
        cualesControl?.setValidators([Validators.required]);
      } else {
        cualesControl?.clearValidators();
      }
      cualesControl?.updateValueAndValidity();
    });

    this.form.get('realizaComercializacion')?.valueChanges.subscribe(value => {
      const dondeControl = this.form.get('dondeComercializacion');
      if (value === 'si') {
        dondeControl?.setValidators([Validators.required]);
      } else {
        dondeControl?.clearValidators();
      }
      dondeControl?.updateValueAndValidity();
    });

    this.form.get('dondeComercializacion')?.valueChanges.subscribe(value => {
      const registradaControl = this.form.get('registradaCompan');
      if (value) {
        registradaControl?.setValidators([Validators.required]);
      } else {
        registradaControl?.clearValidators();
      }
      registradaControl?.updateValueAndValidity();
    });

    this.form.get('registradaCompan')?.valueChanges.subscribe(value => {
      const participadoControl = this.form.get('participadoCompan');
      if (value === 'si') {
        participadoControl?.setValidators([Validators.required]);
      } else {
        participadoControl?.clearValidators();
      }
      participadoControl?.updateValueAndValidity();
    });

    this.form.get('separacionResiduosHogar')?.valueChanges.subscribe(value => {
      const composteraControl = this.form.get('cuentaCompostera');
      if (value === 'si') {
        composteraControl?.setValidators([Validators.required]);
      } else {
        composteraControl?.clearValidators();
      }
      composteraControl?.updateValueAndValidity();
    });
  }

  checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.title = 'Editar Caracterización UP';
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
      this.router.navigate(['/characterization-up']);
    }
  }

  onCancel() {
    this.router.navigate(['/characterization-up']);
  }
}
