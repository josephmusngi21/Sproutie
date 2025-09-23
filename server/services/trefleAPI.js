const fetch = require('node-fetch');

class TrefleAPI {
  constructor() {
    this.baseURL = 'https://trefle.io/api/v1';
    this.apiToken = process.env.TREFLE_API_TOKEN;
    
    if (!this.apiToken) {
      throw new Error('TREFLE_API_TOKEN environment variable is required');
    }
  }

  // Helper method to make authenticated requests to Trefle API
  async makeRequest(endpoint, params = {}) {
    try {
      const url = new URL(`${this.baseURL}${endpoint}`);
      
      // Add API token to params
      params.token = this.apiToken;
      
      // Add query parameters
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });

      console.log(`Making request to: ${url.toString()}`);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Trefle API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Trefle API request failed:', error);
      throw error;
    }
  }

  // Search plants by name
  async searchPlants(query, options = {}) {
    const params = {
      q: query,
      page: options.page || 1,
      ...options
    };
    
    return await this.makeRequest('/plants/search', params);
  }

  // Get all plants with filtering
  async getPlants(options = {}) {
    const params = {
      page: options.page || 1,
      'filter[common_name]': options.commonName,
      'filter[family]': options.family,
      'filter[genus]': options.genus,
      'filter[edible]': options.edible,
      'filter[vegetable]': options.vegetable,
      ...options
    };
    
    return await this.makeRequest('/plants', params);
  }

  // Get specific plant by ID
  async getPlantById(plantId) {
    return await this.makeRequest(`/plants/${plantId}`);
  }

  // Get plant species
  async getPlantSpecies(plantId, options = {}) {
    const params = {
      page: options.page || 1,
      ...options
    };
    
    return await this.makeRequest(`/plants/${plantId}/species`, params);
  }

  // Get specific species by ID
  async getSpeciesById(speciesId) {
    return await this.makeRequest(`/species/${speciesId}`);
  }

  // Get plant families
  async getFamilies(options = {}) {
    const params = {
      page: options.page || 1,
      ...options
    };
    
    return await this.makeRequest('/families', params);
  }

  // Get plants by family
  async getPlantsByFamily(familySlug, options = {}) {
    const params = {
      page: options.page || 1,
      ...options
    };
    
    return await this.makeRequest(`/families/${familySlug}/plants`, params);
  }

  // Get plant genera
  async getGenera(options = {}) {
    const params = {
      page: options.page || 1,
      ...options
    };
    
    return await this.makeRequest('/genus', params);
  }

  // Get plants by genus
  async getPlantsByGenus(genusSlug, options = {}) {
    const params = {
      page: options.page || 1,
      ...options
    };
    
    return await this.makeRequest(`/genus/${genusSlug}/plants`, params);
  }

  // Get edible plants
  async getEdiblePlants(options = {}) {
    return await this.getPlants({
      'filter[edible]': true,
      ...options
    });
  }

  // Get vegetable plants
  async getVegetablePlants(options = {}) {
    return await this.getPlants({
      'filter[vegetable]': true,
      ...options
    });
  }

  // Get flowering plants
  async getFloweringPlants(options = {}) {
    return await this.getPlants({
      'filter[flower_conspicuous]': true,
      ...options
    });
  }
}

module.exports = TrefleAPI;