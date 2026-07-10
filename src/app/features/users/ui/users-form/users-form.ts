import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialog,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { User } from '../../../../common/models/user.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';
import { UsersService } from '../../data-access/services/users-service';
import { UsersMasterDataService, Province, City, IdentificationType } from '../../data-access/services/users-master-data.service';

@Component({
  standalone: true,
  selector: 'app-users-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  providers: [MatDialog],
  templateUrl: './users-form.html',
  styleUrls: ['./users-form.scss'],
})
export class UsersFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  loading = false;
  error: string | null = null;

  // Opciones para los select (cargadas desde API)
  provinces: Province[] = [];
  cities: City[] = [];
  identificationTypes: IdentificationType[] = [];
  roles = ['USER', 'ADMIN'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UsersFormComponent>,
    private dialog: MatDialog,
    private usersService: UsersService,
    private usersMasterDataService: UsersMasterDataService,
    @Inject(MAT_DIALOG_DATA) public data: User | null
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      middleName: ['', Validators.maxLength(100)],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      secondSurname: ['', Validators.maxLength(100)],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      userInfo: this.fb.group({
        birthdate: ['', [Validators.required]],
        phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s-]+$/)]],
        address: ['', [Validators.required, Validators.maxLength(200)]],
        cityId: ['', [Validators.required]],
        provinceId: ['', [Validators.required]],
        identificationTypeId: ['', [Validators.required]],
        identificationNumber: ['', [Validators.required, Validators.maxLength(20)]],
        avatar: [''],
      }),
      roleIds: [[], [Validators.required]],
    });

    if (data) {
      this.isEdit = true;
      this.loadUserData(data);
    }
  }

  ngOnInit(): void {
    // Cargar datos maestros desde la API
    this.loadMasterData();

    // Listen for province changes to load cities
    this.form.get('userInfo.provinceId')?.valueChanges.subscribe((provinceId) => {
      if (provinceId) {
        this.loadCities(provinceId);
      } else {
        this.cities = [];
        this.form.get('userInfo.cityId')?.reset();
      }
    });
  }

  private loadUserData(user: User): void {
    // Extraer los roles como array
    const roleIds = user.roles && user.roles.length > 0
      ? user.roles.map(role => role.name)
      : ['USER'];

    // Extraer el ID de la provincia (viene como string, convertir a número)
    const provinceId = user.userInfo?.provinceId ? parseInt(user.userInfo.provinceId) : '';

    // Extraer el ID de la ciudad (viene como string, convertir a número)
    const cityId = user.userInfo?.cityId ? parseInt(user.userInfo.cityId) : '';

    // Cargar ciudades si hay provincia
    if (provinceId) {
      this.loadCities(provinceId);
    }

    // Formatear fecha de nacimiento si existe
    const birthdate = user.userInfo?.birthdate
      ? new Date(user.userInfo.birthdate).toISOString().split('T')[0]
      : '';

    // Hacer patch del formulario con los valores transformados
    this.form.patchValue({
      firstName: user.firstName || '',
      middleName: user.middleName || '',
      lastName: user.lastName || '',
      secondSurname: user.secondSurname || '',
      email: user.email || '',
      roleIds: roleIds,
      userInfo: {
        birthdate: birthdate,
        phone: user.userInfo?.phone || '',
        address: user.userInfo?.address || '',
        cityId: cityId,
        provinceId: provinceId,
        identificationTypeId: user.userInfo?.identificationTypeId || '',
        identificationNumber: user.userInfo?.identificationNumber || '',
        avatar: user.userInfo?.avatar || '',
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;
    const formValue = this.form.value;
    console.log('Form value:', formValue);
    const userData = {
      ...formValue,
    };
    console.log('Payload a enviar:', JSON.stringify(userData, null, 2));

    const operation = this.isEdit
      ? this.usersService.updateUser(this.data!.id!, userData)
      : this.usersService.createUser(userData);

    operation.subscribe({
      next: (response) => {
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Error al guardar el usuario:', error);
        console.error('Error details:', error.error);
        this.error = 'Error al guardar el usuario. Por favor, intente nuevamente.';
        this.loading = false;
      },
    });
  }

  showCancelConfirmation(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Cancelar',
        message: '¿Estás seguro de que deseas cancelar? Se perderán los cambios no guardados.',
        confirmText: 'Sí, cancelar',
        cancelText: 'No, continuar',
        type: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.onCancel();
      }
    });
  }

  showSaveConfirmation(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const action = this.isEdit ? 'actualizar' : 'guardar';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar acción',
        message: `¿Estás seguro de que deseas ${action} este usuario?`,
        confirmText: `Sí, ${action}`,
        cancelText: 'No',
        type: 'success'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.onSubmit();
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private loadMasterData(): void {
    // Cargar provincias
    this.usersMasterDataService.getProvinces().subscribe(provinces => {
      this.provinces = provinces;
    });

    // Cargar tipos de identificación
    this.usersMasterDataService.getIdentificationTypes().subscribe(types => {
      this.identificationTypes = types;
    });
  }

  private loadCities(provinceId: number): void {
    this.usersMasterDataService.getCitiesByProvince(provinceId).subscribe(cities => {
      this.cities = cities;
    });
  }

  confirmDelete(): void {
    if (!this.data?.id) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Usuario',
        message: '¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.',
      },
    });
    
    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.data?.id) {
        this.loading = true;
        this.usersService.deleteUser(this.data.id).subscribe({
          next: () => {
            this.dialogRef.close({ deleted: true });
          },
          error: (error) => {
            console.error('Error al eliminar el usuario:', error);
            this.error = 'Error al eliminar el usuario. Por favor, intente nuevamente.';
            this.loading = false;
          },
        });
      }
    });
  }
}