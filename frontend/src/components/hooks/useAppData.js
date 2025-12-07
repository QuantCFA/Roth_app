import { useState, useCallback, useEffect } from 'react';
import apiService from '../../services/apiService';

// Hook for managing authentication state
export const useAuth = () => {
  const [userId, setUserId] = useState(() => {
    const saved = sessionStorage.getItem('userId');
    return saved ? parseInt(saved) : null;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('userId') !== null;
  });

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      sessionStorage.setItem('userId', response.user_id);
      setUserId(response.user_id);
      setIsLoggedIn(true);
      return { success: true, userId: response.user_id };
    } catch (error) {
      throw new Error(`Login failed: ${error.response?.data?.detail || error.message}`);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('userId');
    setUserId(null);
    setIsLoggedIn(false);
  };

  const createUser = async (userData) => {
    try {
      const response = await apiService.createUser(userData);
      sessionStorage.setItem('userId', response.user_id);
      setUserId(response.user_id);
      setIsLoggedIn(true);
      return { success: true, userId: response.user_id };
    } catch (error) {
      throw new Error(`Account creation failed: ${error.response?.data?.detail || error.message}`);
    }
  };

  return {
    userId,
    isLoggedIn,
    login,
    logout,
    createUser
  };
};

// Hook for managing user data
export const useUserData = (userId) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserData = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getUser(userId);
      setUserInfo(data);
    } catch (err) {
      setError(`Failed to fetch user info: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return {
    userInfo,
    loading,
    error,
    refetch: fetchUserData
  };
};

// Hook for managing input data and assumptions
export const useInputData = (userId) => {
  const [inputInfo, setInputInfo] = useState(null);
  const [runId, setRunId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInputData = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getInputs(userId);
      setInputInfo(data);
      setRunId(data.run_id);
    } catch (err) {
      setError(`Failed to fetch input data: ${err.response?.data?.detail || err.message}`);
      setInputInfo(null);
      setRunId(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateInputs = async (inputData) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        user_id: userId,
        soc_sec_benefit: parseFloat(inputData.soc_sec_benefit) || 0,
        salary: parseFloat(inputData.salary) || 0,
        cont_return_assum: parseFloat(inputData.cont_return_assum) || 0.08,
        dist_return_assum: parseFloat(inputData.dist_return_assum) || 0.05,
        trad_cont_annual: 0,
        inflation_assum: parseFloat(inputData.inflation_assum) || 0.015,
        soc_sec_grw_assum: parseFloat(inputData.soc_sec_grw_assum) || 0.015,
        retire_tax_hl: parseInt(inputData.retire_tax_hl) || 1,
        contribution_status: inputData.contribution_status,
        distribution_status: inputData.distribution_status,
        life_years: parseInt(inputData.life_years) || 30,
        trad_savings: parseFloat(inputData.trad_savings),
        roth_savings: parseFloat(inputData.roth_savings),
      };
      
      const response = await apiService.createOrUpdateInputs(payload);
      await fetchInputData(); // Refresh data
      return response;
    } catch (err) {
      setError(`Failed to update inputs: ${err.response?.data?.detail || err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInputData();
  }, [fetchInputData]);

  return {
    inputInfo,
    runId,
    loading,
    error,
    updateInputs,
    refetch: fetchInputData
  };
};

// Hook for managing conversion calculations and results
export const useConversions = (runId) => {
  const [conversions, setConversions] = useState([]);
  const [parts, setParts] = useState([]);
  const [retireYearData, setRetireYearData] = useState([]);
  const [distributionSchedule, setDistributionSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConversions = useCallback(async () => {
    if (!runId) {
      console.log('fetchConversions skipped: runId is null');
      setConversions([]);
      setParts([]);
      setRetireYearData([]);
      setDistributionSchedule(null);
      return;
    }

    console.log('Fetching conversions for runId:', runId);
    setLoading(true);
    setError(null);
    setConversions([]);
    setParts([]);
    setRetireYearData([]);
    setDistributionSchedule(null);

    try {
      const [conversionsData, partsData, retireData, distSchedule] = await Promise.all([
        apiService.getRothConversions(runId),
        apiService.getRothConversionsParts(runId),
        apiService.getRetireYearData(runId),
        apiService.getDistributionSchedule(runId)
      ]);

      setConversions(conversionsData);
      setParts(partsData);
      setRetireYearData(retireData);
      setDistributionSchedule(distSchedule);
    } catch (err) {
      setError(`Failed to fetch conversion data: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  }, [runId]);

  const runCalculations = async (userId) => {
    setLoading(true);
    setError(null);
    setConversions([]);
    setParts([]);
    setRetireYearData([]);
    setDistributionSchedule(null);

    try {
      const result = await apiService.runFullCalculation(userId);
      setConversions(result.conversions);
      setParts(result.parts);
      setRetireYearData(result.retireYearData);
      setDistributionSchedule({
        distribution: result.distribution,
        annuity_factor_multiple: result.annuity_factor_multiple,
        base_duration: result.base_duration
      });
      return result;
    } catch (err) {
      setError(`Calculation failed: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversions();
  }, [fetchConversions]);

  return {
    conversions,
    parts,
    retireYearData,
    distributionSchedule,
    loading,
    error,
    runCalculations,
    refetch: fetchConversions
  };
};

// Hook for managing form state and validation
export const useFormState = (initialState, validationRules = {}) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const updateField = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(field => {
      const rule = validationRules[field];
      const value = formData[field];
      
      if (rule.required && (value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === ''))) {
        newErrors[field] = `${field} is required`;
      } else if (rule.pattern && value && !rule.pattern.test(value)) {
        newErrors[field] = rule.message || `Invalid ${field}`;
      } else if (rule.min !== undefined && parseFloat(value) < rule.min) {
        newErrors[field] = `${field} must be at least ${rule.min}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
  };

  return {
    formData,
    errors,
    updateField,
    validateForm,
    resetForm,
    setFormData
  };
};