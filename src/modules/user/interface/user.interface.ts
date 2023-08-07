export interface IUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
  isActive: boolean;
  lastLoginTime: number;
  password: string;
}
