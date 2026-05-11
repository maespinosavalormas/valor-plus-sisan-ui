import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

import { NutritionalFollowUpTraceabilityComponent } from '../nutritional-follow-up-traceability/nutritional-follow-up-traceability.component';
import { NutritionalFollowUpDetailsHeaderComponent } from '../../ui/nutritional-follow-up-details-header/nutritional-follow-up-details-header';

type ViewMode = 'details' | 'traceability';

@Component({
  selector: 'app-nutritional-follow-up-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    MatChipsModule,
    MatExpansionModule,
    NutritionalFollowUpTraceabilityComponent,
    NutritionalFollowUpDetailsHeaderComponent,
  ],
  templateUrl: './nutritional-follow-up-details.component.html',
  styleUrl: './nutritional-follow-up-details.component.scss',
})
export class NutritionalFollowUpDetailsComponent implements OnInit {
  @Input() followUp: any = null;
  @Output() edit = new EventEmitter<any>();
  @Output() back = new EventEmitter<void>();

  currentView: ViewMode = 'details';

  readonly storageKey = 'selectedNutritionalFollowUp';

  sections: Array<{ title: string; icon: string; fields: Array<{ label: string; key: string; fullWidth?: boolean }> }> = [
    {
      title: 'Inicio',
      icon: 'restaurant',
      fields: [
        { label: '¿El niño/niña es un registro nuevo o del SIVIGILA?', key: 'registroSivigila', fullWidth: true },
        { label: 'Fecha valoración nutricional', key: 'fechaValoracionNutricional' },
      ],
    },
    {
      title: 'Datos Personales',
      icon: 'person',
      fields: [
        { label: 'Número de documento', key: 'numeroDocumento' },
        { label: 'Tipo de participante', key: 'tipoParticipante' },
        { label: 'Tipo documento', key: 'tipoDocumento' },
      ],
    },
    {
      title: 'Datos Personales de Sivigila',
      icon: 'health_and_safety',
      fields: [
        { label: 'Numero de semana', key: 'numeroSemana' },
        { label: 'Nombres y apellidos completos', key: 'nombresApellidosCompletos', fullWidth: true },
        { label: 'Fecha nacimiento', key: 'fechaNacimiento' },
        { label: 'Edad', key: 'edad' },
        { label: 'Género', key: 'genero' },
        { label: 'Sexo', key: 'sexo' },
        { label: 'Municipio', key: 'municipio' },
        { label: 'Subregión', key: 'subregion' },
        { label: 'Telefono', key: 'telefono' },
        { label: 'Telefono SIVIGILA 1', key: 'telefonoSivigila1' },
        { label: 'Telefono SIVIGILA 2', key: 'telefonoSivigila2' },
        { label: 'Peso al nacer en gramos', key: 'pesoAlNacer' },
        { label: 'Tipo seguridad social', key: 'tipoSeguridadSocial' },
        { label: 'Nombre EAPB', key: 'nombreEAPB' },
      ],
    },
    {
      title: 'Datos Personales Nuevos',
      icon: 'person_add',
      fields: [
        { label: 'Primer nombre nuevo', key: 'primerNombreNuevo' },
        { label: 'Segundo nombre nuevo', key: 'segundoNombreNuevo' },
        { label: 'Primer apellido nuevo', key: 'primerApellidoNuevo' },
        { label: 'Segundo apellido nuevo', key: 'segundoApellidoNuevo' },
        { label: 'Fecha nac 2', key: 'fechaNac2' },
        { label: 'Mostrar edad 2', key: 'edad2' },
        { label: 'Género nuevo', key: 'generoNuevo' },
        { label: 'Sexo 2', key: 'sexo2' },
        { label: 'Municipio nuevo', key: 'municipioNuevo' },
        { label: 'Subregión calc', key: 'subregionCalc' },
        { label: 'Dirección nuevos', key: 'direccionNuevos', fullWidth: true },
        { label: 'Teléfono nuevos', key: 'telefonoNuevos' },
        { label: 'Teléfono nuevos_validación', key: 'telefonoNuevosValidacion' },
        { label: 'Tipo sgss 2', key: 'tipoSgss2' },
        { label: 'Nombre eps 2', key: 'nombreEps2' },
      ],
    },
    {
      title: 'Datos Personales',
      icon: 'calculate',
      fields: [
        { label: 'Años', key: 'anios' },
        { label: 'Meses', key: 'meses' },
        { label: 'Edad completa', key: 'edadCompleta' },
        { label: 'Prematuro', key: 'prematuro' },
        { label: 'Semanas prematuro', key: 'semanasPrematuro' },
        { label: 'Edad sin corregir', key: 'edadSinCorregir' },
        { label: 'Edad corregida', key: 'edadCorregida' },
        { label: 'Edad 3', key: 'edad3' },
        { label: 'Edad meses', key: 'edadMeses' },
        { label: 'Categoria edad', key: 'categoriaEdad' },
        { label: 'Grupo etnia', key: 'grupoEtnia' },
        { label: 'Discapacidad', key: 'discapacidad' },
        { label: 'Patologia base', key: 'patologiaBase' },
        { label: 'Edema bilateral', key: 'edemaBilateral' },
        { label: 'Esquema vacunación CPN', key: 'esquemaVacunacionCPN' },
        { label: 'Asiste CPN', key: 'asisteCPN' },
        { label: 'Fecha ultimo CPN', key: 'fechaUltimoCPN' },
        { label: 'Esquema vacunación CYD', key: 'esquemaVacunacionCYD' },
        { label: 'Asiste CYD', key: 'asisteCYD' },
        { label: 'Fecha ultimo CYD', key: 'fechaUltimoCYD' },
      ],
    },
    {
      title: 'Tamizaje anterior',
      icon: 'query_stats',
      fields: [
        { label: 'Fecha toma 1', key: 'fechaToma1' },
        { label: 'Edad toma 1', key: 'edadToma1' },
        { label: 'Peso 1', key: 'peso1' },
        { label: 'Estatura 1', key: 'estatura1' },
        { label: 'Puntajez P/T 1', key: 'puntajezPt1' },
        { label: 'Clasificación Peso/Talla 1', key: 'clasificacionPesoTalla1' },
        { label: 'Puntajez T/E 1', key: 'puntajezTe1' },
        { label: 'Clasificación Talla/Edad 1', key: 'clasificacionTallaEdad1' },
        { label: 'Puntajez P/E 1', key: 'puntajezPe1' },
        { label: 'Clasificación Peso/Edad 1', key: 'clasificacionPesoEdad1' },
      ],
    },
    {
      title: 'Medidas antropometricas actuales',
      icon: 'monitor_weight',
      fields: [
        { label: 'Peso', key: 'peso' },
        { label: 'Estatura', key: 'estatura' },
        { label: 'Semanas gestación', key: 'semanasGestacion' },
        { label: 'Perimetro braquial', key: 'perimetroBraquial' },
        { label: 'Perimetro cefalico', key: 'perimetroCefalico' },
      ],
    },
    {
      title: 'Clasificacion nutricional',
      icon: 'assignment',
      fields: [
        { label: 'Puntajez P/T', key: 'puntajezPt' },
        { label: 'Clasificación Peso/Talla', key: 'clasificacionPesoTalla' },
        { label: 'Puntajez T/E', key: 'puntajezTe' },
        { label: 'Clasificación Talla/Edad', key: 'clasificacionTallaEdad' },
        { label: 'Puntajez P/E', key: 'puntajezPe' },
        { label: 'Clasificación Peso/Edad', key: 'clasificacionPesoEdad' },
        { label: 'Puntajez T/E IMC', key: 'puntajezTeImc' },
        { label: 'Clasificación Talla/Edad IMC', key: 'clasificacionTallaEdadImc' },
        { label: 'Puntajez IMC', key: 'puntajezImc' },
        { label: 'Clasificación IMC', key: 'clasificacionImc' },
      ],
    },
    {
      title: 'Clasificacion nutricional gestional',
      icon: 'pregnant_woman',
      fields: [
        { label: 'Clasificación gestante', key: 'clasificacionGestante' },
        { label: 'IMC gestante', key: 'imcGestante' },
        { label: 'Clasificación IMC edad gestacional', key: 'clasificacionImcEdadGestacional' },
      ],
    },
    {
      title: 'Clasificación parálisis cerebral',
      icon: 'accessibility_new',
      fields: [
        { label: 'Grado GMFCS', key: 'gradoGMFCS' },
        { label: 'Percentil peso edad PC', key: 'percentilPesoEdadPC' },
        { label: 'Clasificación Peso/Edad PC', key: 'clasificacionPesoEdadPC' },
        { label: 'Percentil talla edad PC', key: 'percentilTallaEdadPC' },
        { label: 'Clasificación Talla/Edad PC', key: 'clasificacionTallaEdadPC' },
        { label: 'Percentil Imc Edad PC', key: 'percentilImcEdadPC' },
        { label: 'Clasificación IMC/Edad PC', key: 'clasificacionImcEdadPC' },
      ],
    },
    {
      title: 'Clasificación Síndrome Down',
      icon: 'local_hospital',
      fields: [
        { label: 'Percentil Peso Edad SD', key: 'percentilPesoEdadSD' },
        { label: 'Clasificación Peso/Edad SD', key: 'clasificacionPesoEdadSD' },
        { label: 'Percentil Talla Edad SD', key: 'percentilTallaEdadSD' },
        { label: 'Clasificación Talla/Edad SD', key: 'clasificacionTallaEdadSD' },
      ],
    },
    {
      title: 'Clasificación Prematuro',
      icon: 'child_care',
      fields: [
        { label: 'Percentil peso edad gest', key: 'percentilPesoEdadGest' },
        { label: 'Clasificación Peso/Edad Gest', key: 'clasificacionPesoEdadGest' },
        { label: 'Percentil longitud edad gest', key: 'percentilLongitudEdadGest' },
        { label: 'Clasificación Long/Edad Gest', key: 'clasificacionLongEdadGest' },
      ],
    },
    {
      title: 'Clasificación Acondroplasia',
      icon: 'healing',
      fields: [
        { label: 'Percentil peso edad AC', key: 'percentilPesoEdadAC' },
        { label: 'Clasificación Peso/Edad AC', key: 'clasificacionPesoEdadAC' },
        { label: 'Percentil talla edad AC', key: 'percentilTallaEdadAC' },
        { label: 'Clasificación Talla/Edad AC', key: 'clasificacionTallaEdadAC' },
        { label: 'Percentil imc edad AC', key: 'percentilImcEdadAC' },
        { label: 'Clasificación IMC/Edad AC', key: 'clasificacionImcEdadAC' },
      ],
    },
    {
      title: 'Preguntas malnutrición',
      icon: 'question_answer',
      fields: [
        { label: 'Reciben atención?', key: 'recibenAtencion' },
        { label: 'Recibe fórmula?', key: 'recibeFormula' },
        { label: 'Motivo no recibe FTLC', key: 'motivoNoRecibeFTLC' },
        { label: 'Adherente', key: 'adherente' },
        { label: 'Motivo no adherente', key: 'motivoNoAdherente' },
        { label: 'Esquema consumo', key: 'esquemaConsumo' },
        { label: 'Consumo otro supl', key: 'consumoOtroSupl' },
        { label: 'Supl compl', key: 'suplCompl' },
        { label: 'Leche materna', key: 'lecheMaterna' },
        { label: 'Condición nutricional', key: 'condicionNutricional' },
        { label: 'Hospitalización', key: 'hospitalizacion' },
        { label: 'Motivo consulta', key: 'motivoConsulta' },
        { label: 'Seguimiento periódico', key: 'seguimientoPeriodico' },
        { label: 'Condiciones dnt', key: 'condicionesDnt' },
        { label: 'Activación ruta', key: 'activacionRuta' },
        { label: 'Tipo ruta activación', key: 'tipoRutaActivacion' },
        { label: 'Tipo no rec atencion', key: 'tipoNoRecAtencion' },
        { label: 'Consume leche?', key: 'consumeLeche' },
        { label: 'Consume leche frecuencia', key: 'consumeLecheFrecuencia' },
        { label: 'Consume carnes', key: 'consumeCarnes' },
        { label: 'Consume carnes frecuencia', key: 'consumeCarnesFrecuencia' },
        { label: 'Consume cereales', key: 'consumeCereales' },
        { label: 'Consume cereales frecuencia', key: 'consumeCerealesFrecuencia' },
        { label: 'Consume grasas', key: 'consumeGrasas' },
        { label: 'Consume grasas frecuencia', key: 'consumeGrasasFrecuencia' },
        { label: 'Consume azucares', key: 'consumeAzucares' },
        { label: 'Consume azucares frecuencia', key: 'consumeAzucaresFrecuencia' },
        { label: 'Consume frutas verduras', key: 'consumeFrutasVerduras' },
        { label: 'Consume frutas verduras frecuencia', key: 'consumeFrutasVerdurasFrecuencia' },
      ],
    },
    {
      title: 'Observaciones',
      icon: 'notes',
      fields: [{ label: 'Observaciones', key: 'observaciones', fullWidth: true }],
    },
    {
      title: 'Datos del funcionario',
      icon: 'badge',
      fields: [
        { label: 'Número documento funcionario', key: 'numeroDocumentoFuncionario' },
        { label: 'Nombre completo funcionario', key: 'nombreCompletoFuncionario' },
        { label: 'Nombres apellidos funcionario', key: 'nombresApellidosFuncionario', fullWidth: true },
        { label: 'Perfil funcionario', key: 'perfilFuncionario' },
      ],
    },
    {
      title: 'Consentimiento informado',
      icon: 'verified_user',
      fields: [
        { label: 'Consentimiento datos personales', key: 'consentimientoDatosPersonales' },
        { label: 'Consentimiento imágenes audios', key: 'consentimientoImagenesAudios' },
        { label: 'Firma responsable', key: 'firmaResponsable', fullWidth: true },
      ],
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const navigation = this.router.getCurrentNavigation();
    const itemFromState = navigation?.extras?.state?.['item'];

    if (itemFromState) {
      this.followUp = itemFromState;
      localStorage.setItem(this.storageKey, JSON.stringify(itemFromState));
      return;
    }

    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        this.followUp = JSON.parse(stored);
        return;
      } catch {
        this.followUp = null;
      }
    }

    const id = this.route.snapshot.paramMap.get('id');
    this.followUp = { id };
  }

  onViewChange(view: ViewMode): void {
    this.currentView = view;
  }

  onBack(): void {
    this.back.emit();
    this.router.navigate(['/nutritional-follow-up']);
  }

  onEdit(): void {
    if (!this.followUp?.id) return;

    this.edit.emit(this.followUp);
    this.router.navigate(['/nutritional-follow-up/edit', this.followUp.id], {
      state: { item: this.followUp },
    });
  }

  getValue(key: string): string {
    const val = this.followUp?.[key];
    if (val === null || val === undefined || val === '') return 'N/A';
    return String(val);
  }
}
