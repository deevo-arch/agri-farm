/**
 * API service for making requests to Flask/Supabase backend.
 * All auth tokens are stored in localStorage as 'agri_access_token'.
 */
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return `http://${window.location.hostname}:5000/api`;
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

// ── Interfaces ──────────────────────────────────────────────
export interface OverviewData {
  total_farmers: number;
  total_veterinarians: number;
  total_animals: number;
  total_treatments: number;
  pending_verifications: number;
}

export interface Farmer {
  id: string;
  name: string;
  email?: string;
  mobile?: string;
  is_verified: boolean;
  created_at?: string;
  user_id?: string;
}

export type FarmerAnimalResponse = Animal;

export interface Vet {
  id: string;
  name: string;
  email?: string;
  mobile?: string;
  specialization?: string[];
  is_verified: boolean;
  created_at?: string;
  user_id?: string;
}

export interface Animal {
  id: string;
  species: string;
  farmer_id: string;
  breed?: string;
  tag_number?: string;
  age?: number;
  gender?: string;
  created_at?: string;
}

export interface Treatment {
  id: string;
  treatment_start_date: string;
  medicines?: any[];
  is_flagged_violation: boolean;
  farmer_id?: string;
  vet_id?: string;
  animal_id?: string;
  status?: string;
  diagnosis?: string;
  symptoms?: string[];
  notes?: string;
}

export interface MedicineUsage {
  medicine: string;
  count: number;
}

export interface LineDataPoint {
  month: string;
  treatments: number;
}

export interface BarDataPoint {
  species: string;
  count: number;
}

export interface PieDataPoint {
  name: string;
  value: number;
}

export interface ComplianceDataPoint {
  month: string;
  compliant: number;
  nonCompliant: number;
}

export interface VetActivityDataPoint {
  day: string;
  visits: number;
}

export interface SimplifiedDashboard {
  overview: OverviewData;
  today_treatments: number;
  violations_count: number;
  farm_safety: { safe: number; unsafe: number };
  charts: {
    treatment_trends: LineDataPoint[];
    animals_by_species: BarDataPoint[];
    farm_safety_status: PieDataPoint[];
  };
}

export interface Violation {
  id: string;
  farmer_id?: string;
  animal_id?: string;
  treatment_start_date?: string;
  reason?: string;
  status?: string;
}

