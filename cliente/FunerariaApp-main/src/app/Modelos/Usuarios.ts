export interface Usuarios {
  userId: number;
  fullName: string;
  phone: string;
  email: string;
  isAdmin: boolean;
  password: string;
  RolID : number;
  NombreRol: string
}

export interface Roles {
  RolID: number;
  NombreRol: string;
}
