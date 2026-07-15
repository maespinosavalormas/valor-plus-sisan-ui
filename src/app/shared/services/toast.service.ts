import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toasts = new BehaviorSubject<ToastMessage[]>([]);
  readonly toasts$ = this.toasts.asObservable();

  private audioCtx: AudioContext | null = null;

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success', duration: number = 5000): void {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const toast: ToastMessage = { id, message, type, duration };

    const current = this.toasts.value;
    this.toasts.next([...current, toast]);

    // Play success sound
    if (type === 'success') {
      this.playSuccessSound();
    }

    // Auto-remove after duration
    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  remove(id: string): void {
    const current = this.toasts.value;
    this.toasts.next(current.filter((t) => t.id !== id));
  }

  clear(): void {
    this.toasts.next([]);
  }

  private playSuccessSound(): void {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const oscillator = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      oscillator.frequency.setValueAtTime(800, this.audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, this.audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);

      oscillator.start(this.audioCtx.currentTime);
      oscillator.stop(this.audioCtx.currentTime + 0.1);
    } catch {
      // Audio not supported, silently fail
    }
  }
}