// ── Auth Headers ────────────────────────────────────────────
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('agri_access_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// ── Response Handler ────────────────────────────────────────
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = `API request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  const result = await response.json();
  if (result && typeof result === 'object' && 'data' in result) {
    return result.data;
  }
  return result;
};

// ── Dashboard API ───────────────────────────────────────────
export const dashboardAPI = {
  test: async (): Promise<boolean> => {
    try {
      return await testApiConnection();
    } catch {
      return false;
    }
  },

  testApiConnectionDetailed: async (): Promise<any> => {
    return await testApiConnectionDetailed();
  },

  getOverview: async (): Promise<OverviewData> => {
    // Build overview from individual counts
    try {
      const [farmers, vets, animals, treatments] = await Promise.all([
        dashboardAPI.getFarmers(),
        dashboardAPI.getVets(),
        dashboardAPI.getAnimals(),
        dashboardAPI.getTreatments()
      ]);
      return {
        total_farmers: farmers.length,
        total_veterinarians: vets.length,
        total_animals: animals.length,
        total_treatments: treatments.length,
        pending_verifications: 0
      };
    } catch {
      return { total_farmers: 0, total_veterinarians: 0, total_animals: 0, total_treatments: 0, pending_verifications: 0 };
    }
  },

  getFarmers: async (): Promise<Farmer[]> => {
    const response = await fetch(`${API_BASE_URL}/farmers/`, { headers: getAuthHeaders() });
    return handleResponse<Farmer[]>(response);
  },

  getVets: async (): Promise<Vet[]> => {
    const response = await fetch(`${API_BASE_URL}/vets/`, { headers: getAuthHeaders() });
    return handleResponse<Vet[]>(response);
  },

  getAnimals: async (): Promise<Animal[]> => {
    const response = await fetch(`${API_BASE_URL}/animals/`, { headers: getAuthHeaders() });
    return handleResponse<Animal[]>(response);
  },

  getTreatments: async (filters: Record<string, string> = {}): Promise<Treatment[]> => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/treatments/?${params}`, { headers: getAuthHeaders() });
    return handleResponse<Treatment[]>(response);
  },

  getViolations: async (): Promise<Violation[]> => {
    // Filter treatments where is_flagged_violation is true
    try {
      const treatments = await dashboardAPI.getTreatments();
      return treatments.filter(t => t.is_flagged_violation).map(t => ({
        id: t.id,
        farmer_id: t.farmer_id,
        animal_id: t.animal_id,
        treatment_start_date: t.treatment_start_date,
        status: t.status
      }));
    } catch {
      return [];
    }
  },

  getAnimalsByFarmer: async (farmerId: string): Promise<Animal[]> => {
    const response = await fetch(`${API_BASE_URL}/animals/?farmer_id=${farmerId}`, { headers: getAuthHeaders() });
    return handleResponse<Animal[]>(response);
  },

  getSimplifiedDashboard: async (): Promise<SimplifiedDashboard> => {
    // Build simplified dashboard from real data
    try {
      const [overview, treatments, animals, farmers] = await Promise.all([
        dashboardAPI.getOverview(),
        dashboardAPI.getTreatments(),
        dashboardAPI.getAnimals(),
        dashboardAPI.getFarmers()
      ]);

      const violations = treatments.filter(t => t.is_flagged_violation);

      return {
        overview,
        today_treatments: treatments.filter(t => {
          const d = new Date(t.treatment_start_date);
          const today = new Date();
          return d.toDateString() === today.toDateString();
        }).length,
        violations_count: violations.length,
        farm_safety: {
          safe: Math.max(0, farmers.length - violations.length),
          unsafe: violations.length
        },
        charts: {
          treatment_trends: generateMockData.lineData(treatments),
          animals_by_species: generateMockData.barData(animals),
          farm_safety_status: generateMockData.pieData(farmers, violations)
        }
      };
    } catch {
      return generateMockData.mockDashboard();
    }
  },

  getTreatmentTrends: async (): Promise<LineDataPoint[]> => {
    try {
      const treatments = await dashboardAPI.getTreatments();
      return generateMockData.lineData(treatments);
    } catch {
      return generateMockData.lineData([]);
    }
  },

  getAnimalsBySpecies: async (): Promise<BarDataPoint[]> => {
    try {
      const animals = await dashboardAPI.getAnimals();
      return generateMockData.barData(animals);
    } catch {
      return generateMockData.barData([]);
    }
  },

  getFarmSafetyStatus: async (): Promise<PieDataPoint[]> => {
    try {
      const [farmers, violations] = await Promise.all([
        dashboardAPI.getFarmers(),
        dashboardAPI.getViolations()
      ]);
      return generateMockData.pieData(farmers, violations);
    } catch {
      return generateMockData.pieData([], []);
    }
  },

  getComplianceData: async (): Promise<ComplianceDataPoint[]> => {
    return generateMockData.complianceData();
  },

  getVetActivity: async (): Promise<VetActivityDataPoint[]> => {
    return generateMockData.vetActivityData();
  },

  getMedicineUsage: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines/`, { headers: getAuthHeaders() });
      return await handleResponse(response);
    } catch {
      return [];
    }
  },

  getDailyTreatments: async (): Promise<{ today_treatments: number }> => {
    try {
      const treatments = await dashboardAPI.getTreatments();
      const today = new Date().toDateString();
      const count = treatments.filter(t => new Date(t.treatment_start_date).toDateString() === today).length;
      return { today_treatments: count };
    } catch {
      return { today_treatments: 0 };
    }
  },

  getHealth: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/health`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
};

