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

export interface Product {
  id: string;
  shopId: string;
  categoryId: string;
  productName: string;
  SKU?: string;
  description?: string;
  price: number;
  rating?: string;
  isAvailable: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  stock: number;
  itemsSold?: number;
  shopName: string;
  shopStatus: string;
  images: Array<{
    id: string;
    product_id: string;
    image_url: string[];
    is_primary: boolean;
  }>;
}

export interface Category {
  id: string;
  categoryName: string;
  productCount?: number;
}

export interface Shop {
  id: string;
  seller_id: string;
  shop_name: string;
  shop_rating?: string;
  description?: string;
  image?: string;
  status: string;
  created_at: string;
  updated_at: string;
  owner_name: string;
  products: number;
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
      if (token) {
        console.log(`🔑 Token present: ${token.substring(0, 20)}...`);
      } else {
        console.log(`⚠️ No token`);
      }
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

      if (__DEV__) {
        console.log(`📥 Response status: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          if (__DEV__) {
            console.error(`❌ API Error:`, errorData);
          }
        } catch {
          // If response is not JSON, try to get text
          try {
            const text = await response.text();
            if (text) {
              errorMessage = text.substring(0, 200);
              if (__DEV__) {
                console.error(`❌ Non-JSON error response:`, text.substring(0, 200));
              }
            }
          } catch {
            // Keep default error message
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (__DEV__) {
        console.log(`✅ API Success:`, Array.isArray(data) ? `${data.length} items` : 'Success');
      }
      return data;
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
    return this.request<AuthResponse>('/auth/mobile-login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/mobile-register', {
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

  // Products API
  async getProducts(categoryId?: string): Promise<Product[]> {
    const query = categoryId ? `?categoryId=${categoryId}` : '';
    return this.request<Product[]>(`/products${query}`);
  }

  async getProduct(productId: string): Promise<Product> {
    // Get all products and find the one with matching ID
    const products = await this.request<Product[]>(`/products`);
    const product = products.find(p => p.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  // Categories API
  async getCategories(withCounts: boolean = false): Promise<Category[]> {
    const query = withCounts ? '?withCounts=true' : '';
    return this.request<Category[]>(`/categories${query}`);
  }

  // Shops API
  async getShops(status?: string): Promise<Shop[]> {
    const query = status ? `?status=${status}` : '';
    return this.request<Shop[]>(`/shops${query}`);
  }

  async getShop(shopId: string): Promise<Shop> {
    return this.request<Shop>(`/shops?id=${shopId}`);
  }

  // Orders API
  async getOrders(): Promise<any[]> {
    return this.request<any[]>('/orders');
  }

  // User API
  async getCurrentUser(): Promise<any> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('No authentication token. Please log in.');
    }
    return this.request<any>('/auth/mobile-me');
  }
}

export const api = new ApiClient(API_BASE_URL);

