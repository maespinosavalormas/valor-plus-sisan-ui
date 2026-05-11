import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Case } from '../../ui/cases-list/cases-list.component';

export interface CaseData {
  // Objeto plano con todos los campos del caso sin separación por pasos
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class CaseFormService {
  private editingCase$ = new BehaviorSubject<Case | null>(null);
  private createdCase$ = new BehaviorSubject<CaseData | null>(null);

  constructor() {}

  // Observable para saber si estamos editando
  getEditingCase() {
    return this.editingCase$.asObservable();
  }

  // Observable para obtener el caso creado
  getCreatedCase() {
    return this.createdCase$.asObservable();
  }

  // Iniciar edición de un caso
  editCase(caseData: Case) {
    this.editingCase$.next(caseData);
  }

  // Guardar caso creado (ahora como objeto plano)
  saveCreatedCase(caseData: CaseData) {
    this.createdCase$.next(caseData);
    console.log('Caso guardado como objeto plano:', caseData);
  }

  // Limpiar estado de edición
  clearEditing() {
    this.editingCase$.next(null);
  }

  // Limpiar caso creado
  clearCreatedCase() {
    this.createdCase$.next(null);
  }

  // Obtener el caso que se está editando
  getCurrentEditingCase(): Case | null {
    return this.editingCase$.value;
  }

  // Obtener el caso creado
  getCurrentCreatedCase(): CaseData | null {
    return this.createdCase$.value;
  }

  // Obtener el caso creado como JSON string (para fácil copia)
  getCurrentCreatedCaseAsJson(): string | null {
    const caseData = this.createdCase$.value;
    return caseData ? JSON.stringify(caseData, null, 2) : null;
  }
}
