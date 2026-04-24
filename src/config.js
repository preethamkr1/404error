export const SERVER_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : window.location.origin;

export const API_BASE_URL = `${SERVER_URL}/api/files`; 