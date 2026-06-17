export type UserRole = 'ADMIN' | 'CLIENTE';

export interface JWTPayload {
  id: number;
  email: string;
  role: UserRole;
}
