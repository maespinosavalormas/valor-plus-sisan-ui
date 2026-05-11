import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  constructor() {}

  log(message: string, data: any = null): void {
    if (!environment.production) {
      if (data) {
        console.log(`[LOG] ${message}`, data);
      } else {
        console.log(`[LOG] ${message}`);
      }
    }
  }

  error(message: string, error: any = null): void {
    if (error) {
      console.error(`[ERROR] ${message}`, error);
    } else {
      console.error(`[ERROR] ${message}`);
    }
  }

  warn(message: string, data: any = null): void {
    if (data) {
      console.warn(`[WARN] ${message}`, data);
    } else {
      console.warn(`[WARN] ${message}`);
    }
  }
}
