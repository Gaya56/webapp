require('dotenv').config({ path: '../../.env' });
console.log('✅ BRAVE_SEARCH_API_KEY available:', !!process.env.BRAVE_SEARCH_API_KEY);
console.log('Key ends with:', process.env.BRAVE_SEARCH_API_KEY ? process.env.BRAVE_SEARCH_API_KEY.slice(-4) : 'NOT_FOUND');
