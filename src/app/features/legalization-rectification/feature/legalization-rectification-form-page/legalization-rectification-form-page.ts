import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Router, ActivatedRoute } from '@angular/router';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import * as L from 'leaflet';

@Component({
  selector: 'app-legalization-rectification-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, LeafletModule],
  templateUrl: './legalization-rectification-form-page.html',
  styleUrl: './legalization-rectification-form-page.scss'
})
export class LegalizationRectificationFormPageComponent implements OnInit {
  form!: FormGroup;
  isEditMode: boolean = false;
  title: string = 'Nueva Subsanación de Legalización';

  regions = ['Región 1', 'Región 2', 'Región 3']; // Sample data
  municipios = ['Municipio 1', 'Municipio 2', 'Municipio 3']; // Sample data
  tiposDocumento = ['Cedula Ciudadania', 'Cedula De Extranjeria', 'Permiso Especial De Permanencia', 'Tarjeta De Identidad', 'Registro Civil', 'Partida O Acta De Nacimiento', 'Menor Sin Identificar', 'Certificado Nacido Vivo', 'Pasaporte', 'Adulto Sin Identificar', 'Documentos Extranjero'];
  tiposPoblacion = ['Personas con discapacidad', 'Población en emergencia social con precargue', 'Población en emergencia social sin precargue', 'Menor participante de ICBF'];
  generos = ['Masculino', 'Femenino', 'Otro'];
  criteriosIngreso = ['Discapacidad y pobreza extrema', 'Desnutrición o riesgo de Desnutrición', 'Pobreza extrema o pobreza moderada', 'Circunstancias imprevista y/o grave y/o urgente', 'INSAN', 'ICBF'];
  siNo = ['Si', 'No'];
  periodosEntrega = ['AGOSTO - SEPTIEMBRE', 'OCTUBRE - NOVIEMBRE', 'ENTREGA PAQUETES EMERGENCIA', 'DICIEMBRE - ENERO', 'FEBRERO - MARZO', 'EMERGENCIA - PCD1'];
  quienRecibe = ['El participante', 'El cuidador o cuidadora', 'Otro autorizado'];
  lugaresEntrega = ['Entrega en el lugar de residencia permanente', 'Cabecera Municipal', 'Centro poblado'];
  tiposRegistro = ['Firma la persona que recibe el paquete', 'Se carga foto de planilla con firma de la persona que recibio el paquete'];

  // Map properties
  options!: L.MapOptions;
  layers: L.Layer[] = [];
  marker!: L.Marker;

