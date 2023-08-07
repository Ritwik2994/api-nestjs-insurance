export interface IAuthToken {
  userId: string;
  authToken: string;
  refreshToken: string;
  isActive: boolean;
}
