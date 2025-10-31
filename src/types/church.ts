export interface Church {
  _id?: string;
  id: string;
  mainId: string;
  subId: string;
  name: string;
  churchName?: string;
  location: string;
  region?: string;
  phone?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  registrationDate?: string;
  status?: 'active' | 'inactive';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChurchResponse {
  success: boolean;
  data: Church[];
  count?: number;
  error?: string;
}

export interface ChurchSearchParams {
  churchName?: string;
  region?: string;
  status?: 'active' | 'inactive';
  page?: number;
  pageSize?: number;
  getAllResults?: boolean;
}