// ── Verification API ────────────────────────────────────────
export const verificationAPI = {
  uploadDocument: async (file: File, bucket: 'kyc-farmer' | 'kyc-vet' = 'kyc-farmer'): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);

    const token = localStorage.getItem('agri_access_token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/verification/upload-doc`, {
      method: 'POST',
      headers,
      body: formData
    });

    return handleResponse(response);
  },

  submit: async (formData: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/verification/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ form_data: formData })
    });
    return handleResponse(response);
  },

  getMyStatus: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/verification/my-status`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  getPending: async (role?: string): Promise<any[]> => {
    const url = role
      ? `${API_BASE_URL}/verification/pending?role=${role}`
      : `${API_BASE_URL}/verification/pending`;
    const response = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse<any[]>(response);
  },

  getAll: async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/verification/all`, { headers: getAuthHeaders() });
    return handleResponse<any[]>(response);
  },

  approve: async (requestId: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/verification/${requestId}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  reject: async (requestId: string, reason: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/verification/${requestId}/reject`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    return handleResponse(response);
  },
};

// ── Mock Data Generators (fallback) ─────────────────────────
export const generateMockData = {
  lineData: (treatments: Treatment[]): LineDataPoint[] => {
    if (!treatments?.length) {
      return [
        { month: "Jan", treatments: 12 }, { month: "Feb", treatments: 18 },
        { month: "Mar", treatments: 25 }, { month: "Apr", treatments: 20 },
        { month: "May", treatments: 30 }, { month: "Jun", treatments: 22 },
      ];
    }
    const monthMap: Record<string, number> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    treatments.forEach(t => {
      if (t.treatment_start_date) {
        const m = monthNames[new Date(t.treatment_start_date).getMonth()];
        monthMap[m] = (monthMap[m] || 0) + 1;
      }
    });
    return monthNames.slice(0, 6).map(m => ({ month: m, treatments: monthMap[m] || 0 }));
  },

  barData: (animals: Animal[]): BarDataPoint[] => {
    if (!animals?.length) {
      return [
        { species: "Cattle", count: 120 }, { species: "Goat", count: 70 },
        { species: "Buffalo", count: 55 }, { species: "Sheep", count: 45 },
      ];
    }
    const sc: Record<string, number> = {};
    animals.forEach(a => { sc[a.species || 'Unknown'] = (sc[a.species || 'Unknown'] || 0) + 1; });
    return Object.entries(sc).map(([species, count]) => ({ species, count })).sort((a, b) => b.count - a.count);
  },

  pieData: (farmers: Farmer[], violations: Violation[] = []): PieDataPoint[] => {
    if (!farmers?.length) return [{ name: "Safe", value: 82 }, { name: "Under Withdrawal", value: 18 }];
    const unsafeCount = violations.length;
    const safeCount = Math.max(0, farmers.length - unsafeCount);
    return [
      { name: 'Safe', value: Math.round((safeCount / farmers.length) * 100) },
      { name: 'Under Withdrawal', value: Math.round((unsafeCount / farmers.length) * 100) }
    ];
  },

  complianceData: (): ComplianceDataPoint[] => [
    { month: "Jan", compliant: 85, nonCompliant: 15 },
    { month: "Feb", compliant: 88, nonCompliant: 12 },
    { month: "Mar", compliant: 90, nonCompliant: 10 },
    { month: "Apr", compliant: 87, nonCompliant: 13 },
    { month: "May", compliant: 92, nonCompliant: 8 },
    { month: "Jun", compliant: 94, nonCompliant: 6 },
  ],

  vetActivityData: (): VetActivityDataPoint[] => [
    { day: "Mon", visits: 12 }, { day: "Tue", visits: 15 },
    { day: "Wed", visits: 18 }, { day: "Thu", visits: 14 },
    { day: "Fri", visits: 20 }, { day: "Sat", visits: 10 }, { day: "Sun", visits: 8 },
  ],

  mockDashboard: (): SimplifiedDashboard => ({
    overview: { total_farmers: 0, total_veterinarians: 0, total_animals: 0, total_treatments: 0, pending_verifications: 0 },
    today_treatments: 0,
    violations_count: 0,
    farm_safety: { safe: 0, unsafe: 0 },
    charts: {
      treatment_trends: [
        { month: "Jan", treatments: 0 }, { month: "Feb", treatments: 0 },
        { month: "Mar", treatments: 0 }, { month: "Apr", treatments: 0 },
        { month: "May", treatments: 0 }, { month: "Jun", treatments: 0 },
      ],
      animals_by_species: [],
      farm_safety_status: [{ name: "Safe", value: 100 }, { name: "Under Withdrawal", value: 0 }]
    }
  }),
};

// ── Connection Tests ────────────────────────────────────────
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { headers: getAuthHeaders() });
    return response.ok;
  } catch {
    return false;
  }
};

export const testApiConnectionDetailed = async (): Promise<{ connected: boolean; message: string; data?: any }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { headers: getAuthHeaders() });
    const data = await response.json();
    return { connected: response.ok, message: response.ok ? 'Connected to Supabase Backend' : 'Connection failed', data };
  } catch (e: any) {
    return { connected: false, message: e.message || 'Connection error' };
  }
};

export const healthCheck = async () => {
  const response = await fetch(`${API_BASE_URL}/health`, { headers: getAuthHeaders() });
  return handleResponse(response);
};