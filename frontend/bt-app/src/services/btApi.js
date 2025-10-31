const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3004';

class BTApi {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}/api/bt${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Church Manager APIs
  async createChurchManager(churchData) {
    return this.request('/church-managers', {
      method: 'POST',
      body: churchData,
    });
  }

  async getChurchManagers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/church-managers?${queryString}`);
  }

  async getChurchManagerById(id) {
    return this.request(`/church-managers/${id}`);
  }

  async updateChurchManagerStatus(id, status) {
    return this.request(`/church-managers/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  // Individual Teacher APIs
  async createIndividualTeacher(teacherData) {
    return this.request('/individual-teachers', {
      method: 'POST',
      body: teacherData,
    });
  }

  async getIndividualTeachers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/individual-teachers?${queryString}`);
  }

  async getIndividualTeacherById(id) {
    return this.request(`/individual-teachers/${id}`);
  }

  async updateIndividualTeacherStatus(id, status) {
    return this.request(`/individual-teachers/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  // Statistics
  async getBTStatistics() {
    return this.request('/statistics');
  }
}

export default new BTApi();