  // File selection tracking
  selectedFiles: { [key: string]: string } = {};

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.initializeMap();
    this.checkEditMode();
  }

  initializeForm() {
    this.form = this.fb.group({
      // Sección 1: Tipo de población
      numeroDocumentoParticipante: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      tipoPoblacionParticipante: ['', Validators.required],
      tipoDocumentoParticipante: ['', Validators.required],
      primerNombreParticipante: ['', Validators.required],
      segundoNombreParticipante: [''],
      primerApellidoParticipante: ['', Validators.required],
      segundoApellidoParticipante: [''],
      generoParticipante: ['', Validators.required],
      regionParticipante: ['', Validators.required],
      municipioParticipante: ['', Validators.required],
      telefonoContactoBeneficiario: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      telefonoActualBeneficiario: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      direccionUbicacionBeneficiario: ['', Validators.required],

      // Sección 2: Responsable de la entrega
      regionResponsable: ['', Validators.required],
      municipioResponsable: ['', Validators.required],
      nombresApellidosEntrega: ['', Validators.required],
      tipoDocumentoEntrega: ['', Validators.required],
      numeroDocumentoEntrega: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],

      // Sección 3: Entrega del complemento
      fechaEntrega: ['', Validators.required],
      periodoEntrega: ['', Validators.required],
      quienRecibeComplemento: ['', Validators.required],
      tipoDocumentoCuidador: [''],
      numeroDocumentoCuidador: ['', Validators.pattern(/^[0-9]+$/)],
      primerNombreCuidador: [''],
      segundoNombreCuidador: [''],
      primerApellidoCuidador: [''],
      segundoApellidoCuidador: [''],
      telefonoContacto1Cuidador: ['', Validators.pattern(/^[0-9]+$/)],
      telefonoContacto2Cuidador: ['', Validators.pattern(/^[0-9]+$/)],
      lugarEntregaPaquete: ['', Validators.required],
      ubicacionLatitud: ['', Validators.required],
      ubicacionLongitud: ['', Validators.required],
      consentimientoInformado1: ['', Validators.required],
      consentimientoInformado2: ['', Validators.required],

      // Sección 4: Datos de subsanación
      subsanarDatosCuidador: [''],
      quienRecibeComplementoSubsanacion: [''],
      tipoDocumentoCuidadorSubsanacion: [''],
      numeroDocumentoCuidadorSubsanacion: ['', Validators.pattern(/^[0-9]+$/)],
      primerNombreCuidadorSubsanacion: [''],
      segundoNombreCuidadorSubsanacion: [''],
      primerApellidoCuidadorSubsanacion: [''],
      segundoApellidoCuidadorSubsanacion: [''],
      telefonoContacto1CuidadorSubsanacion: ['', Validators.pattern(/^[0-9]+$/)],
      telefonoContacto2CuidadorSubsanacion: ['', Validators.pattern(/^[0-9]+$/)],
      observacionesSubsanaciones: [''],
      autorizacionEscritaSubsanacion: [''], // File
      subsanarFotoDocumentoIdentidad: [''],
      fotoDocumentoIdentidadParticipante: [''], // File
      fotoDocumentoIdentidadCuidador: [''], // File
      subsanarFotoPersonaPaquete: [''],
      fotografiaPersonaPaquete: [''], // File
      subsanarFirmaPersonaRecibe: [''],
      firmaPersonaRecibe: [''], // File
      tipoSubsanacion1: [''],
      tipoSubsanacion2: [''],
      tipoDocumentoSubsanacion: [''],
      numeroDocumentoSubsanacion: ['', Validators.pattern(/^[0-9]+$/)],
      nombresApellidosSubsanacion: [''],
      observacionesProcesoSubsanacion: [''],
      fechaHoraFinalizacionSubsanacion: [''],
    });
  }

  initializeMap() {
    // Configure marker icons to use unpkg CDN for better reliability
    L.Icon.Default.prototype.options.iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
    // Simplified configuration for better loading

    const initialCoords = L.latLng(6.25184, -75.56359); // Medellín coordinates

    this.options = {
      layers: [
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        })
      ],
      zoom: 13,
      center: initialCoords
    };

    this.layers = [];
  }

  onMapReady(map: L.Map) {
    setTimeout(() => map.invalidateSize(), 0);
  }

  onMapClick(event: L.LeafletMouseEvent) {
    const { lat, lng } = event.latlng;

    const markerIcon = L.icon({
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
      this.marker = L.marker([lat, lng], { draggable: true, icon: markerIcon });
      this.marker.on('dragend', () => {
        const position = this.marker.getLatLng();
        this.updateCoordinates(position.lat, position.lng);
      });
      this.layers.push(this.marker);
    }

    this.updateCoordinates(lat, lng);
  }

  updateCoordinates(lat: number, lng: number) {
    this.form.patchValue({
      ubicacionLatitud: lat.toFixed(6),
      ubicacionLongitud: lng.toFixed(6)
    });
  }

  onCoordinatesInput() {
    const lat = parseFloat(this.form.get('ubicacionLatitud')?.value);
    const lng = parseFloat(this.form.get('ubicacionLongitud')?.value);

    if (!isNaN(lat) && !isNaN(lng)) {
      this.updateMarker(lat, lng);
    }
  }

  updateMarker(lat: number, lng: number) {
    const markerIcon = L.icon({
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
      this.marker = L.marker([lat, lng], { draggable: true, icon: markerIcon });
      this.marker.on('dragend', () => {
        const position = this.marker.getLatLng();
        this.updateCoordinates(position.lat, position.lng);
      });
      this.layers.push(this.marker);
    }
  }

  onFileSelected(event: Event, field: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFiles[field] = input.files[0].name;
    }
  }

  checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.title = 'Editar Subsanación de Legalización';
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
        // Add pre-fill logic as needed
      });
    }
  }

  onSave() {
    if (this.form.valid) {
      console.log('Form data:', this.form.value);
      // Here you would save the data
      this.router.navigate(['/legalization-rectification']);
    }
  }

  onCancel() {
    this.router.navigate(['/legalization-rectification']);
  }
}
