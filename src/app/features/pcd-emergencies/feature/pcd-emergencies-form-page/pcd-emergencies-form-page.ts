import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pcd-emergencies-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule],
  templateUrl: './pcd-emergencies-form-page.html',
  styleUrl: './pcd-emergencies-form-page.scss'
})
export class PcdEmergenciesFormPageComponent implements OnInit {
  form!: FormGroup;
  isEditMode: boolean = false;
  title: string = 'Nueva Emergencia PCD';

  regions = ['Región 1', 'Región 2', 'Región 3']; // Sample data
  municipios = ['Municipio 1', 'Municipio 2', 'Municipio 3']; // Sample data
  tiposDocumento = ['CC', 'TI', 'CE', 'PA']; // Sample data
  generos = ['Masculino', 'Femenino', 'Otro']; // Sample data
  subregiones = ['Subregión 1', 'Subregión 2', 'Subregión 3']; // Sample data
  distancias = ['30 minutos o menos', '30 minutos a 1 hora', 'de 1 a 2 horas', '2 a 4 horas', '4 a 6 horas', 'mas de 6 horas'];
  transportes = ['Automovil', 'Moto', 'Caminando', 'Panga', 'Bicicleta', 'Semovientes (caballo, Burro, mulos etc)'];
  siNo = ['Si', 'No'];
  razonesNoContacto = ['Razones 1', 'Razones 2', 'Razones 3']; // Sample data
  tiposBarrio = ['Barrio', 'Vereda'];
  veredas = ['Vereda 1', 'Vereda 2', 'Vereda 3']; // Sample data

  // Mock data for preloading
  funcionariosPorMunicipio: { [key: string]: any } = {
    'Municipio 1': {
      nombresApellidosFuncionario: 'Juan Carlos Pérez García',
      tipoDocumentoFuncionario: 'CC',
      numeroDocumentoFuncionario: '123456789'
    },
    'Municipio 2': {
      nombresApellidosFuncionario: 'María Elena López Martínez',
      tipoDocumentoFuncionario: 'CC',
      numeroDocumentoFuncionario: '987654321'
    },
    'Municipio 3': {
      nombresApellidosFuncionario: 'Carlos Andrés Rodríguez Torres',
      tipoDocumentoFuncionario: 'TI',
      numeroDocumentoFuncionario: '456789123'
    }
  };

  beneficiariosPorDocumento: { [key: string]: any } = {
    '12345678': {
      tipoDocumentoBeneficiario: 'CC',
      primerNombreBeneficiario: 'Ana María',
      segundoNombreBeneficiario: 'Patricia',
      primerApellidoBeneficiario: 'González',
      segundoApellidoBeneficiario: 'López',
      genero: 'Femenino',
      regionBeneficiario: 'Región 1',
      municipioBeneficiario: 'Municipio 1',
      telefonoContactoBeneficiario: '3001234567'
    },
    '87654321': {
      tipoDocumentoBeneficiario: 'TI',
      primerNombreBeneficiario: 'Luis Fernando',
      segundoNombreBeneficiario: 'Alberto',
      primerApellidoBeneficiario: 'Rodríguez',
      segundoApellidoBeneficiario: 'Martínez',
      genero: 'Masculino',
      regionBeneficiario: 'Región 2',
      municipioBeneficiario: 'Municipio 2',
      telefonoContactoBeneficiario: '3017654321'
    },
    '11223344': {
      tipoDocumentoBeneficiario: 'CC',
      primerNombreBeneficiario: 'Sofía',
      segundoNombreBeneficiario: 'Valentina',
      primerApellidoBeneficiario: 'Martínez',
      segundoApellidoBeneficiario: 'García',
      genero: 'Femenino',
      regionBeneficiario: 'Región 3',
      municipioBeneficiario: 'Municipio 3',
      telefonoContactoBeneficiario: '3029876543'
    }
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.checkEditMode();
  }

