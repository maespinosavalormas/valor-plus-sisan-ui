export interface User {
  id?: string;

  email: string;
  password?: string;

  firstName: string;
  lastName: string;
  middleName?: string;
  secondSurname?: string;

  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string | null;

  fullName?: string;
  userInfo: {
    birthdate: string;
    phone: string;
    address: string;
    cityId: string;
    provinceId: string;
    identificationTypeId: number;
    identificationNumber: string;
    avatar?: string;
  };
  roleIds?: string[]; 
  roles?: Array<{ id: string; name: string }>; // Para la respuesta
}
