import axios from 'axios';
import toast from 'react-hot-toast';


// Get backend URL from environment variable
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';


// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes timeout for large uploads
  headers: {
    'Content-Type': 'application/json',
  },
});


// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making API request to: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);

    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.detail || error.response.data?.message || 'Server error occurred';
      toast.error(message);
    } else if (error.request) {
      // Request made but no response received
      toast.error('Network error - please check your connection');
    } else {
      // Something else happened
      toast.error('An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);


export const apiService = {
  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  },


  // Upload dataset and run analysis
  uploadDataset: async (formData, onUploadProgress) => {
    try {
      const response = await api.post('/upload-dataset', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      });

      toast.success('Analysis completed successfully!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },


  // Analyze chart image
  analyzeChart: async (file, onUploadProgress) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/analyze-chart', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      });

      toast.success('Chart analysis completed!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },


  // Chat with AI
  chat: async (message, sessionId = null, contextType = 'general') => {
    try {
      const response = await api.post('/chat', {
        message,
        session_id: sessionId,
        context_type: contextType,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },


  // Get session details
  getSession: async (sessionId) => {
    try {
      const response = await api.get(`/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },


  // Download file
  downloadFile: async (sessionId, fileType) => {
    try {
      const response = await api.get(`/download/${sessionId}/${fileType}`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${fileType}_${sessionId}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('File downloaded successfully!');
      return true;
    } catch (error) {
      throw error;
    }
  },


  // WebSocket connection for real-time chat
  connectWebSocket: (sessionId, onMessage, onError) => {
    try {
      const wsUrl = API_BASE_URL.replace('/api', '').replace('http', 'ws') + `/api/ws/chat/${sessionId}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onError) onError(error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
      };

      return ws;
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      throw error;
    }
  },


  // Get all sessions (for history)
  getAllSessions: async (limit = 50) => {
    try {
      const response = await api.get(`/sessions?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },


  // Delete session
  deleteSession: async (sessionId) => {
    try {
      const response = await api.delete(`/sessions/${sessionId}`);
      toast.success('Session deleted successfully!');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};


// Utility functions
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};


export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};


export const validateFile = (file, allowedTypes, maxSize) => {
  if (!allowedTypes.includes(file.type)) {
    toast.error('Invalid file type. Please select a valid file.');
    return false;
  }

  if (file.size > maxSize) {
    toast.error(`File size too large. Maximum size is ${formatFileSize(maxSize)}.`);
    return false;
  }

  return true;
};


// Export default api instance
export default api;