  initializeForm() {
    this.form = this.fb.group({
      // Sección 1: Información funcionario del municipio
      regionFuncionario: ['', Validators.required],
      municipioFuncionario: ['', Validators.required],
      nombresApellidosFuncionario: ['', Validators.required],
      tipoDocumentoFuncionario: ['', Validators.required],
      numeroDocumentoFuncionario: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],

      // Sección 2: Datos del Beneficiario
      tipoDocumentoBeneficiario: ['', Validators.required],
      numeroDocumentoBeneficiario: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      primerNombreBeneficiario: ['', Validators.required],
      segundoNombreBeneficiario: [''],
      primerApellidoBeneficiario: ['', Validators.required],
      segundoApellidoBeneficiario: [''],
      genero: ['', Validators.required],
      regionBeneficiario: ['', Validators.required],
      municipioBeneficiario: ['', Validators.required],
      telefonoContactoBeneficiario: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      telefonoActualBeneficiario: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      direccionUbicacion: ['', Validators.required],
      lograContactoTelefonico: ['', Validators.required],
      razonNoContacto: [''],
      viveAunMunicipio: ['', Validators.required],
      conoceMunicipioActual: ['', Validators.required],
      subregionActual: [''],
      municipioActual: [''],
      distanciaResidencia: ['', Validators.required],
      transporteVivienda: ['', Validators.required],
      cuidadorPermanente: ['', Validators.required],
      icbfPaqueteAlimentario: ['', Validators.required],

      // Sección 3: Datos del Cuidador
      tipoDocumentoCuidador: [''],
      numeroDocumentoCuidador: ['', Validators.pattern(/^[0-9]+$/)],
      primerNombreCuidador: [''],
      segundoNombreCuidador: [''],
      primerApellidoCuidador: [''],
      segundoApellidoCuidador: [''],
      telefonoContacto1Cuidador: ['', Validators.pattern(/^[0-9]+$/)],
      telefonoContacto2Cuidador: ['', Validators.pattern(/^[0-9]+$/)],
      tipoBarrioVereda: [''],
      nombreBarrio: [''],
      veredaSeleccionada: [''],
      otraVereda: [''],
      direccionResidenciaCuidador: [''],

      // Sección 4: Consentimiento informado
      autoriza: ['', Validators.required]
    });

    // Conditional validations and preloading
    this.form.get('lograContactoTelefonico')?.valueChanges.subscribe(value => {
      const razonControl = this.form.get('razonNoContacto');
      if (value === 'No') {
        razonControl?.setValidators([Validators.required]);
      } else {
        razonControl?.clearValidators();
      }
      razonControl?.updateValueAndValidity();
    });

    this.form.get('conoceMunicipioActual')?.valueChanges.subscribe(value => {
      const subregionControl = this.form.get('subregionActual');
      const municipioControl = this.form.get('municipioActual');
      if (value === 'Si') {
        subregionControl?.setValidators([Validators.required]);
        municipioControl?.setValidators([Validators.required]);
      } else {
        subregionControl?.clearValidators();
        municipioControl?.clearValidators();
      }
      subregionControl?.updateValueAndValidity();
      municipioControl?.updateValueAndValidity();
    });

    // Preload funcionario data when municipio is selected
    this.form.get('municipioFuncionario')?.valueChanges.subscribe(municipio => {
      if (municipio && this.funcionariosPorMunicipio[municipio]) {
        const funcionarioData = this.funcionariosPorMunicipio[municipio];
        this.form.patchValue({
          nombresApellidosFuncionario: funcionarioData.nombresApellidosFuncionario,
          tipoDocumentoFuncionario: funcionarioData.tipoDocumentoFuncionario,
          numeroDocumentoFuncionario: funcionarioData.numeroDocumentoFuncionario
        });
      } else {
        // Clear funcionario fields if no municipio selected
        this.form.patchValue({
          nombresApellidosFuncionario: '',
          tipoDocumentoFuncionario: '',
          numeroDocumentoFuncionario: ''
        });
      }
    });

