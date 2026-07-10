// src/app/features/users/data-access/services/users.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { User } from '../../../../common/models/user.model';

// Interfaz para los datos del formulario de perfil
interface ProfileFormData {
  firstName?: string;
  secondName?: string;
  firstLastName?: string;
  secondLastName?: string;
  email?: string;
  department?: string;
  municipality?: string;
  identificationTypeId?: string; // Cambiado de idType a identificationTypeId
  identificationNumber?: string;
  phone?: string;
  address?: string;
  birthdate?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // Obtener todos los usuarios
  getUsers(): Observable<User[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    return this.http.get<User[]>(this.apiUrl, { headers }).pipe(
      catchError(error => {
        console.error('Error en UsersService.getUsers():', error);
        console.error('Status:', error.status);
        console.error('URL:', this.apiUrl);
        
        if (error.status === 400) {
          console.error('Error 400: Bad Request - Posibles causas:');
          console.error('1. Backend no está corriendo en localhost:3000');
          console.error('2. Endpoint incorrecto (debería ser /api/v1/users)');
          console.error('3. Token inválido o expirado');
          console.error('4. Permisos insuficientes');
        }
        
        return throwError(error);
      })
    );
  }

  // Obtener un usuario por ID
  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // Obtener el perfil del usuario logueado
  getMyProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile/me`);
  }

  // Crear un nuevo usuario
  createUser(
    userData: Omit<User, 'id' | 'isActive' | 'createdAt' | 'updatedAt' | 'lastLogin' | 'fullName'>
  ): Observable<User> {
    // Asegurarse de que roleIds esté definido como array
    const userToCreate = {
      ...userData,
      roleIds: userData.roleIds || ['USER'], // Valor por defecto si no se especifica
    };
    return this.http.post<User>(this.apiUrl, userToCreate);
  }

  // Actualizar un usuario existente
  updateUser(
    id: string,
    userData: Partial<
      Omit<User, 'id' | 'isActive' | 'createdAt' | 'updatedAt' | 'lastLogin' | 'fullName' | 'roles'>
    > & ProfileFormData
  ): Observable<User> {
    // Mapear campos del formulario de perfil a la estructura del modelo User
    const profileData = userData as ProfileFormData;
    const baseUserData = userData as Partial<User>;
    
    const mappedUserData: Partial<User> = {
      ...baseUserData,
      // Mapear nombres y apellidos del formulario de perfil
      firstName: profileData.firstName || baseUserData.firstName,
      lastName: profileData.firstLastName || baseUserData.lastName,
      middleName: profileData.secondName || baseUserData.middleName,
      secondSurname: profileData.secondLastName || baseUserData.secondSurname,
      email: profileData.email || baseUserData.email,
    };

    // Si vienen campos del formulario de perfil, mapearlos a userInfo
    if (profileData.department) {
      mappedUserData.userInfo = {
        ...baseUserData.userInfo,
        provinceId: profileData.department,
        cityId: profileData.municipality || '',
        identificationTypeId: profileData.identificationTypeId ? parseInt(profileData.identificationTypeId) : 0,
        identificationNumber: profileData.identificationNumber || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        birthdate: profileData.birthdate || '',
      };
    }

    return this.http.put<User>(`${this.apiUrl}/${id}`, mappedUserData);
  }

  // Eliminar un usuario
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Desactivar usuario (borrado lógico) - DELETE
  deactivateUser(id: string): Observable<User> {
    const url = `${this.apiUrl}/${id}`;
    console.log('[users-service] deactivateUser DELETE:', url);
    return this.http.delete<User>(url);
  }

  // Activar usuario - PUT
  activateUser(id: string): Observable<User> {
    const url = `${this.apiUrl}/${id}`;
    console.log('[users-service] activateUser PUT:', url, { isActive: true });
    return this.http.put<User>(url, { isActive: true });
  }
}
