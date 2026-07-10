import {
  calculateAlimentationRisk,
  calculateMETs,
  calculateAUDITC,
  validateTimeSum,
  validateTobaccoStartAge,
  normalizePayload,
} from './elsa-calculations';

describe('elsa-calculations', () => {
  describe('calculateAlimentationRisk', () => {
    it('CA-12: 7 días × 3 porciones → total=3 (RISK)', () => {
      const r = calculateAlimentationRisk(7, 3, 0, 0);
      expect(r.total).toBe(3);
      expect(r.classification).toBe('RISK');
      expect(r.label).toContain('Bajo consumo');
    });

    it('5+ porciones/día → OPTIMAL', () => {
      const r = calculateAlimentationRisk(7, 3, 7, 3);
      expect(r.total).toBe(6);
      expect(r.classification).toBe('OPTIMAL');
    });

    it('null portions treated as 0', () => {
      const r = calculateAlimentationRisk(3, null, 4, null);
      expect(r.total).toBe(0);
    });

    it('rounding HALF UP to 2 decimals', () => {
      // 5 * 1 + 1 * 1 = 6 / 7 = 0.857... → 0.86
      const r = calculateAlimentationRisk(5, 1, 1, 1);
      expect(r.total).toBe(0.86);
    });
  });

  describe('calculateMETs', () => {
    it('SPEC example: (3×60×8) + (2×30×4) = 1680 METs → MODERADO', () => {
      const r = calculateMETs(3, 60, 2, 30);
      expect(r.mets).toBe(1680);
      expect(r.classification).toBe('MODERADO');
    });

    it('<600 → BAJO', () => {
      const r = calculateMETs(1, 30, 0, 0);
      expect(r.classification).toBe('BAJO');
    });

    it('>3000 → ALTO', () => {
      // 7×60×8 + 7×60×4 = 3360+1680 = 5040
      const r = calculateMETs(7, 60, 7, 60);
      expect(r.mets).toBe(5040);
      expect(r.classification).toBe('ALTO');
    });

    it('null minutes treated as 0', () => {
      const r = calculateMETs(3, null, 2, null);
      expect(r.mets).toBe(0);
      expect(r.classification).toBe('BAJO');
    });
  });

  describe('calculateAUDITC', () => {
    it('SPEC example: 2+1+0=3 mujer → RISK', () => {
      const r = calculateAUDITC(2, 1, 0, 'F');
      expect(r.score).toBe(3);
      expect(r.classification).toBe('RISK');
    });

    it('2+1+0 hombre → NO_RISK (umbral 4)', () => {
      const r = calculateAUDITC(2, 1, 0, 'M');
      expect(r.classification).toBe('NO_RISK');
    });

    it('score 0 → ABSTEMIO', () => {
      const r = calculateAUDITC(0, null, null, 'F');
      expect(r.classification).toBe('ABSTEMIO');
    });
  });

  describe('validateTimeSum (CA-15)', () => {
    it('sum=1440 → valid', () => {
      expect(validateTimeSum(480, 480, 480).valid).toBe(true);
    });
    it('sum=1441 → invalid', () => {
      expect(validateTimeSum(480, 481, 480).valid).toBe(false);
    });
  });

  describe('validateTobaccoStartAge (CA-09)', () => {
    it('startAge > patientAge → invalid', () => {
      const r = validateTobaccoStartAge(35, 30);
      expect(r.valid).toBe(false);
      expect(r.message).toContain('edad del paciente');
    });
    it('startAge=5 → invalid (must be > 5)', () => {
      expect(validateTobaccoStartAge(5, 30).valid).toBe(false);
    });
    it('startAge=18, patientAge=30 → valid', () => {
      expect(validateTobaccoStartAge(18, 30).valid).toBe(true);
    });
  });

  describe('normalizePayload (CA-04)', () => {
    it('tobacco_current=false → null age and cigs', () => {
      const r = normalizePayload({
        tobacco_current: false,
        tobacco_start_age: 18,
        tobacco_cigs_day: 10,
        alcohol_frequency: 0,
        alcohol_quantity: 3,
        alcohol_binge: 2,
        alim_fruits_days: 5,
        alim_fruits_portions: 2,
        alim_vegetables_days: 3,
        alim_vegetables_portions: 1,
      });
      expect(r.tobacco_start_age).toBeNull();
      expect(r.tobacco_cigs_day).toBeNull();
      expect(r.alcohol_quantity).toBe(0);
      expect(r.alcohol_binge).toBe(0);
    });

    it('tobacco_current=true → keeps age and cigs', () => {
      const r = normalizePayload({
        tobacco_current: true,
        tobacco_start_age: 18,
        tobacco_cigs_day: 10,
        alcohol_frequency: 2,
        alcohol_quantity: 3,
        alcohol_binge: 1,
        alim_fruits_days: 5,
        alim_fruits_portions: 2,
        alim_vegetables_days: 3,
        alim_vegetables_portions: 1,
      });
      expect(r.tobacco_start_age).toBe(18);
      expect(r.tobacco_cigs_day).toBe(10);
      expect(r.alcohol_quantity).toBe(3);
      expect(r.alcohol_binge).toBe(1);
    });

    it('alim_fruits_days=0 → portions null', () => {
      const r = normalizePayload({
        tobacco_current: false,
        tobacco_start_age: null,
        tobacco_cigs_day: null,
        alcohol_frequency: 0,
        alcohol_quantity: null,
        alcohol_binge: null,
        alim_fruits_days: 0,
        alim_fruits_portions: 5,
        alim_vegetables_days: 7,
        alim_vegetables_portions: 3,
      });
      expect(r.alim_fruits_portions).toBeNull();
      expect(r.alim_vegetables_portions).toBe(3);
    });
  });
});