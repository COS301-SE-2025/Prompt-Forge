const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'http://ec2-13-51-199-205.eu-north-1.compute.amazonaws.com/api' 
    : 'http://localhost:8080/api');

export { API_BASE_URL };

// Update your existing services to use this
export default API_BASE_URL;