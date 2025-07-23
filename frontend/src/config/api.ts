const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://your-ec2-domain.com/api' 
    : 'http://localhost:8080/api');

export { API_BASE_URL };

// Update your existing services to use this
export default API_BASE_URL;