import { ElsaState, initialState } from './elsa.state';
import * as selectors from './elsa.selectors';

const mockState: ElsaState = {
  patient: { id: 'p1', document: '123', fullName: 'Ju', sex: 'F', birthDate: '1990-01-01', age: 36, status: 'ACTIVO' } as any,
  draft: { patient_id: 'p1' },
  response: { id: 'r1' } as any,
  searchLoading: true,
  createLoading: false,
  detailLoading: false,
  searchError: 'err',
  createError: null,
  detailError: null,
};

const featureState = { elsa: mockState };

describe('elsa selectors', () => {
  it('selectElsaState retorna el slice', () => {
    // projector de createFeatureSelector retorna el estado del feature key
    expect((selectors.selectElsaState as any).projector(featureState)).toEqual(featureState);
  });

  it('selectPatient', () => {
    expect(selectors.selectPatient.projector(mockState)).toEqual(mockState.patient);
  });

  it('selectDraft', () => {
    expect(selectors.selectDraft.projector(mockState)).toEqual(mockState.draft);
  });

  it('selectResponse', () => {
    expect(selectors.selectResponse.projector(mockState)).toEqual(mockState.response);
  });

  it('selectSearchLoading', () => {
    expect(selectors.selectSearchLoading.projector(mockState)).toBe(true);
  });

  it('selectCreateLoading', () => {
    expect(selectors.selectCreateLoading.projector(mockState)).toBe(false);
  });

  it('selectDetailLoading', () => {
    expect(selectors.selectDetailLoading.projector(mockState)).toBe(false);
  });

  it('selectSearchError', () => {
    expect(selectors.selectSearchError.projector(mockState)).toBe('err');
  });

  it('selectCreateError', () => {
    expect(selectors.selectCreateError.projector(mockState)).toBeNull();
  });

  it('selectDetailError', () => {
    expect(selectors.selectDetailError.projector(mockState)).toBeNull();
  });
});