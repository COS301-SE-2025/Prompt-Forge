// API Configuration
// In development: uses local Spring Boot backend (localhost:8080)
// In production: uses deployed AWS API Gateway
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV 
    ? 'http://localhost:8080/api'  // Local development fallback
    : 'https://d898wq8ttyuze.cloudfront.net/api'  // Production fallback
  );

console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🔧 Environment:', import.meta.env.DEV ? 'development' : 'production');

export { API_BASE_URL };
export default API_BASE_URL;