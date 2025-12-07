import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
});

// API service object with all your endpoints
export const apiService = {
  // Auth endpoints
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  // User endpoints
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateUserProfile: async (userId, profileData) => {
    const response = await api.put(`/users/${userId}`, profileData);
    return response.data;
  },

  changePassword: async (userId, currentPassword, newPassword) => {
    const response = await api.post(`/users/${userId}/change-password`, {
      current_password: currentPassword,
      new_password: newPassword
    });
    return response.data;
  },

  deleteAccount: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  // Input endpoints
  createOrUpdateInputs: async (inputData) => {
    const response = await api.post('/inputs', inputData);
    return response.data;
  },

  getInputs: async (userId) => {
    const response = await api.get(`/inputs/${userId}`);
    return response.data;
  },

  // Calculation endpoints
  calculateYearData: async (userId) => {
    const response = await api.post(`/calculate-yr-data/${userId}`);
    return response.data;
  },


  // Data retrieval endpoints
  getRothConversions: async (runId) => {
    const response = await api.get(`/roth_conversions/${runId}`);
    return response.data;
  },

  getRothConversionsParts: async (runId) => {
    const response = await api.get(`/roth_conversions_parts/${runId}`);
    return response.data;
  },

  getRetireYearData: async (runId) => {
    const response = await api.get(`/retire_yr_data/${runId}`);
    return response.data;
  },

  getDistributionSchedule: async (runId) => {
    const response = await api.get(`/distribution_schedule/${runId}`);
    return response.data;
  },

  // Combined operations
  runFullCalculation: async (userId) => {
    try {
      console.log('Starting full calculation for user:', userId);

      // Single call now does both calculations
      const yrDataResponse = await apiService.calculateYearData(userId);
      console.log('Full calculation completed:', yrDataResponse);

      const newRunId = yrDataResponse.run_id;

      // Fetch all the results including distribution schedule
      const [conversions, parts, retireYearData] = await Promise.all([
        apiService.getRothConversions(newRunId),
        apiService.getRothConversionsParts(newRunId),
        apiService.getRetireYearData(newRunId)
      ]);

      return {
        runId: newRunId,
        conversions,
        parts,
        retireYearData,
        recordsCreated: yrDataResponse.records_created,
        calcCount: yrDataResponse.calc_count,
        subscriptionStatus: yrDataResponse.subscription_status,
        distribution: yrDataResponse.distribution,
        annuity_factor_multiple: yrDataResponse.annuity_factor_multiple,
        base_duration: yrDataResponse.base_duration
      };
    } catch (error) {
      console.error('Full calculation failed:', error);
      throw new Error(`Calculation failed: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Rating endpoints
  submitRating: async (ratingData) => {
    const response = await api.post('/ratings', ratingData);
    return response.data;
  },

  getRatingsSummary: async (userId = null) => {
    const url = userId ? `/ratings/summary?user_id=${userId}` : '/ratings/summary';
    const response = await api.get(url);
    return response.data;
  },

  // Subscription endpoints
  getPriceIds: async () => {
    const response = await api.get('/stripe/price-ids');
    return response.data;
  },

  selectFreePlan: async (userId) => {
    const response = await api.post(`/users/${userId}/select-free`);
    return response.data;
  },

  getSubscriptionStatus: async (userId) => {
    const response = await api.get(`/users/${userId}/subscription-status`);
    return response.data;
  },

  createCheckoutSession: async (userId, priceId) => {
    const response = await api.post('/stripe/create-checkout-session', {
      user_id: userId,
      price_id: priceId
    });
    return response.data;
  }
};

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default apiService;