    // Preload beneficiary data when document number is entered
    this.form.get('numeroDocumentoBeneficiario')?.valueChanges.subscribe(documento => {
      if (documento && documento.length >= 8 && this.beneficiariosPorDocumento[documento]) {
        const beneficiarioData = this.beneficiariosPorDocumento[documento];
        this.form.patchValue({
          tipoDocumentoBeneficiario: beneficiarioData.tipoDocumentoBeneficiario,
          primerNombreBeneficiario: beneficiarioData.primerNombreBeneficiario,
          segundoNombreBeneficiario: beneficiarioData.segundoNombreBeneficiario,
          primerApellidoBeneficiario: beneficiarioData.primerApellidoBeneficiario,
          segundoApellidoBeneficiario: beneficiarioData.segundoApellidoBeneficiario,
          genero: beneficiarioData.genero,
          regionBeneficiario: beneficiarioData.regionBeneficiario,
          municipioBeneficiario: beneficiarioData.municipioBeneficiario,
          telefonoContactoBeneficiario: beneficiarioData.telefonoContactoBeneficiario
        });
      } else {
        // Clear beneficiary fields if document is invalid or not found
        this.form.patchValue({
          tipoDocumentoBeneficiario: '',
          primerNombreBeneficiario: '',
          segundoNombreBeneficiario: '',
          primerApellidoBeneficiario: '',
          segundoApellidoBeneficiario: '',
          genero: '',
          regionBeneficiario: '',
          municipioBeneficiario: '',
          telefonoContactoBeneficiario: ''
        });
      }
    });
  }

  checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.title = 'Editar Emergencia PCD';
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
        regionFuncionario: item.regionFuncionario || '',
        municipioFuncionario: item.municipioFuncionario || '',
        nombresApellidosFuncionario: item.nombresApellidosFuncionario || '',
        tipoDocumentoFuncionario: item.tipoDocumentoFuncionario || '',
        numeroDocumentoFuncionario: item.numeroDocumentoFuncionario || '',
        tipoDocumentoBeneficiario: item.tipoDocumentoBeneficiario || '',
        numeroDocumentoBeneficiario: item.numeroDocumentoBeneficiario || '',
        primerNombreBeneficiario: item.primerNombreBeneficiario || '',
        segundoNombreBeneficiario: item.segundoNombreBeneficiario || '',
        primerApellidoBeneficiario: item.primerApellidoBeneficiario || '',
        segundoApellidoBeneficiario: item.segundoApellidoBeneficiario || '',
        genero: item.genero || '',
        regionBeneficiario: item.regionBeneficiario || '',
        municipioBeneficiario: item.municipioBeneficiario || '',
        telefonoContactoBeneficiario: item.telefonoContactoBeneficiario || '',
        telefonoActualBeneficiario: item.telefonoActualBeneficiario || '',
        direccionUbicacion: item.direccionUbicacion || '',
        lograContactoTelefonico: item.lograContactoTelefonico || '',
        razonNoContacto: item.razonNoContacto || '',
        viveAunMunicipio: item.viveAunMunicipio || '',
        conoceMunicipioActual: item.conoceMunicipioActual || '',
        subregionActual: item.subregionActual || '',
        municipioActual: item.municipioActual || '',
        distanciaResidencia: item.distanciaResidencia || '',
        transporteVivienda: item.transporteVivienda || '',
        cuidadorPermanente: item.cuidadorPermanente || '',
        icbfPaqueteAlimentario: item.icbfPaqueteAlimentario || '',
        tipoDocumentoCuidador: item.tipoDocumentoCuidador || '',
        numeroDocumentoCuidador: item.numeroDocumentoCuidador || '',
        primerNombreCuidador: item.primerNombreCuidador || '',
        segundoNombreCuidador: item.segundoNombreCuidador || '',
        primerApellidoCuidador: item.primerApellidoCuidador || '',
        segundoApellidoCuidador: item.segundoApellidoCuidador || '',
        telefonoContacto1Cuidador: item.telefonoContacto1Cuidador || '',
        telefonoContacto2Cuidador: item.telefonoContacto2Cuidador || '',
        tipoBarrioVereda: item.tipoBarrioVereda || '',
        nombreBarrio: item.nombreBarrio || '',
        veredaSeleccionada: item.veredaSeleccionada || '',
        otraVereda: item.otraVereda || '',
        direccionResidenciaCuidador: item.direccionResidenciaCuidador || '',
        autoriza: item.autoriza || ''
      });
    }
  }

  onSave() {
    if (this.form.valid) {
      console.log('Form data:', this.form.value);
      // Here you would save the data
      this.router.navigate(['/pcd-emergencies']);
    }
  }

  onCancel() {
    this.router.navigate(['/pcd-emergencies']);
  }
}
