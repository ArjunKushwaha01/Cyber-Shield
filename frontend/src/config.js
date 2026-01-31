// Centralized API Configuration
// Vercel/Production: Uses VITE_API_URL env var
// Local Development: Falls back to localhost
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
