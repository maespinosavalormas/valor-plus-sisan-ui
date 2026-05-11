import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-targeting-up-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  templateUrl: './targeting-up-form-page.html',
  styleUrl: './targeting-up-form-page.scss'
})
export class TargetingUpFormPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  isEditMode = false;
  title: string = 'Crear Focalización UP';

  // Data arrays for dropdowns
  regions = ['Antioquia', 'Cundinamarca', 'Valle del Cauca', 'Santander'];
  municipios = ['Medellín', 'Bogotá', 'Cali', 'Bucaramanga'];
  tiposDocumento = ['CC', 'CE', 'TI', 'RC', 'PAS'];
  tiposUnidadProductiva = ['Familiares', 'Escolares', 'Comunitarias', 'Indigenas Municipios', 'Indigenas Almendros'];
  pueblosIndigenas = ['Embera', 'Wounaan', 'Nasa', 'Wayuu', 'Arhuaco'];
  comunidades = ['Comunidad 1', 'Comunidad 2', 'Comunidad 3'];
  clasificacionesSisben = ['A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2', 'B3', 'B4', 'B5', 'C1', 'C2', 'C3', 'C4', 'C5', 'D1', 'D2', 'D3', 'D4', 'D5'];
  tiposBarrioVereda = ['Barrio', 'Vereda'];
  tiposConvenio = ['Convenio 1', 'Convenio 2', 'Convenio 3'];
  institucionesEducativas = ['IE Santa María', 'CER Los Andes', 'IE Nacional'];
  generos = ['Masculino', 'Femenino', 'Otro'];

  selectedFiles: { [key: string]: string } = {};

  ngOnInit() {
    this.initializeForm();
    this.checkEditMode();
  }

  initializeForm() {
    this.form = this.fb.group({
      // SECCION 1: InformacionTecnico
      regionTecnico: ['', Validators.required],
      municipioTecnico: ['', Validators.required],
      nombreTecnicoMunicipio: [{ value: '', disabled: true }],
      tipoDocumentoTecnicoMunicipio: [{ value: '', disabled: true }],
      numeroDocumentoTecnicoMunicipio: [{ value: '', disabled: true }],
      tipoUnidadProductiva: ['', Validators.required],
      puebloIndigena: [''],
      otroPueblo: [''],
      comunidad: [''],
      otraComunidad: [''],

      // SECCION 2: UnidadesproductivasFamiliares
      tipoDocumentoRepresentanteFamiliar: ['', Validators.required],
      numeroDocumentoRepresentanteFamiliar: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      primerNombreRepresentanteFamiliar: ['', Validators.required],
      segundoNombreRepresentanteFamiliar: [''],
      primerApellidoRepresentanteFamiliar: ['', Validators.required],
      segundoApellidoRepresentanteFamiliar: [''],
      telefonoContactoFamiliar: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      clasificacionSisben: ['', Validators.required],
      menores18Familiar: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      mayores18Familiar: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      areaDisponibleFamiliar: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      tipoDocumentoPosesionFamiliar: ['', Validators.required],
      documentoPosesionFamiliar: [''],
      tipoBarrioVeredaFamiliar: ['', Validators.required],
      nombreBarrioFamiliar: [''],
      veredaFamiliar: [''],
      otraVeredaFamiliar: [''],
      tipoConvenioFamiliar: ['', Validators.required],
      numeroConvenioFamiliar: [{ value: '', disabled: true }],

      // SECCION 3: UnidadesproductivasEscolares
      nombreInstitucionEducativa: ['', Validators.required],
      codigoDaneInstitucion: [{ value: '', disabled: true }],
      tipoDocumentoDocenteEscolar: ['', Validators.required],
      numeroDocumentoDocenteEscolar: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      primerNombreDocenteEscolar: ['', Validators.required],
      segundoNombreDocenteEscolar: [''],
      primerApellidoDocenteEscolar: ['', Validators.required],
      segundoApellidoDocenteEscolar: [''],
      telefonoContactoEscolar: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      tipoDocumentoPosesionEscolar: ['', Validators.required],
      documentoPosesionEscolar: [''],
      anexoListadoEstudiantes: [''],
      tipoBarrioVeredaEscolar: ['', Validators.required],
      nombreBarrioEscolar: [''],
      veredaEscolar: [''],
      otraVeredaEscolar: [''],
      tipoConvenioEscolar: ['', Validators.required],
      numeroConvenioEscolar: [{ value: '', disabled: true }],

      // SECCION 4: UnidadesproductivasComunitarias
      nombreAsociacion: ['', Validators.required],
      codigoNitAsociacion: ['', Validators.required],
      tipoDocumentoRepresentanteComunitaria: ['', Validators.required],
      numeroDocumentoRepresentanteComunitaria: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      primerNombreRepresentanteComunitaria: ['', Validators.required],
      segundoNombreRepresentanteComunitaria: [''],
      primerApellidoRepresentanteComunitaria: ['', Validators.required],
      segundoApellidoRepresentanteComunitaria: [''],
      telefonoContactoComunitaria: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      tipoDocumentoPosesionComunitaria: ['', Validators.required],
      documentoPosesionComunitaria: [''],
      certificadoRepresentacionComunitaria: [''],
      tipoBarrioVeredaComunitaria: ['', Validators.required],
      nombreBarrioComunitaria: [''],
      veredaComunitaria: [''],
      otraVeredaComunitaria: [''],
      tipoConvenioComunitaria: ['', Validators.required],
      numeroConvenioComunitaria: [{ value: '', disabled: true }],

      // SECCION 5: UnidadesproductivasFamiliaresind
      tipoDocumentoRepresentanteIndigena: ['', Validators.required],
      numeroDocumentoRepresentanteIndigena: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      primerNombreRepresentanteIndigena: ['', Validators.required],
      segundoNombreRepresentanteIndigena: [''],
      primerApellidoRepresentanteIndigena: ['', Validators.required],
      segundoApellidoRepresentanteIndigena: [''],
      fechaNacimientoIndigena: ['', Validators.required],
      edadIndigena: [{ value: '', disabled: true }],
      generoIndigena: ['', Validators.required],
      telefonoContactoIndigena: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      menores18Indigena: ['', Validators.required],
      menores5Indigena: ['', Validators.required],
      programaPrimeraInfancia: [''],
      cualPrograma: [''],
      entre6y17Indigena: ['', Validators.required],
      mayores18Indigena: ['', Validators.required],
      areaDisponibleIndigena: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      tipoBarrioVeredaIndigena: ['', Validators.required],
      nombreBarrioIndigena: [''],
      veredaIndigena: [''],
      otraVeredaIndigena: [''],
      tipoConvenioIndigena: ['', Validators.required],
      numeroConvenioIndigena: [{ value: '', disabled: true }],
    });
  }

  checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.title = 'Editar Focalización UP';
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
      // Here you would typically save to a service
      this.router.navigate(['/targeting-up']);
    }
  }

  onCancel() {
    this.router.navigate(['/targeting-up']);
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

  onBirthDateChange() {
    const birthDate = this.form.get('fechaNacimientoIndigena')?.value;
    if (birthDate) {
      const age = this.calculateAge(birthDate);
      this.form.get('edadIndigena')?.setValue(age);
    }
  }
}
