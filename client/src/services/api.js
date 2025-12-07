import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error.response?.data || error.message);
      }
    );
  }

  // Auth APIs
  async login(email, password) {
    return this.api.post('/client-users/login', { email, password });
  }

  async changePassword(oldPassword, newPassword) {
    // Backend expects 'currentPassword' not 'oldPassword'
    return this.api.post('/client-users/change-password', { 
      currentPassword: oldPassword, 
      newPassword 
    });
  }

  // CameraTrap APIs
  async getCameraTraps() {
    return this.api.get('/camera-traps');
  }

  async getCameraTrap(trapId) {
    return this.api.get(`/camera-traps/${trapId}`);
  }

  async updateCameraTrap(trapId, data) {
    return this.api.put(`/camera-traps/${trapId}`, data);
  }

  async toggleCameraTrapStatus(trapId) {
    return this.api.patch(`/camera-traps/${trapId}/toggle`);
  }

  // Client User APIs
  async getClientUsers() {
    return this.api.get('/client-users');
  }

  async addClientUser(data) {
    return this.api.post('/client-users', data);
  }

  async updateClientUser(userId, data) {
    return this.api.put(`/client-users/${userId}`, data);
  }

  async deleteClientUser(userId) {
    return this.api.delete(`/client-users/${userId}`);
  }

  async toggleClientUserStatus(userId) {
    return this.api.patch(`/client-users/${userId}/toggle`);
  }

  // Company APIs
  async getCompanyInfo(companyId) {
    return this.api.get(`/onboard/client-company/${companyId}`);
  }

  async updateCompanyInfo(companyId, data) {
    // Map 'phone' to 'mobile' for backend compatibility
    const mappedData = {
      ...data,
      mobile: data.phone,
    };
    delete mappedData.phone;
    return this.api.put(`/onboard/client-company/${companyId}`, mappedData);
  }

  // Species of Interest APIs
  async getSupportedSpecies() {
    return this.api.get('/species-of-interest/supported');
  }

  async getSpeciesOfInterest() {
    return this.api.get('/species-of-interest');
  }

  async addSpeciesOfInterest(data) {
    return this.api.post('/species-of-interest', data);
  }

  async updateSpeciesOfInterest(id, data) {
    return this.api.put(`/species-of-interest/${id}`, data);
  }

  async deleteSpeciesOfInterest(id) {
    return this.api.delete(`/species-of-interest/${id}`);
  }

  async toggleSpeciesOfInterest(id) {
    return this.api.patch(`/species-of-interest/${id}/toggle`);
  }

  // Incident APIs (for client users)
  async getLatestIncidents() {
    return this.api.get('/client/incidents/latest');
  }
}

export default new ApiService();
