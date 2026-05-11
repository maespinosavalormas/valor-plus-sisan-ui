export interface User {
  id: string | number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
