import { Role } from '../enums/role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: Role;
  employeeCode: string;
}

export interface AuthUser {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface UserProfile extends AuthUser {
  position: string | null;
  department: string | null;
}
