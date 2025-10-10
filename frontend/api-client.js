import axios from "axios";

const apiClient = axios.create({
  baseURL: typeof window === "undefined" ? process.env.NEXT_PUBLIC_APP_URL || "" : "",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request deduplication cache
const pendingRequests = new Map();

// Request interceptor for deduplication
apiClient.interceptors.request.use(
  (config) => {
    // Only deduplicate GET requests
    if (config.method === 'get') {
      const requestKey = `${config.method}:${config.url}`;
      
      // If there's a pending request with the same key, return it
      if (pendingRequests.has(requestKey)) {
        return pendingRequests.get(requestKey);
      }
      
      // Store the request promise
      const requestPromise = new Promise((resolve, reject) => {
        config._resolve = resolve;
        config._reject = reject;
      });
      
      pendingRequests.set(requestKey, requestPromise);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Clean up pending requests
    if (response.config.method === 'get') {
      const requestKey = `${response.config.method}:${response.config.url}`;
      pendingRequests.delete(requestKey);
    }
    
    return response;
  },
  (error) => {
    // Clean up pending requests on error
    if (error.config?.method === 'get') {
      const requestKey = `${error.config.method}:${error.config.url}`;
      pendingRequests.delete(requestKey);
    }
    
    // Enhanced error logging for debugging
    const errorDetails = {
      message: error?.message || "Unknown error",
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      url: error?.config?.url,
      method: error?.config?.method,
      headers: error?.config?.headers,
    };

    if (process.env.NODE_ENV === "development") {
      console.error("API request failed:", errorDetails);
      
      // Log the full error object for debugging
      if (error?.response) {
        console.error("Response error:", error.response);
      } else if (error?.request) {
        console.error("Request error (no response):", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
