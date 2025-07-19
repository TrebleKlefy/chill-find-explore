import { useState } from 'react';
import { apiRequest, ApiResponse } from '../config/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = async <T = any>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T> | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiRequest<T>(endpoint, options);
      
      if (!result.success) {
        setError(result.error || 'An error occurred');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { 
    loading, 
    error, 
    apiCall, 
    clearError 
  };
};