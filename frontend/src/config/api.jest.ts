// Jest-compatible API configuration
const API_BASE_URL = process.env.VITE_API_BASE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'http://ec2-13-51-199-205.eu-north-1.compute.amazonaws.com:8080/api' 
    : 'http://localhost:8080/api');

export { API_BASE_URL };
export default API_BASE_URL;
