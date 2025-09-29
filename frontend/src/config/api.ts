// API Configuration
// In development: uses local Spring Boot backend (localhost:8080)
// In production: uses deployed AWS API Gateway
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV 
    ? 'http://localhost:8080/api'  // Local development fallback
    : 'https://d898wq8ttyuze.cloudfront.net/api'  // Production fallback
  );


export { API_BASE_URL };
export default API_BASE_URL;