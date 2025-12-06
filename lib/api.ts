import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://buyani-ecommerce-app-2kse.vercel.app/api';

// Log the API URL for debugging (only in development)
if (__DEV__) {
  console.log('🔗 API Base URL:', API_BASE_URL);
  if (API_BASE_URL.includes('localhost')) {
    console.warn(
      '⚠️  Using localhost - this will not work on physical devices!\n' +
      '   To fix: Set EXPO_PUBLIC_API_URL=http://YOUR_IP:3000/api in .env\n' +
      '   Find your IP: Windows: ipconfig | Mac/Linux: ifconfig'
    );
  }
}

export interface LoginRequest {
  email: string;
  password: string;
  role: 'customer' | 'seller';
}

export interface SignupRequest {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  name?: string; // For backward compatibility
  role: 'customer' | 'seller';
  storeName?: string;
  ownerName?: string;
  phoneNumber?: string;
  businessCategory?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    email: string;
    role: 'customer' | 'seller';
    name?: string;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = await this.getToken();

    if (__DEV__) {
      console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      // Handle network errors
      if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
        const isProduction = this.baseUrl.includes('vercel.app') || this.baseUrl.includes('https://');
        const errorMsg = isProduction
          ? `Cannot connect to server. Please check:\n` +
            `1. API URL is correct (currently: ${this.baseUrl})\n` +
            `2. Vercel deployment is running and accessible\n` +
            `3. API routes are configured correctly on Vercel\n` +
            `4. Check network connectivity and CORS settings`
          : `Cannot connect to server. Please check:\n` +
            `1. Server is running (cd server && npm run dev)\n` +
            `2. API URL is correct (currently: ${this.baseUrl})\n` +
            `3. For mobile: Use your computer's IP address instead of localhost\n` +
            `   Set EXPO_PUBLIC_API_URL=http://YOUR_IP:3000/api in .env`;
        throw new Error(errorMsg);
      }
      throw error;
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async setToken(token: string) {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async clearToken() {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }
}

export const api = new ApiClient(API_BASE_URL);

