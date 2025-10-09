const fetch = require('node-fetch');

// Example usage:
// (async () => {
//   const response = await fetch('https://trefle.io/api/v1/plants?token=YOUR_TREFLE_TOKEN');
//   const json = await response.json();
//   console.log(json);
// })();

class TrefleAPI {
  constructor() {
    this.baseURL = 'https://trefle.io/api/v1';
    this.apiToken = process.env.TREFLE_API_TOKEN;
    
    if (!this.apiToken) {
      throw new Error('TREFLE_API_TOKEN environment variable is required');
    }
  }

  // Get flowering plants
  async getPlants(options = {}) {
    console.log("🌱 TrefleAPI.getPlants() called! Options:", options);
    const response = await fetch(`https://trefle.io/api/v1/plants?token=${this.apiToken}`);
    const json = await response.json();
    console.log("🌱 TrefleAPI response received:", json);
    return json;
  }
}

module.exports = TrefleAPI;