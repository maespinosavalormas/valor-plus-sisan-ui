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
  selector: 'app-psychosocial-form-page',
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
  templateUrl: './psychosocial-form-page.component.html',
  styleUrl: './psychosocial-form-page.component.scss'
})
export class PsychosocialFormPageComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  form!: FormGroup;
  isEditMode = false;
  title: string = 'Crear Psicosocial';

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
  tiposIdentificacion = ['CC', 'TI', 'RC', 'PAS', 'CE'];
  semanas = ['Semana 1', 'Semana 2', 'Semana 3']; // Adjust as needed
  generos = ['Masculino', 'Femenino'];
  municipios = ['Medellín', 'Bogotá', 'Cali', 'Bucaramanga'];
  subregiones = ['Subregión 1', 'Subregión 2'];
  zonasResidencia = ['Zona 1', 'Zona 2', 'Zona 3'];
  barriosVeredas = ['Barrio 1', 'Vereda 1'];
  pueblosIndigenas = ['Pueblo 1', 'Pueblo 2', 'Otro'];
  comunidades = ['Comunidad 1', 'Comunidad 2', 'Otro'];
  etnias = ['Etnia 1', 'Etnia 2'];
  gruposPoblacionales = ['Grupo 1', 'Grupo 2', 'Otro'];
  tiposDiscapacidad = ['Tipo 1', 'Tipo 2'];
  programasNutricionales = ['Programa 1', 'Programa 2', 'Otro'];
  regimenesSalud = ['Régimen 1', 'Régimen 2'];
  sexosAcudiente = ['Masculino', 'Femenino'];
  parentescos = ['Padre', 'Madre', 'Abuelo', 'Otro'];
  gradosEscolaridad = ['Primaria', 'Secundaria', 'Universitario'];
  ocupaciones = ['Ocupación 1', 'Ocupación 2'];
  ingresosMensuales = ['Menos de 1 SMMLV', '1-2 SMMLV', 'Más de 2 SMMLV'];
  serviciosSanitarios = ['Servicio 1', 'Servicio 2'];
  eliminacionBasuras = ['Basurero', 'Quema', 'Otro'];
  combustiblesCocinar = ['Gas', 'Leña', 'Electricidad'];

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
      // SECCION 1: Datos Generales
      numeroIdentificacionNino: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      tipoIdentificacionNino: ['', Validators.required],
      semana: ['', Validators.required],
      fechaNacimientoNino: ['', Validators.required],
      nombresNino: ['', Validators.required],
      genero: ['', Validators.required],
      direccionResidencia: ['', Validators.required],
      telefono: ['', Validators.required],
      telefono2: [''],
      municipio: ['', Validators.required],
      subregion: ['', Validators.required],
      zonaResidencia: ['', Validators.required],
      barrioVereda: ['', Validators.required],
      pertenecePoblacionIndigena: ['', Validators.required],
      puebloIndigena: [''],
      otroPueblo: [''],
      comunidad: ['', Validators.required],
      otraComunidad: [''],
      latitud: ['', Validators.required],
      longitud: ['', Validators.required],
      coordenadaX: [{ value: '', disabled: true }],
      coordenadaY: [{ value: '', disabled: true }],

      // SECCION 2: Datos de Asistencia Social
      etnia: ['', Validators.required],
      grupoPoblacional: ['', Validators.required],
      cualOtroGrupoPoblacional: [''],
      tieneDiscapacidad: ['', Validators.required],
      discapacidadCertificada: [''],
      tipoDiscapacidad: [''],
      recibeAtencionNutricional: ['', Validators.required],
      cualPrograma: [''],
      cualOtroPrograma: [''],
      regimenSalud: ['', Validators.required],

      // SECCION 3: Datos del hogar y el acudiente
      tipoIdentificacionAcudiente: ['', Validators.required],
      numeroIdentificacionAcudiente: ['', Validators.required],
      primerNombreAcudiente: ['', Validators.required],
      segundoNombreAcudiente: [''],
      primerApellidoAcudiente: ['', Validators.required],
      segundoApellidoAcudiente: [''],
      sexoAcudiente: ['', Validators.required],
      parentesco: ['', Validators.required],
      gradoEscolaridad: ['', Validators.required],
      ocupacionPrincipal: ['', Validators.required],
      cuidadorTieneDiscapacidad: ['', Validators.required],
      tipoDiscapacidadCuidador: [''],
      numeroPersonasHogar: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      numeroNinosMenores5: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      ingresosMensuales: ['', Validators.required],
      hogarEnergiaElectrica: ['', Validators.required],
      hogarAguaPotable: ['', Validators.required],
      servicioSanitario: ['', Validators.required],
      eliminacionBasuras: ['', Validators.required],
      combustibleCocinar: ['', Validators.required],
      evolucionPsicosocial: ['', Validators.required],

      // SECCION 4: Compromisos familiares
      compromisosFamiliares: ['', Validators.required],
      consentimientoDatos: ['', Validators.required],
      consentimientoImagenes: ['', Validators.required],
      firmaCuidador: [''],
    });

    // Watch for changes
    this.form.get('pertenecePoblacionIndigena')?.valueChanges.subscribe(value => {
      const puebloControl = this.form.get('puebloIndigena');
      const otroControl = this.form.get('otroPueblo');
      if (value === 'si') {
        puebloControl?.setValidators([Validators.required]);
        otroControl?.clearValidators();
      } else {
        puebloControl?.clearValidators();
        otroControl?.clearValidators();
      }
      puebloControl?.updateValueAndValidity();
      otroControl?.updateValueAndValidity();
    });

    this.form.get('puebloIndigena')?.valueChanges.subscribe(value => {
      const otroControl = this.form.get('otroPueblo');
      if (value === 'Otro') {
        otroControl?.setValidators([Validators.required]);
      } else {
        otroControl?.clearValidators();
      }
      otroControl?.updateValueAndValidity();
    });

    this.form.get('comunidad')?.valueChanges.subscribe(value => {
      const otroControl = this.form.get('otraComunidad');
      if (value === 'Otro') {
        otroControl?.setValidators([Validators.required]);
      } else {
        otroControl?.clearValidators();
      }
      otroControl?.updateValueAndValidity();
    });

    this.form.get('grupoPoblacional')?.valueChanges.subscribe(value => {
      const otroControl = this.form.get('cualOtroGrupoPoblacional');
      if (value === 'Otro') {
        otroControl?.setValidators([Validators.required]);
      } else {
        otroControl?.clearValidators();
      }
      otroControl?.updateValueAndValidity();
    });

    this.form.get('tieneDiscapacidad')?.valueChanges.subscribe(value => {
      const certificadaControl = this.form.get('discapacidadCertificada');
      const tipoControl = this.form.get('tipoDiscapacidad');
      if (value === 'si') {
        certificadaControl?.setValidators([Validators.required]);
        tipoControl?.setValidators([Validators.required]);
      } else {
        certificadaControl?.clearValidators();
        tipoControl?.clearValidators();
      }
      certificadaControl?.updateValueAndValidity();
      tipoControl?.updateValueAndValidity();
    });

    this.form.get('recibeAtencionNutricional')?.valueChanges.subscribe(value => {
      const programaControl = this.form.get('cualPrograma');
      const otroControl = this.form.get('cualOtroPrograma');
      if (value === 'si') {
        programaControl?.setValidators([Validators.required]);
        otroControl?.clearValidators();
      } else {
        programaControl?.clearValidators();
        otroControl?.clearValidators();
      }
      programaControl?.updateValueAndValidity();
      otroControl?.updateValueAndValidity();
    });

    this.form.get('cualPrograma')?.valueChanges.subscribe(value => {
      const otroControl = this.form.get('cualOtroPrograma');
      if (value === 'Otro') {
        otroControl?.setValidators([Validators.required]);
      } else {
        otroControl?.clearValidators();
      }
      otroControl?.updateValueAndValidity();
    });

    this.form.get('cuidadorTieneDiscapacidad')?.valueChanges.subscribe(value => {
      const tipoControl = this.form.get('tipoDiscapacidadCuidador');
      if (value === 'si') {
        tipoControl?.setValidators([Validators.required]);
      } else {
        tipoControl?.clearValidators();
      }
      tipoControl?.updateValueAndValidity();
    });
  }

  checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.title = 'Editar Psicosocial';
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
    this.form.get('coordenadaX')?.setValue(latStr);
    this.form.get('coordenadaY')?.setValue(lngStr);
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
      this.router.navigate(['/psychosocial']);
    }
  }

  onCancel() {
    this.router.navigate(['/psychosocial']);
  }
}
