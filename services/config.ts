// Configuration loaded from environment variables
// See .env.local for configuration options
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

console.log('🔧 Config loaded - API_BASE_URL:', API_BASE_URL);

export const DEFAULT_LOW_STOCK_THRESHOLD = parseInt(process.env.EXPO_PUBLIC_DEFAULT_LOW_STOCK_THRESHOLD || '5', 10);
