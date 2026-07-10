import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface WizardStep {
  id: string;
  title: string;
  component: string;
  isValid: boolean;
  isVisited: boolean;
  isOptional?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CaseFormWizardService {
  private currentStepSubject = new BehaviorSubject<number>(0);
  private stepsSubject = new BehaviorSubject<WizardStep[]>([
    {
      id: 'step1',
      title: 'Información General',
      component: 'datos-informacion-general',
      isValid: false,
      isVisited: false
    },
    {
      id: 'step2',
      title: 'Identificación del Paciente',
      component: 'identificacion-del-paciente',
      isValid: false,
      isVisited: false
    },
    {
      id: 'step3',
      title: 'Datos de Notificación',
      component: 'datos-notificacion',
      isValid: false,
      isVisited: false
    },
    {
      id: 'step4',
      title: 'Datos de la Madre',
      component: 'datos-de-la-madre-o-cuidador',
      isValid: false,
      isVisited: false
    },
    {
      id: 'step5',
      title: 'Identificación de Factores',
      component: 'identificacion-de-factores',
      isValid: false,
      isVisited: false
    },
    {
      id: 'step6',
      title: 'Signos Clínicos',
      component: 'signos-clinicos',
      isValid: false,
      isVisited: false
    },
    {
      id: 'step7',
      title: 'Ruta de Atención',
      component: 'ruta-de-atencion',
      isValid: false,
      isVisited: false
    }
  ]);

  constructor() {}

  // Observable para el paso actual
  getCurrentStep() {
    return this.currentStepSubject.asObservable();
  }

  // Observable para todos los pasos
  getSteps() {
    return this.stepsSubject.asObservable();
  }

  // Obtener el valor actual del paso
  getCurrentStepValue(): number {
    return this.currentStepSubject.value;
  }

  // Obtener todos los pasos como valor
  getStepsValue(): WizardStep[] {
    return this.stepsSubject.value;
  }

  // Navegar al siguiente paso
  nextStep(): boolean {
    const currentStep = this.currentStepSubject.value;
    const steps = this.stepsSubject.value;
    
    if (currentStep < steps.length - 1) {
      // Marcar el paso actual como visitado
      this.markStepAsVisited(currentStep);
      
      // Validar paso actual antes de avanzar
      if (this.validateCurrentStep()) {
        this.currentStepSubject.next(currentStep + 1);
        return true;
      }
      return false;
    }
    return false;
  }

  // Navegar al paso anterior
  previousStep(): boolean {
    const currentStep = this.currentStepSubject.value;
    
    if (currentStep > 0) {
      this.currentStepSubject.next(currentStep - 1);
      return true;
    }
    return false;
  }

  // Ir a un paso específico
  goToStep(stepIndex: number): boolean {
    const steps = this.stepsSubject.value;
    
    if (stepIndex >= 0 && stepIndex < steps.length) {
      // Validar pasos anteriores antes de permitir el salto
      if (this.canNavigateToStep(stepIndex)) {
        this.currentStepSubject.next(stepIndex);
        return true;
      }
    }
    return false;
  }

  // Verificar si se puede navegar a un paso específico
  canNavigateToStep(stepIndex: number): boolean {
    const steps = this.stepsSubject.value;
    
    // Permitir retroceder siempre
    if (stepIndex < this.currentStepSubject.value) {
      return true;
    }
    
    // Para avanzar, validar todos los pasos anteriores
    for (let i = 0; i < stepIndex; i++) {
      if (!steps[i].isOptional && !steps[i].isValid) {
        return false;
      }
    }
    
    return true;
  }

  // Validar el paso actual
  validateCurrentStep(): boolean {
    const currentStep = this.currentStepSubject.value;
    const steps = this.stepsSubject.value;
    const currentStepData = steps[currentStep];
    
    return currentStepData.isOptional || currentStepData.isValid;
  }

  // Actualizar la validez de un paso
  updateStepValidity(stepId: string, isValid: boolean): void {
    const steps = this.stepsSubject.value;
    const updatedSteps = steps.map(step => 
      step.id === stepId ? { ...step, isValid } : step
    );
    this.stepsSubject.next(updatedSteps);
  }

  // Marcar un paso como visitado
  markStepAsVisited(stepIndex: number): void {
    const steps = this.stepsSubject.value;
    const updatedSteps = steps.map((step, index) => 
      index === stepIndex ? { ...step, isVisited: true } : step
    );
    this.stepsSubject.next(updatedSteps);
  }

  // Obtener el paso actual
  getCurrentStepData(): WizardStep {
    const steps = this.stepsSubject.value;
    const currentStep = this.currentStepSubject.value;
    return steps[currentStep];
  }

  // Verificar si es el último paso
  isLastStep(): boolean {
    const currentStep = this.currentStepSubject.value;
    const steps = this.stepsSubject.value;
    return currentStep === steps.length - 1;
  }

  // Verificar si es el primer paso
  isFirstStep(): boolean {
    return this.currentStepSubject.value === 0;
  }

  // Obtener el progreso del formulario (porcentaje)
  getProgress(): number {
    const steps = this.stepsSubject.value;
    const completedSteps = steps.filter(step => step.isValid).length;
    return Math.round((completedSteps / steps.length) * 100);
  }

  // Validar todos los pasos
  validateAllSteps(): { isValid: boolean; errors: string[] } {
    const steps = this.stepsSubject.value;
    const errors: string[] = [];

    steps.forEach((step, index) => {
      if (!step.isOptional && !step.isValid) {
        errors.push(`El paso ${index + 1} (${step.title}) es requerido y no está completo`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Resetear el wizard
  resetWizard(): void {
    this.currentStepSubject.next(0);
    const resetSteps = this.stepsSubject.value.map(step => ({
      ...step,
      isValid: false,
      isVisited: false
    }));
    this.stepsSubject.next(resetSteps);
  }

  // Obtener resumen del formulario
  getFormSummary(): { completed: number; total: number; current: string } {
    const steps = this.stepsSubject.value;
    const currentStepData = steps[this.currentStepSubject.value];
    const completedSteps = steps.filter(step => step.isValid).length;

    return {
      completed: completedSteps,
      total: steps.length,
      current: currentStepData?.title || ''
    };
  }

  // Verificar si hay cambios no guardados
  hasUnsavedChanges(): boolean {
    const steps = this.stepsSubject.value;
    return steps.some(step => step.isVisited && step.isValid);
  }

  // Obtener pasos incompletos
  getIncompleteSteps(): WizardStep[] {
    const steps = this.stepsSubject.value;
    return steps.filter(step => !step.isOptional && !step.isValid);
  }

  // Obtener pasos completos
  getCompletedSteps(): WizardStep[] {
    const steps = this.stepsSubject.value;
    return steps.filter(step => step.isValid);
  }

  // Saltar al siguiente paso válido
  skipToNextValidStep(): boolean {
    const currentStep = this.currentStepSubject.value;
    const steps = this.stepsSubject.value;
    
    for (let i = currentStep + 1; i < steps.length; i++) {
      if (steps[i].isOptional || steps[i].isValid) {
        return this.goToStep(i);
      }
    }
    
    return false;
  }

  // Obtener el siguiente paso requerido incompleto
  getNextIncompleteRequiredStep(): number | null {
    const steps = this.stepsSubject.value;
    
    for (let i = 0; i < steps.length; i++) {
      if (!steps[i].isOptional && !steps[i].isValid) {
        return i;
      }
    }
    
    return null;
  }
}
