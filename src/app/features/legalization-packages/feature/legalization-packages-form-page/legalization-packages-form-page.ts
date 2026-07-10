import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Router, ActivatedRoute } from '@angular/router';
import { LeafletModule } from '@bluehalo/ngx-leaflet';

@Component({
  selector: 'app-legalization-packages-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    LeafletModule,
  ],
  templateUrl: './legalization-packages-form-page.html',
  styleUrl: './legalization-packages-form-page.scss'
})
export class LegalizationPackagesFormPageComponent implements OnInit {
  form!: FormGroup;
  isEditMode: boolean = false;
  title: string = 'Nueva Legalización de Paquete';
  isBrowser: boolean;
  private L: any;
  mapReady: boolean = false;

  regions = ['Región 1', 'Región 2', 'Región 3'];
  municipios = ['Municipio 1', 'Municipio 2', 'Municipio 3'];
  tiposDocumento = ['Cedula Ciudadania', 'Cedula De Extranjeria', 'Permiso Especial De Permanencia', 'Tarjeta De Identidad', 'Registro Civil', 'Partida O Acta De Nacimiento', 'Menor Sin Identificar', 'Certificado Nacido Vivo', 'Pasaporte', 'Adulto Sin Identificar', 'Documentos Extranjero'];
  tiposPoblacion = ['Personas con discapacidad', 'Población en emergencia social con precargue', 'Población en emergencia social sin precargue', 'Menor participante de ICBF'];
  generos = ['Masculino', 'Femenino', 'Otro'];
  criteriosIngreso = ['Discapacidad y pobreza extrema', 'Desnutrición o riesgo de Desnutrición', 'Pobreza extrema o pobreza moderada', 'Circunstancias imprevista y/o grave y/o urgente', 'INSAN', 'ICBF'];
  siNo = ['Si', 'No'];
  periodosEntrega = ['AGOSTO - SEPTIEMBRE', 'OCTUBRE - NOVIEMBRE', 'ENTREGA PAQUETES EMERGENCIA', 'DICIEMBRE - ENERO', 'FEBRERO - MARZO', 'EMERGENCIA - PCD1'];
  quienRecibe = ['El participante', 'El cuidador o cuidadora', 'Otro autorizado'];
  lugaresEntrega = ['Entrega en el lugar de residencia permanente', 'Cabecera Municipal', 'Centro poblado'];
  tiposRegistro = ['Firma la persona que recibe el paquete', 'Se carga foto de planilla con firma de la persona que recibio el paquete'];

  options: any;
  layers: any[] = [];
  marker: any;
  selectedFiles: { [key: string]: string } = {};

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit() {
    this.initializeForm();

    if (this.isBrowser) {
      this.L = (await import('leaflet')).default ?? await import('leaflet');
      this.initializeMap();
      this.mapReady = true;
    }

    this.checkEditMode();
  }

  initializeForm() {
    this.form = this.fb.group({
      // Sección 1: Responsable de la entrega
      regionResponsable: ['', Validators.required],
      municipioResponsable: ['', Validators.required],
      nombresApellidosEntrega: ['', Validators.required],
      tipoDocumentoEntrega: ['', Validators.required],
      numeroDocumentoEntrega: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],

      // Sección 2: Tipo de población
      numeroDocumentoParticipante: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      participanteICBF: ['', Validators.required],
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
      tipoCriterioIngreso: ['', Validators.required],
      participanteRegistroICBF: ['', Validators.required],

      // Sección 3: Emergencia nuevo ingreso
      numeroDocumentoParticipanteA: ['', Validators.pattern(/^[0-9]+$/)],
      tipoDocumentoParticipanteA: [''],
      primerNombreParticipanteA: [''],
      segundoNombreParticipanteA: [''],
      primerApellidoParticipanteA: [''],
      segundoApellidoParticipanteA: [''],
      generoA: [''],
      regionA: [''],
      municipioA: [''],
      telefonoContactoBeneficiarioA: ['', Validators.pattern(/^[0-9]+$/)],
      telefonoActualA: ['', Validators.pattern(/^[0-9]+$/)],
      direccionUbicacionA: [''],

      // Sección 4: Entrega del complemento
      fechaEntrega: ['', Validators.required],
      periodoEntrega: ['', Validators.required],
      quienRecibeComplemento: ['', Validators.required],

      // Sección 5: Cuidador
      tipoDocumentoCuidador: [''],
      numeroDocumentoCuidador: ['', Validators.pattern(/^[0-9]+$/)],
      primerNombreCuidador: [''],
      segundoNombreCuidador: [''],
      primerApellidoCuidador: [''],
      segundoApellidoCuidador: [''],
      telefonoContacto1Cuidador: ['', Validators.pattern(/^[0-9]+$/)],
      telefonoContacto2Cuidador: ['', Validators.pattern(/^[0-9]+$/)],

      // Sección 6: Otro autorizado
      tipoDocumentoAutorizado: [''],
      numeroDocumentoAutorizado: ['', Validators.pattern(/^[0-9]+$/)],
      primerNombreAutorizado: [''],
      segundoNombreAutorizado: [''],
      primerApellidoAutorizado: [''],
      segundoApellidoAutorizado: [''],
      telefonoContacto1Autorizado: ['', Validators.pattern(/^[0-9]+$/)],
      telefonoContacto2Autorizado: ['', Validators.pattern(/^[0-9]+$/)],
      autorizacionEscrita: [''],

      // Sección 7: Lugar entrega
      lugarEntregaPaquete: ['', Validators.required],
      ubicacionLatitud: ['', Validators.required],
      ubicacionLongitud: ['', Validators.required],

      // Sección 8: Consentimiento
      consentimientoInformado: ['', Validators.required],

      // Sección 9: Archivos
      fotoDocumentoIdentidadParticipante: [''],
      fotoDocumentoIdentidadCuidador: [''],
      fotografiaPersonaPaquete: [''],
      tipoRegistroFirma: ['', Validators.required],
      firmaPersonaRecibe: [''],
      fotografiaPlanilla: [''],
    });
  }

  initializeMap() {
    if (!this.isBrowser || !this.L) return;
    const L = this.L;
    const initialCoords = L.latLng(6.25184, -75.56359);
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

  onMapReady(map: any) {
    if (!this.isBrowser) return;
    setTimeout(() => map.invalidateSize(), 0);
  }

  onMapClick(event: any) {
    if (!this.isBrowser || !this.L) return;
    const L = this.L;
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
      this.layers = [...this.layers, this.marker];
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
    if (!this.isBrowser || !this.L) return;
    const lat = parseFloat(this.form.get('ubicacionLatitud')?.value);
    const lng = parseFloat(this.form.get('ubicacionLongitud')?.value);
    if (!isNaN(lat) && !isNaN(lng)) this.updateMarker(lat, lng);
  }

  updateMarker(lat: number, lng: number) {
    if (!this.isBrowser || !this.L) return;
    const L = this.L;
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
      this.layers = [...this.layers, this.marker];
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
      this.title = 'Editar Legalización de Paquete';
      this.loadFormData(id);
    }
  }

  loadFormData(id: string) {
    const navigation = this.router.getCurrentNavigation();
    const item = navigation?.extras.state?.['item'];
    if (item) {
      this.form.patchValue({});
    }
  }

  onSave() {
    if (this.form.valid) {
      console.log('Form data:', this.form.value);
      this.router.navigate(['/legalization-packages']);
    }
  }

  onCancel() {
    this.router.navigate(['/legalization-packages']);
  }
}