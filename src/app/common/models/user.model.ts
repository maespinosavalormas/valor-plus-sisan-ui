export interface Role {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  permissions?: string[];
}

export interface UserInfo {
  birthdate: string;
  phone: string;
  address: string;
  cityId: string;
  provinceId: string;
  postalCode?: string;
  identificationTypeId?: number;
  identificationNumber?: string;
  avatar?: string;
}

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
  userInfo?: UserInfo;
  roleIds?: string[];
  roles?: Role[]; // Para la respuesta
}
