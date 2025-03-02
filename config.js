// config.js
const config = {
  baseUrl: typeof window !== 'undefined' ? window.location.origin : process.env.BASE_URL || 'http://localhost:3000'
};

export default config;
