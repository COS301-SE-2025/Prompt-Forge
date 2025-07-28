const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'http://ec2-13-51-199-205.eu-north-1.compute.amazonaws.com:8080/api' 
    : 'http://localhost:8080/api');

export { API_BASE_URL };

// Update your existing services to use this
export default API_BASE_URL;