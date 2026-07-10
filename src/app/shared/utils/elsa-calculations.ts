import { RiskClassification, MetsRisk, Sex } from '../../features/estilos-vida/data-access/elsa.contracts';

/**
 * Cálculo consumo diario de frutas + verduras (SPEC §5.1, CA-12).
 * Round HALF UP a 2 decimales.
 * Clasificación OMS: < 5 RISK, >= 5 OPTIMAL.
 */
export function calculateAlimentationRisk(
  frutasDias: number,
  frutasPorc: number | null,
  verdurasDias: number,
  verdurasPorc: number | null,
): { total: number; classification: RiskClassification; label: string } {
  const total =
    Math.round(
      ((frutasDias * (frutasPorc ?? 0) + verdurasDias * (verdurasPorc ?? 0)) / 7) * 100,
    ) / 100;
  const isRisk = total < 5;
  return {
    total,
    classification: isRisk ? 'RISK' : 'OPTIMAL',
    label: isRisk
      ? 'Riesgo: Bajo consumo de frutas y verduras'
      : 'Óptimo consumo de frutas y verduras',
  };
}

/**
 * Cálculo METs semanales (SPEC §5.2, CA-05). Round 2 decimales.
 * Clasificación OMS: <600 BAJO, 600-3000 MODERADO, >3000 ALTO.
 */
export function calculateMETs(
  vigDias: number,
  vigMin: number | null,
  modDias: number,
  modMin: number | null,
): { mets: number; classification: MetsRisk; label: string; range: string } {
  const mets =
    Math.round((vigDias * (vigMin ?? 0) * 8 + modDias * (modMin ?? 0) * 4) * 100) / 100;
  const classification: MetsRisk = mets < 600 ? 'BAJO' : mets <= 3000 ? 'MODERADO' : 'ALTO';
  return {
    mets,
    classification,
    label:
      classification === 'BAJO'
        ? 'Bajo (Sedentario)'
        : classification === 'MODERADO'
          ? 'Nivel Moderado'
          : 'Nivel Alto',
    range:
      classification === 'BAJO'
        ? '< 600 METs'
        : classification === 'MODERADO'
          ? '600 - 3000 METs'
          : '> 3000 METs',
  };
}

/**
 * AUDIT-C (SPEC §5.3, CA-06). Score = freq + cant + binge.
 * Hombre umbral >=4; Mujer >=3. Score 0 → ABSTEMIO.
 */
export function calculateAUDITC(
  freq: number,
  cant: number | null,
  binge: number | null,
  sex: Sex,
): { score: number; classification: RiskClassification; label: string; threshold: string } {
  const score = (freq ?? 0) + (cant ?? 0) + (binge ?? 0);
  if (score === 0) {
    return {
      score: 0,
      classification: 'ABSTEMIO',
      label: 'Abstemio / Sin Riesgo',
      threshold: 'Score 0',
    };
  }
  const threshold = sex === 'M' ? 4 : 3;
  const isRisk = score >= threshold;
  return {
    score,
    classification: isRisk ? 'RISK' : 'NO_RISK',
    label: isRisk ? 'Consumo de Riesgo' : 'Sin Riesgo',
    threshold: sex === 'M' ? 'Hombre >=4' : 'Mujer >=3',
  };
}

/**
 * Valida suma de minutos (vigorosa + moderada + sedentario) ≤ 1440 (SPEC §6.3, CA-15).
 */
export function validateTimeSum(
  vigMin: number | null,
  modMin: number | null,
  sedMin: number | null,
): { valid: boolean; sum: number } {
  const sum = (vigMin ?? 0) + (modMin ?? 0) + (sedMin ?? 0);
  return { valid: sum <= 1440, sum };
}

/**
 * Valida edad de inicio de tabaco (SPEC §6.3, CA-09): > 5 y ≤ edad actual paciente.
 */
export function validateTobaccoStartAge(startAge: number | null, patientAge: number): {
  valid: boolean;
  message?: string;
} {
  if (startAge === null || startAge === undefined) return { valid: false, message: 'Requerido' };
  if (startAge <= 5) return { valid: false, message: 'La edad debe ser mayor a 5 años' };
  if (startAge > patientAge) return { valid: false, message: 'La edad no puede superar la edad del paciente' };
  return { valid: true };
}

/**
 * Normaliza el payload del form antes del POST (SPEC §6.2, CA-04):
 * - tobacco_current=false → tobacco_start_age/cigs_day = null
 * - alcohol_frequency=0 → alcohol_quantity/binge = 0
 * - alim_*_days=0 → alim_*_portions = null
 */
export function normalizePayload(raw: {
  tobacco_current: boolean | null;
  tobacco_start_age: number | null;
  tobacco_cigs_day: number | null;
  alcohol_frequency: number | null;
  alcohol_quantity: number | null;
  alcohol_binge: number | null;
  alim_fruits_days: number | null;
  alim_fruits_portions: number | null;
  alim_vegetables_days: number | null;
  alim_vegetables_portions: number | null;
}): {
  tobacco_start_age: number | null;
  tobacco_cigs_day: number | null;
  alcohol_quantity: number | null;
  alcohol_binge: number | null;
  alim_fruits_portions: number | null;
  alim_vegetables_portions: number | null;
} {
  return {
    tobacco_start_age: raw.tobacco_current ? raw.tobacco_start_age : null,
    tobacco_cigs_day: raw.tobacco_current ? raw.tobacco_cigs_day : null,
    alcohol_quantity: (raw.alcohol_frequency ?? 0) > 0 ? raw.alcohol_quantity : 0,
    alcohol_binge: (raw.alcohol_frequency ?? 0) > 0 ? raw.alcohol_binge : 0,
    alim_fruits_portions: (raw.alim_fruits_days ?? 0) > 0 ? raw.alim_fruits_portions : null,
    alim_vegetables_portions:
      (raw.alim_vegetables_days ?? 0) > 0 ? raw.alim_vegetables_portions : null,
  };
}