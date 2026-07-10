export type RiskClassification = 'RISK' | 'OPTIMAL' | 'NO_RISK' | 'ABSTEMIO';
export type MetsRisk = 'BAJO' | 'MODERADO' | 'ALTO';
export type Sex = 'M' | 'F';
export type PatientStatus = 'ACTIVO' | 'INACTIVO';

export interface PatientResponse {
  id: string;
  document: string;
  fullName: string;
  sex: Sex;
  birthDate: string;
  age: number;
  status: PatientStatus;
}

export interface CreateELSAFormDto {
  patient_id: string;
  evaluation_date: string;
  alim_fruits_days: number;
  alim_fruits_portions: number | null;
  alim_vegetables_days: number;
  alim_vegetables_portions: number | null;
  alim_salt_added: boolean;
  af_vigorous_days: number;
  af_vigorous_min: number | null;
  af_moderate_days: number;
  af_moderate_min: number | null;
  af_sedentary_min: number;
  tobacco_current: boolean;
  tobacco_start_age: number | null;
  tobacco_cigs_day: number | null;
  alcohol_frequency: number;
  alcohol_quantity: number | null;
  alcohol_binge: number | null;
  idempotency_key?: string;
}

export interface NutritionRisk {
  classification: RiskClassification;
  label: string;
  threshold: string;
  total: number;
}

export interface PhysicalActivityRisk {
  classification: MetsRisk;
  label: string;
  mets: number;
  range: string;
}

export interface AlcoholRisk {
  classification: RiskClassification;
  label: string;
  threshold: string;
  score: number;
}

export interface RiskProfile {
  nutrition: NutritionRisk;
  physical_activity: PhysicalActivityRisk;
  alcohol: AlcoholRisk;
}

export interface ELSAFormResponse {
  id: string;
  patient_id: string;
  evaluation_date: string;
  alim_total_portions_day: number;
  af_mets_total: number;
  alcohol_audit_score: number;
  risk_profile: RiskProfile;
  created_at: string;
  created_by_username: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}