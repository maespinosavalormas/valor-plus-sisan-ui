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
  selector: 'app-nutritional-follow-up-form-page',
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
  templateUrl: './nutritional-follow-up-form-page.component.html',
  styleUrl: './nutritional-follow-up-form-page.component.scss'
})
export class NutritionalFollowUpFormPageComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  form!: FormGroup;
  isEditMode = false;
  title: string = 'Crear Seguimiento Nutricional';

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
  tiposDocumento = ['CC', 'CE', 'TI', 'RC', 'PAS'];
  sexos = ['Masculino', 'Femenino'];
  tiposSeguimiento = ['Inicial', 'Seguimiento', 'Final'];

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
      // SECCION 1: Inicio
      registroSivigila: ['', Validators.required],
      fechaValoracionNutricional: ['', Validators.required],

      // SECCION 2: Datos Personales
      numeroDocumento: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      tipoParticipante: ['', Validators.required],
      tipoDocumento: ['', Validators.required],

      // SECCION 3: Datos Personales de Sivigila
      numeroSemana: [{ value: '', disabled: true }],
      nombresApellidosCompletos: [{ value: '', disabled: true }],
      fechaNacimiento: [{ value: '', disabled: true }],
      edad: [{ value: '', disabled: true }],
      genero: [{ value: '', disabled: true }],
      sexo: [{ value: '', disabled: true }],
      municipio: [{ value: '', disabled: true }],
      subregion: [{ value: '', disabled: true }],
      telefono: [{ value: '', disabled: true }],
      telefonoSivigila1: [{ value: '', disabled: true }],
      telefonoSivigila2: [{ value: '', disabled: true }],
      pesoAlNacer: [{ value: '', disabled: true }],
      tipoSeguridadSocial: [{ value: '', disabled: true }],
      nombreEAPB: [{ value: '', disabled: true }],

      // SECCION 4: Datos Personales Nuevos
      primerNombreNuevo: ['', Validators.required],
      segundoNombreNuevo: [''],
      primerApellidoNuevo: ['', Validators.required],
      segundoApellidoNuevo: [''],
      fechaNac2: ['', Validators.required],
      edad2: [{ value: '', disabled: true }],
      generoNuevo: ['', Validators.required],
      sexo2: [''],
      municipioNuevo: ['', Validators.required],
      subregionCalc: ['', Validators.required],
      direccionNuevos: ['', Validators.required],
      telefonoNuevos: ['', Validators.required],
      telefonoNuevosValidacion: ['', Validators.required],
      tipoSgss2: ['', Validators.required],
      nombreEps2: ['', Validators.required],

      // SECCION 5: Datos Personales (Edades y otros)
      anios: [{ value: '', disabled: true }],
      meses: [{ value: '', disabled: true }],
      edadCompleta: [{ value: '', disabled: true }],
      prematuro: ['', Validators.required],
      semanasPrematuro: [''],
      edadSinCorregir: [{ value: '', disabled: true }],
      edadCorregida: [{ value: '', disabled: true }],
      edad3: [{ value: '', disabled: true }],
      edadMeses: [{ value: '', disabled: true }],
      categoriaEdad: [{ value: '', disabled: true }],
      grupoEtnia: ['', Validators.required],
      discapacidad: ['', Validators.required],
      patologiaBase: ['', Validators.required],
      edemaBilateral: ['', Validators.required],
      esquemaVacunacionCPN: ['', Validators.required],
      asisteCPN: ['', Validators.required],
      fechaUltimoCPN: [''],
      esquemaVacunacionCYD: ['', Validators.required],
      asisteCYD: ['', Validators.required],
      fechaUltimoCYD: [''],

      // SECCION 6: Tamizaje anterior
      fechaToma1: ['', Validators.required],
      edadToma1: [{ value: '', disabled: true }],
      peso1: [{ value: '', disabled: true }],
      estatura1: [{ value: '', disabled: true }],
      puntajezPt1: [{ value: '', disabled: true }],
      clasificacionPesoTalla1: [{ value: '', disabled: true }],
      puntajezTe1: [{ value: '', disabled: true }],
      clasificacionTallaEdad1: [{ value: '', disabled: true }],
      puntajezPe1: [{ value: '', disabled: true }],
      clasificacionPesoEdad1: [{ value: '', disabled: true }],

      // SECCION 7: Medidas antropometricas actuales
      peso: ['', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]],
      estatura: ['', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]],
      semanasGestacion: ['', Validators.pattern(/^[0-9]+$/)],
      perimetroBraquial: ['', Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)],
      perimetroCefalico: ['', Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)],

      // SECCION 8: Clasificacion nutricional
      puntajezPt: [{ value: '', disabled: true }],
      clasificacionPesoTalla: [{ value: '', disabled: true }],
      puntajezTe: [{ value: '', disabled: true }],
      clasificacionTallaEdad: [{ value: '', disabled: true }],
      puntajezPe: [{ value: '', disabled: true }],
      clasificacionPesoEdad: [{ value: '', disabled: true }],
      puntajezTeImc: [{ value: '', disabled: true }],
      clasificacionTallaEdadImc: [{ value: '', disabled: true }],
      puntajezImc: [{ value: '', disabled: true }],
      clasificacionImc: [{ value: '', disabled: true }],

      // SECCION 9: Clasificacion nutricional gestional
      clasificacionGestante: ['', Validators.required],
      imcGestante: [{ value: '', disabled: true }],
      clasificacionImcEdadGestacional: [{ value: '', disabled: true }],

      // SECCION 10: Clasificacion paralisis cerebral
      gradoGMFCS: ['', Validators.required],
      percentilPesoEdadPC: [{ value: '', disabled: true }],
      clasificacionPesoEdadPC: [{ value: '', disabled: true }],
      percentilTallaEdadPC: [{ value: '', disabled: true }],
      clasificacionTallaEdadPC: [{ value: '', disabled: true }],
      percentilImcEdadPC: [{ value: '', disabled: true }],
      clasificacionImcEdadPC: [{ value: '', disabled: true }],

      // SECCION 11: Clasificacion Sindrome Down
      percentilPesoEdadSD: [{ value: '', disabled: true }],
      clasificacionPesoEdadSD: [{ value: '', disabled: true }],
      percentilTallaEdadSD: [{ value: '', disabled: true }],
      clasificacionTallaEdadSD: [{ value: '', disabled: true }],

      // SECCION 12: Clasificacion Prematuro
      percentilPesoEdadGest: [{ value: '', disabled: true }],
      clasificacionPesoEdadGest: [{ value: '', disabled: true }],
      percentilLongitudEdadGest: [{ value: '', disabled: true }],
      clasificacionLongEdadGest: [{ value: '', disabled: true }],

      // SECCION 13: Clasificacion Acondroplasia
      percentilPesoEdadAC: [{ value: '', disabled: true }],
      clasificacionPesoEdadAC: [{ value: '', disabled: true }],
      percentilTallaEdadAC: [{ value: '', disabled: true }],
      clasificacionTallaEdadAC: [{ value: '', disabled: true }],
      percentilImcEdadAC: [{ value: '', disabled: true }],
      clasificacionImcEdadAC: [{ value: '', disabled: true }],

      // SECCION 14: Preguntas malnutricion
      recibenAtencion: [{ value: '', disabled: true }],
      recibeFormula: ['', Validators.required],
      motivoNoRecibeFTLC: ['', Validators.required],
      adherente: ['', Validators.required],
      motivoNoAdherente: ['', Validators.required],
      esquemaConsumo: ['', Validators.required],
      consumoOtroSupl: ['', Validators.required],
      suplCompl: ['', Validators.required],
      lecheMaterna: ['', Validators.required],
      condicionNutricional: ['', Validators.required],
      hospitalizacion: ['', Validators.required],
      motivoConsulta: ['', Validators.required],
      seguimientoPeriodico: ['', Validators.required],
      condicionesDnt: ['', Validators.required],
      activacionRuta: ['', Validators.required],
      tipoRutaActivacion: ['', Validators.required],
      tipoNoRecAtencion: ['', Validators.required],
      consumeLeche: ['', Validators.required],
      consumeLecheFrecuencia: ['', Validators.required],
      consumeCarnes: ['', Validators.required],
      consumeCarnesFrecuencia: ['', Validators.required],
      consumeCereales: ['', Validators.required],
      consumeCerealesFrecuencia: ['', Validators.required],
      consumeGrasas: ['', Validators.required],
      consumeGrasasFrecuencia: ['', Validators.required],
      consumeAzucares: ['', Validators.required],
      consumeAzucaresFrecuencia: ['', Validators.required],
      consumeFrutasVerduras: ['', Validators.required],
      consumeFrutasVerdurasFrecuencia: ['', Validators.required],

      // SECCION 15: Observaciones
      observaciones: [''],

      // SECCION 16: Datos del funcionario
      numeroDocumentoFuncionario: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      nombreCompletoFuncionario: [{ value: '', disabled: true }],
      nombresApellidosFuncionario: [{ value: '', disabled: true }],
      perfilFuncionario: [{ value: '', disabled: true }],

      // SECCION 17: Consentimiento informado
      consentimientoDatosPersonales: ['', Validators.required],
      consentimientoImagenesAudios: ['', Validators.required],
      firmaResponsable: [''],
    });

    // Watch for changes
    this.form.get('fechaNacimiento')?.valueChanges.subscribe(value => {
      if (value) {
        const age = this.calculateAge(value);
        this.form.get('edad')?.setValue(age);
      }
    });

    this.form.get('peso')?.valueChanges.subscribe(() => this.calculateIMC());
    this.form.get('talla')?.valueChanges.subscribe(() => this.calculateIMC());
  }

  calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  calculateIMC() {
    const peso = this.form.get('peso')?.value;
    const talla = this.form.get('talla')?.value;
    if (peso && talla) {
      const tallaM = talla / 100;
      const imc = peso / (tallaM * tallaM);
      this.form.get('imc')?.setValue(imc.toFixed(2));
      // Determine estado nutricional
      let estado = '';
      if (imc < 18.5) estado = 'Bajo peso';
      else if (imc < 25) estado = 'Normal';
      else if (imc < 30) estado = 'Sobrepeso';
      else estado = 'Obesidad';
      this.form.get('estadoNutricional')?.setValue(estado);
    }
  }

  async initializeMap() {
    if (typeof window !== 'undefined') {
      // Dynamic import for Leaflet
      const L = await import('leaflet');
      this.L = L.default;

      // Map options
      this.options = {
        layers: [
          this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          })
        ],
        zoom: 13,
        center: this.L.latLng(6.2442, -75.5812) // Medellín coordinates
      };

      // Initialize map after view init
      setTimeout(() => {
        const mapContainer = document.getElementById('map-container');
        if (mapContainer && !this.map) {
          this.map = this.L.map('map-container', this.options);
          this.marker = this.L.marker([6.2442, -75.5812], { draggable: true }).addTo(this.map);

          this.marker.on('dragend', (event: any) => {
            this.updateCoordinates(event.target.getLatLng());
          });

          this.map.on('click', (event: any) => {
            this.marker.setLatLng(event.latlng);
            this.updateCoordinates(event.latlng);
          });
        }
      }, 500);
    }
  }

  updateCoordinates(latlng: any) {
    const { lat, lng } = latlng;
    const latStr = lat.toFixed(6);
    const lngStr = lng.toFixed(6);
    this.displayedLatitud = latStr;
    this.displayedLongitud = lngStr;
    this.form.get('latitud')?.setValue(latStr);
    this.form.get('longitud')?.setValue(lngStr);
    this.cdr.detectChanges();
  }

  checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.title = 'Editar Seguimiento Nutricional';
      this.loadFormData(id);
    }
  }

  loadFormData(id: string) {
    // Mock data loading
    console.log('Loading data for ID:', id);
  }

  onFileSelected(event: any, fieldName: string) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFiles[fieldName] = file.name;
      this.form.get(fieldName)?.setValue(file.name);
    }
  }

  onSave() {
    if (this.form.valid) {
      console.log('Form data:', this.form.value);
      // Save logic here
      this.router.navigate(['/nutritional-follow-up']);
    } else {
      console.log('Form invalid');
    }
  }

  onCancel() {
    this.router.navigate(['/nutritional-follow-up']);
  }
}
