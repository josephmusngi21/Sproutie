// Simplified API service for backend communication
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.17:3000';

interface UserData {
  firebaseUid: string;
  email: string;
  displayName?: string;
  emailVerified?: boolean;
}

class ApiService {
  private async request(endpoint: string, options: any = {}) {
    const url = `${API_URL}${endpoint}`;
    
    try {
      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // User methods
  async createUser(userData: UserData) {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUser(firebaseUid: string) {
    return this.request(`/api/users/${firebaseUid}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();