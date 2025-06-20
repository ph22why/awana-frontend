// Environment-based configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Backend configuration
let backendUrl;

if (isDevelopment) {
  // Development environment - use environment variable or default
  backendUrl = process.env.REACT_APP_BACKEND_HOST || 'http://localhost:8080';
} else if (isProduction) {
  // Production environment 
  backendUrl = process.env.REACT_APP_BACKEND_HOST || 'https://awanaevent.com:8080';
} else {
  // Fallback
  backendUrl = 'http://localhost:8080';
}

// Full backend URL
export const BACKEND_URL = backendUrl;

// Legacy export for backward compatibility
export default backendUrl;
