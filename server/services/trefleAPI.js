const fetch = require('node-fetch');

class TrefleAPI {
  constructor() {
    this.baseURL = 'https://trefle.io/api/v1';
    this.apiToken = process.env.TREFLE_API_TOKEN;
    
    if (!this.apiToken) {
      throw new Error('TREFLE_API_TOKEN environment variable is required');
    }
  }

  async _fetch(endpoint) {
    const url = `${this.baseURL}${endpoint}${endpoint.includes('?') ? '&' : '?'}token=${this.apiToken}`;
    const response = await fetch(url);
    return response.json();
  }

  async getPlants() {
    return this._fetch('/plants');
  }

  async searchPlants(query) {
    return this._fetch(`/plants/search?q=${encodeURIComponent(query)}`);
  }
}

module.exports = TrefleAPI;