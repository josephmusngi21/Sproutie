const TREFLE_CONFIG = {
  baseURL: 'https://trefle.io/api/v1',
  apiKey: process.env.TREFLE_API_KEY,
  timeout: 10000,
  rateLimit: {
    requestsPerMinute: 120
  }
};

module.exports = TREFLE_CONFIG;