export const Constants = {
  JWT_TOKEN_VALIDITY: '24h',
  USER: 'user',
  ADMIN: 'admin'
};

export const optConfig = {
  otpLength: 6,
  optDigits: '0123456789',
  otpExpiresTimes: 5 // 5 minutes
};

export const csrfExcludeRoutes = ['/api/v1/user/logout', '/api/v1/user', '/api/v1/admin/login'];
