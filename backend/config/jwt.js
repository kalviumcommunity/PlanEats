require('dotenv').config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'fallback_jwt_secret_key_for_development',
  jwtExpiration: process.env.JWT_EXPIRATION || '7d',
  refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION || '30d'
};