import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Renderer2,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NgZone } from '@angular/core';
import { AuthAlertComponent } from '../../ui/auth-alert/auth-alert.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule,
    AuthAlertComponent,
  ],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})

export class LoginPageComponent implements OnInit, OnDestroy {

  loginForm: FormGroup;
  loading = false;
  error = '';
  serverError = ''; // Para errores del servidor

  // Propiedades para alertas
  alertVisible = false;
  alertType: 'error' | 'warning' | 'info' | 'success' = 'error';
  alertTitle = '';
  alertMessage = '';

  // Propiedades para visibilidad de contraseña
  hidePassword = true;

  images: string[] = [
    '/assets/images/imagen-login-1.jpg',
    '/assets/images/imagen-login-2.jpg',
    '/assets/images/imagen-login-3.jpg',
  ];

  currentIndex = 0;
  animate = false;
  private intervalId: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.animate = true;
    this.rotateImages();
    console.log('Inicio - currentIndex:', this.currentIndex);
  }

  rotateImages(): void {
    console.log('rotateImages iniciado');
    this.intervalId = setInterval(() => {
      console.log('Interval ejecutado, currentIndex:', this.currentIndex, 'animate:', this.animate);
      this.animate = false;
      this.cdr.detectChanges(); // Forzar detección
      
      setTimeout(() => {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        console.log('Nuevo currentIndex:', this.currentIndex, 'imagenes totales:', this.images.length);
        this.animate = true;
        this.cdr.detectChanges(); // Forzar detección
        console.log('animate establecido en true, detectChanges llamado');
      }, 30);
    }, 3000);
    console.log('Intervalo configurado con ID:', this.intervalId);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      console.log('Formulario inválido:', this.loginForm.errors);
      this.showAlert('warning', 'Datos Inválidos', 'Por favor, completa todos los campos correctamente.');
      return;
    }

    this.loading = true;
    this.error = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        console.log('LoginPage: Login response received:', response);
        console.log('LoginPage: Response keys:', Object.keys(response));
        console.log('LoginPage: access_token exists:', 'access_token' in response);
        console.log('LoginPage: token exists:', 'token' in response);
        // Verificar localStorage después de un pequeño delay
        setTimeout(() => {
          const token = localStorage.getItem('token');
          console.log('LoginPage: Token in localStorage after login:', token ? 'exists' : 'null');
        }, 100);
        console.log('Login exitoso:', response);
        // Redirigir al home (ruta correcta)
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Error en login:', error);
        console.log('Error status:', error.status);
        console.log('Error status type:', typeof error.status);
        console.log('Error name:', error.name);
        console.log('Error message:', error.message);
        console.log('Error completo:', JSON.stringify(error, null, 2));
        this.loading = false;

        // Lógica corregida: 401 y 400 son credenciales incorrectas, todo lo demás es error de conexión
        const isCredentialsError = error.status === 401 || error.status === 400;
        
        console.log('¿Es error de credenciales?', isCredentialsError);

        if (isCredentialsError) {
          // Credenciales incorrectas (401 y 400)
          console.log('Mostrando alerta de credenciales incorrectas');
          this.showAlert('error', 'Credenciales Incorrectas', 'El correo o la contraseña son incorrectos. Verifica tus datos e intenta nuevamente.');
          
          // También mostrar error en los inputs
          this.serverError = 'Credenciales incorrectas';
          
          // Marcar los campos como touched para mostrar los errores
          this.loginForm.get('email')?.markAsTouched();
          this.loginForm.get('password')?.markAsTouched();
        } else {
          // Cualquier otro error (0, 500, etc.) = error de conexión
          console.log('Mostrando alerta de error de conexión, status:', error.status);
          this.showAlert('warning', 'Error de Conexión', 'No se puede conectar con el servidor. Verifica tu conexión a internet o intenta más tarde.');
          
          // Limpiar errores de servidor para errores de conexión
          this.serverError = '';
        }

        // Forzar múltiples detecciones de cambios después de showAlert
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        
        requestAnimationFrame(() => {
          this.cdr.detectChanges();
          console.log('LoginPage: detectChanges post-showAlert en requestAnimationFrame');
        });
      },
      complete: () => {
        console.log('Login observable completado');
        this.loading = false;
      }
    });
  }

  showAlert(type: 'error' | 'warning' | 'info' | 'success', title: string, message: string): void {
    console.log('LoginPage: showAlert called', { type, title, message });
    
    this.alertType = type;
    this.alertTitle = title;
    this.alertMessage = message;
    this.alertVisible = true;
    
    console.log('LoginPage: after setting alertVisible:', this.alertVisible);
    
    // Forzar actualización inmediata con múltiples métodos
    this.cdr.markForCheck(); // Marcar para detección
    this.cdr.detectChanges(); // Forzar detección sincrónica
    
    // Usar requestAnimationFrame para asegurar actualización en el siguiente frame
    requestAnimationFrame(() => {
      this.cdr.detectChanges();
      console.log('LoginPage: detectChanges en requestAnimationFrame');
    });
    
    // Doble seguridad con setTimeout
    setTimeout(() => {
      this.cdr.detectChanges();
      console.log('LoginPage: detectChanges en setTimeout');
    }, 0);
    
    // Auto cerrar después de 5 segundos
    setTimeout(() => {
      this.alertVisible = false;
      this.cdr.detectChanges();
      console.log('LoginPage: auto-close alert');
    }, 5000);
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onMockLogin(): void {
    if (this.loginForm.invalid) {
      console.log('Formulario inválido para mock login:', this.loginForm.errors);
      this.showAlert('warning', 'Datos Inválidos', 'Por favor, completa todos los campos correctamente.');
      return;
    }

    this.loading = true;
    this.error = '';

    const { email, password } = this.loginForm.value;
    
    console.log('Usando login simulado con:', { email, password: '***' });

    this.authService.loginMock(email, password).subscribe({
      next: (response) => {
        console.log('Login simulado exitoso:', response);
        // Redirigir al home (ruta correcta)
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Error en login simulado:', error);
        this.error = error.message || 'Error en login simulado.';
        this.loading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('Login simulado observable completado');
        this.loading = false;
      }
    });
  }
}