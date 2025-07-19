export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const apiRequest = async <T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = localStorage.getItem('token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      // Handle specific HTTP errors
      if (response.status === 401) {
        // Unauthorized - clear token and redirect
        localStorage.removeItem('token');
        window.location.href = '/';
      }
      
      return {
        success: false,
        error: data.message || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
};

export const handleApiError = (error: any) => {
  if (error?.status === 401) {
    // Redirect to login
    localStorage.removeItem('token');
    window.location.href = '/';
  }
  
  return {
    message: error?.message || 'Something went wrong',
    status: error?.status || 500
  };
};