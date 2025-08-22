const API_BASE_URL = '/api/bt';

export interface ChurchManager {
  _id: string;
  churchName: string;
  churchAddress: string;
  churchPhone: string;
  managerName: string;
  managerPhone: string;
  managerEmail: string;
  participants?: number;
  status: 'pending' | 'approved' | 'rejected';
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface IndividualTeacher {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  churchName?: string;
  position?: string;
  experience?: string;
  certification?: string;
  motivation: string;
  status: 'pending' | 'approved' | 'rejected';
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface BTReceipt {
  _id: string;
  eventId: string;
  churchId: {
    mainId: string;
    subId: string;
  };
  churchName: string;
  managerName: string;
  managerPhone: string;
  partTotal: number;
  partStudent: number;
  partTeacher: number;
  partYM: number;
  costs: number;
  paymentMethod: 'card' | 'bank' | 'cash';
  paymentStatus: 'pending' | 'completed' | 'cancelled';
  paymentDate?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Church {
  _id: string;
  mainId: string;
  subId: string;
  name: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

class BTApi {
  async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
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
        throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('BT API request failed:', error);
      throw error;
    }
  }

  // Church Manager APIs
  async createChurchManager(churchData: Partial<ChurchManager>): Promise<ChurchManager> {
    const response = await this.request('/church-managers', {
      method: 'POST',
      body: JSON.stringify(churchData),
    });
    return response.data;
  }

  async getChurchManagers(params: any = {}): Promise<{
    data: ChurchManager[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.request(`/church-managers?${queryString}`);
    return response;
  }

  async getChurchManagerById(id: string): Promise<ChurchManager> {
    const response = await this.request(`/church-managers/${id}`);
    return response.data;
  }

  async updateChurchManagerStatus(
    id: string,
    status: string,
    eventId?: string,
    costs?: number,
    partTeacher?: number
  ): Promise<ChurchManager> {
    const body: any = { status };
    if (eventId) body.eventId = eventId;
    if (costs) body.costs = costs;
    if (partTeacher) body.partTeacher = partTeacher;

    const response = await this.request(`/church-managers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return response.data;
  }

  // Individual Teacher APIs
  async createIndividualTeacher(teacherData: Partial<IndividualTeacher>): Promise<IndividualTeacher> {
    const response = await this.request('/individual-teachers', {
      method: 'POST',
      body: JSON.stringify(teacherData),
    });
    return response.data;
  }

  async getIndividualTeachers(params: any = {}): Promise<{
    data: IndividualTeacher[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.request(`/individual-teachers?${queryString}`);
    return response;
  }

  async getIndividualTeacherById(id: string): Promise<IndividualTeacher> {
    const response = await this.request(`/individual-teachers/${id}`);
    return response.data;
  }

  async updateIndividualTeacherStatus(id: string, status: string): Promise<IndividualTeacher> {
    const response = await this.request(`/individual-teachers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response.data;
  }

  // BT Receipt APIs
  async getBTReceipts(params: any = {}): Promise<{
    data: BTReceipt[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.request(`/receipts?${queryString}`);
    return response;
  }

  async getBTReceiptById(id: string): Promise<BTReceipt> {
    const response = await this.request(`/receipts/${id}`);
    return response.data;
  }

  async getBTReceiptByChurchManager(churchManagerId: string): Promise<BTReceipt[]> {
    const response = await this.request(`/church-managers/${churchManagerId}/receipts`);
    return response.data;
  }

  // Church search
  async searchChurches(query: string): Promise<Church[]> {
    const response = await this.request(`/churches/search?query=${encodeURIComponent(query)}`);
    return response.data;
  }

  // Statistics
  async getBTStatistics(): Promise<any> {
    const response = await this.request('/statistics');
    return response.data;
  }
}

export const btApi = new BTApi();
export default btApi;
