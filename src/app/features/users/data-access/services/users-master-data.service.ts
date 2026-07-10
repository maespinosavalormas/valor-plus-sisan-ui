import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface Province {
  id: number;
  name: string;
}

export interface City {
  id: number;
  name: string;
}

export interface IdentificationType {
  id: number;
  name: string;
  code: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersMasterDataService {
  private baseUrl = environment.apiUrl;

  // BehaviorSubjects para caché de datos
  private provincesSubject = new BehaviorSubject<Province[]>([]);
  private identificationTypesSubject = new BehaviorSubject<IdentificationType[]>([]);

  constructor(private http: HttpClient) {}

  // Métodos para obtener provincias
  getProvinces(): Observable<Province[]> {
    if (this.provincesSubject.value.length === 0) {
      this.loadProvinces();
    }
    return this.provincesSubject.asObservable();
  }

  private loadProvinces(): void {
    this.http.get<Province[]>(`${this.baseUrl}/provinces`).subscribe(
      data => this.provincesSubject.next(data),
      error => {
        console.error('Error loading provinces from API:', error);
        this.provincesSubject.next([]);
      }
    );
  }

  // Métodos para obtener ciudades por provincia
  getCitiesByProvince(provinceId: number): Observable<City[]> {
    return this.http.get<City[]>(`${this.baseUrl}/provinces/${provinceId}/cities`);
  }

  // Métodos para obtener tipos de identificación
  getIdentificationTypes(): Observable<IdentificationType[]> {
    if (this.identificationTypesSubject.value.length === 0) {
      this.loadIdentificationTypes();
    }
    return this.identificationTypesSubject.asObservable();
  }

  private loadIdentificationTypes(): void {
    this.http.get<IdentificationType[]>(`${this.baseUrl}/master-records?categories=IDENTIFICATION_TYPES`).subscribe(
      data => this.identificationTypesSubject.next(data),
      error => {
        console.error('Error loading identification types from API:', error);
        this.identificationTypesSubject.next([]);
      }
    );
  }
}
