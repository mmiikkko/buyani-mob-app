import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://buyani-ecommerce-app-2kse.vercel.app/api';

// Base URL for the web app (used for things like forgot-password flows)
// If API is .../api, the web base is everything before /api
export const WEB_BASE_URL =
  process.env.EXPO_PUBLIC_WEB_URL ||
  API_BASE_URL.replace(/\/api\/?$/, '');

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

export type UserRole = 'customer' | 'seller';

export interface LoginRequest {
  email: string;
  password: string;
  role: UserRole;
}

export interface SignupRequest {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  name?: string; // For backward compatibility
  role: UserRole;
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
    role: UserRole;
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

export interface CartItem {
  id: string;
  productId: string | null;
  quantity: number;
  productName: string | null;
  price: number;
  description: string | null;
  image: string | null;
}

export interface OrderPayload {
  address: {
    fullName: string;
    street: string;
    apartment?: string;
    city: string;
    province: string;
    zipcode: string;
    country: string;
    deliveryNotes?: string;
  };
  paymentMethod: 'cod' | 'gcash' | string;
  cartItems: Array<{
    id?: string;
    productId: string;
    quantity: number;
    price?: number;
  }>;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName?: string;
  addressId: string | null;
  total: number | null;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    orderId: string;
    productId: string;
    productName: string;
    quantity: number;
    subtotal: number;
    productImage: string | null;
  }>;
  payment?: {
    orderId: string;
    status: string;
    paymentMethod: string;
    paymentReceived: number | null;
    change: number | null;
  };
}

export interface Address {
  id: string;
  userId: string;
  receipientName: string;
  street: string;
  baranggay?: string | null;
  city: string;
  province: string;
  region?: string | null;
  zipcode: string;
  remarks?: string | null;
  addedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  reviewId: string;
  orderId: string;
  buyerId: string;
  comment: string | null;
  rating: number;
  createdAt: string;
  updatedAt: string;
  buyerName: string | null;
  buyerEmail: string | null;
}

export interface SellerProduct {
  id: string;
  shopId: string;
  categoryId: string;
  productName: string;
  SKU: string;
  description: string | null;
  price: number;
  rating: number | null;
  isAvailable: boolean;
  status: string;
  stock: number;
  itemsSold: number | null;
  images: Array<{
    id: string;
    product_id: string;
    image_url: string;
    is_primary: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface SellerOrder {
  id: string;
  buyerId: string;
  buyerName: string;
  addressId: string | null;
  total: number | null;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    subtotal: number;
    product: {
      id: string;
      productName: string;
      price: number;
      images: Array<{
        id: string;
        product_id: string;
        image_url: string[];
        is_primary: boolean;
      }>;
    } | null;
  }>;
  payment: {
    id: string;
    orderId: string;
    paymentMethod: number | null;
    paymentReceived: number | null;
    change: number | null;
    status: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  transactions: Array<{
    id: string;
    userId: string;
    orderId: string;
    transactionType: string | null;
    remarks: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  status: string;
  type: string;
}

export interface SellerShop {
  user: {
    id: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string;
    image: string | null;
  };
  shop: {
    id: string;
    shopName: string;
    description: string | null;
    imageURL: string | null;
    status: string;
    shopRating: string | null;
  } | null;
}

export interface SellerStats {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  activeProducts: number;
  removedProducts: number;
}

export interface SellerRecentOrderSummary {
  id: string;
  orderCode?: string;
  buyerName?: string;
  total: number | null;
  status: string;
  createdAt: string;
}

class ApiClient {
  private baseUrl: string;
  private static TOKEN_KEY = 'auth_token';
  private static ROLE_KEY = 'user_role';

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = await this.getToken();
    const role = await this.getUserRole();

    if (__DEV__) {
      console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);
      if (token) {
        console.log(`🔑 Token present: ${token.substring(0, 20)}...`);
      } else {
        console.log(`⚠️ No token`);
      }
      console.log(`👤 Stored role: ${role || 'none'}`);
    }

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        } as any,
      });

      clearTimeout(timeoutId);

      if (__DEV__) {
        console.log(`📥 Response status: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails: any = null;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          errorDetails = errorData;
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
        
        // For 401 errors, clear auth and provide more specific guidance
        if (response.status === 401) {
          try {
            await this.clearToken();
            await this.clearUserRole();
          } catch (clearError) {
            console.error('Error clearing auth state after 401:', clearError);
          }

          const authError = new Error('Unauthorized. Please log in again.');
          (authError as any).status = 401;
          (authError as any).details = errorDetails;
          throw authError;
        }
        
        const apiError = new Error(errorMessage);
        (apiError as any).status = response.status;
        (apiError as any).details = errorDetails;
        throw apiError;
      }

      const data = await response.json();
      if (__DEV__) {
        console.log(`✅ API Success:`, Array.isArray(data) ? `${data.length} items` : 'Success');
      }
      return data;
    } catch (error: any) {
      // Handle abort/timeout errors
      if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        throw new Error('Request timeout. The server is taking too long to respond. Please check your connection and try again.');
      }

      // Handle network errors
      if (
        error.message === 'Network request failed' || 
        error.message === 'Failed to fetch' || 
        error.name === 'TypeError' ||
        error.message?.includes('NetworkError') ||
        error.message?.includes('network')
      ) {
        const isProduction = this.baseUrl.includes('vercel.app') || this.baseUrl.includes('https://');
        const testUrl = `${this.baseUrl}${endpoint}`;
        const errorMsg = isProduction
          ? `Cannot connect to server. Please check:\n\n` +
            `1. API URL is correct (currently: ${this.baseUrl})\n` +
            `2. Vercel deployment is running and accessible\n` +
            `3. API routes are configured correctly on Vercel\n` +
            `4. Check network connectivity and CORS settings\n` +
            `5. Try opening ${testUrl} in your browser to test\n\n` +
            `If the issue persists, check Vercel deployment logs.`
          : `Cannot connect to server. Please check:\n\n` +
            `1. Server is running (cd buyani-ecommerce-app && npm run dev)\n` +
            `2. API URL is correct (currently: ${this.baseUrl})\n` +
            `3. For mobile: Use your computer's IP address instead of localhost\n` +
            `   Set EXPO_PUBLIC_API_URL=http://YOUR_IP:3000/api in .env\n\n` +
            `Test URL: ${testUrl}`;
        throw new Error(errorMsg);
      }
      throw error;
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/mobile-login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // Persist token and role immediately so the app knows the role right after login
    await this.setToken(response.token);
    if (response.user?.role) {
      await this.setUserRole(response.user.role);
    }
    return response;
  }

  // Trigger a password reset email using the web auth flow
  async requestPasswordReset(email: string): Promise<{ success: boolean; message?: string }> {
    return this.request('/auth/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Complete password reset with token + new password
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // Request password reset with 6-digit code
  async requestPasswordResetCode(email: string): Promise<{ success: boolean; message?: string }> {
    return this.request('/auth/mobile-forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Verify the 6-digit reset code
  async verifyResetCode(email: string, code: string): Promise<{ success: boolean; message?: string; codeId?: string }> {
    return this.request('/auth/mobile-verify-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  // Reset password with verified code
  async resetPasswordWithCode(email: string, code: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    return this.request('/auth/mobile-reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword }),
    });
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/mobile-register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // Persist token and role immediately for new accounts
    await this.setToken(response.token);
    if (response.user?.role) {
      await this.setUserRole(response.user.role);
    }
    return response;
  }

  async setToken(token: string) {
    try {
      await AsyncStorage.setItem(ApiClient.TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ApiClient.TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async clearToken() {
    try {
      await AsyncStorage.removeItem(ApiClient.TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

  async setUserRole(role: UserRole | null) {
    try {
      if (!role) {
        await AsyncStorage.removeItem(ApiClient.ROLE_KEY);
      } else {
        await AsyncStorage.setItem(ApiClient.ROLE_KEY, role);
      }
    } catch (error) {
      console.error('Error saving user role:', error);
    }
  }

  async getUserRole(): Promise<UserRole | null> {
    try {
      const value = await AsyncStorage.getItem(ApiClient.ROLE_KEY);
      if (value === 'customer' || value === 'seller') {
        return value;
      }
      return null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  async clearUserRole() {
    try {
      await AsyncStorage.removeItem(ApiClient.ROLE_KEY);
    } catch (error) {
      console.error('Error clearing user role:', error);
    }
  }

  private async ensureSeller(endpointName: string) {
    // Just ensure we have a token - let the backend determine seller status
    // This matches how the web app works: authenticate first, backend checks shops
    const token = await this.getToken();
    if (!token || token === 'demo-token-offline-mode') {
      throw new Error('No authentication token. Please log in again.');
    }
    
    if (__DEV__) {
      const role = await this.getUserRole();
      console.log(`🔐 Seller endpoint ${endpointName} – token present, role cache: ${role || 'none'}`);
    }
    
    // Don't check seller status here - let the backend API handle it
    // Backend will return empty data if user has no shops (like web app does)
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

  // User API
  async getCurrentUser(): Promise<any> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('No authentication token. Please log in.');
    }
    return this.request<any>('/auth/mobile-me');
  }

  // Health check API
  async checkHealth(): Promise<{ status: string; timestamp: string; message: string }> {
    return this.request<{ status: string; timestamp: string; message: string }>('/health');
  }

  // Cart API - Returns cart items for the authenticated user only
  async getCart(): Promise<CartItem[]> {
    // The token is automatically included in the request header
    // The API will filter cart items by the userId from the JWT token
    return this.request<CartItem[]>('/cart');
  }

  async addToCart(productId: string, quantity: number = 1): Promise<{ success: boolean; message?: string }> {
    return this.request('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async updateCartItem(id: string, quantity: number): Promise<{ success: boolean; message?: string }> {
    return this.request('/cart', {
      method: 'PUT',
      body: JSON.stringify({ id, quantity }),
    });
  }

  async removeCartItem(id: string): Promise<{ success: boolean; message?: string }> {
    const url = `/cart?id=${encodeURIComponent(id)}`;
    return this.request(url, {
      method: 'DELETE',
    });
  }

  async getCartCount(): Promise<{ count: number }> {
    return this.request<{ count: number }>('/cart/count');
  }

  // Shop Products API
  async getShopProducts(shopId: string): Promise<Product[]> {
    return this.request<Product[]>(`/shops/${shopId}/products`);
  }

  // Orders API (Customer)
  async getOrders(): Promise<Order[]> {
    return this.request<Order[]>('/orders');
  }

  async createOrder(payload: OrderPayload): Promise<{ success: boolean; orderId: string; subtotal: number; paymentMethod: string; message: string }> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateOrder(orderId: string, updates: { status?: string; [key: string]: any }): Promise<{ success: boolean }> {
    const url = `/orders?id=${encodeURIComponent(orderId)}`;
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteOrder(orderId: string): Promise<{ success: boolean }> {
    const url = `/orders?id=${encodeURIComponent(orderId)}`;
    return this.request(url, {
      method: 'DELETE',
    });
  }

  // Addresses API
  async getAddresses(): Promise<Address[]> {
    return this.request<Address[]>('/addresses');
  }

  async createAddress(address: {
    receipientName: string;
    street: string;
    baranggay?: string;
    city: string;
    province: string;
    region?: string;
    zipcode: string;
    remarks?: string;
  }): Promise<{ success: boolean; address: Address }> {
    return this.request('/addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    });
  }

  async updateAddress(addressId: string, updates: Partial<Address>): Promise<{ success: boolean }> {
    const url = `/addresses?id=${encodeURIComponent(addressId)}`;
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteAddress(addressId: string): Promise<{ success: boolean }> {
    const url = `/addresses?id=${encodeURIComponent(addressId)}`;
    return this.request(url, {
      method: 'DELETE',
    });
  }

  // Reviews API
  async getReviews(productId: string): Promise<Review[]> {
    const url = `/reviews?productId=${encodeURIComponent(productId)}`;
    return this.request<Review[]>(url);
  }

  async createReview(data: {
    orderId: string;
    rating: number;
    comment?: string;
  }): Promise<{ success: boolean; message: string; reviewId: string }> {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Seller Products API
  async getSellerProducts(): Promise<SellerProduct[]> {
    await this.ensureSeller('getSellerProducts');
    return this.request<SellerProduct[]>('/sellers/products');
  }

  async createSellerProduct(product: {
    productName: string;
    categoryId: string;
    price: number;
    SKU?: string;
    description?: string;
    rating?: number | string;
    status?: string;
    stock?: number;
    images?: Array<{ image_url: string }>;
  }): Promise<{ success: boolean; productId: string; message: string }> {
    await this.ensureSeller('createSellerProduct');
    return this.request('/sellers/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateSellerProduct(productId: string, updates: {
    productName?: string;
    categoryId?: string;
    price?: number;
    SKU?: string;
    description?: string;
    status?: string;
    stock?: number;
    images?: Array<{ image_url: string }>;
  }): Promise<{ success: boolean }> {
    await this.ensureSeller('updateSellerProduct');
    const url = `/sellers/products?id=${encodeURIComponent(productId)}`;
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Seller Orders API
  async getSellerOrders(): Promise<SellerOrder[]> {
    await this.ensureSeller('getSellerOrders');
    return this.request<SellerOrder[]>('/sellers/orders');
  }

  async updateSellerOrderStatus(orderId: string, status: 'accepted' | 'rejected' | 'shipped'): Promise<{
    success: boolean;
    message: string;
    status: string;
  }> {
    await this.ensureSeller('updateSellerOrderStatus');
    return this.request(`/sellers/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Seller dashboard stats (same as web seller center)
  async getSellerStats(days: number | 'all' = 'all'): Promise<SellerStats> {
    await this.ensureSeller('getSellerStats');
    const query = days === 'all' ? '' : `?days=${days}`;
    return this.request<SellerStats>(`/sellers/stats${query}`);
  }

  // Optional: recent orders summary for dashboard (fallback to full orders if not available)
  async getSellerRecentOrders(limit: number = 5): Promise<SellerRecentOrderSummary[]> {
    await this.ensureSeller('getSellerRecentOrders');
    try {
      const data = await this.request<SellerRecentOrderSummary[]>(`/sellers/recent-orders`);
      return Array.isArray(data) ? data.slice(0, limit) : [];
    } catch (error: any) {
      // If the endpoint is not available, gracefully fall back to full orders list
      if (error?.status === 404) {
        const orders = await this.getSellerOrders();
        return orders
          .slice(0, limit)
          .map((o) => ({
            id: o.id,
            orderCode: o.id,
            buyerName: o.buyerName,
            total: o.total,
            status: o.status,
            createdAt: o.createdAt,
          }));
      }
      throw error;
    }
  }

  // General products API for product removal (used by seller center)
  async deleteProduct(productId: string): Promise<{ success: boolean; message?: string }> {
    await this.ensureSeller('deleteProduct');
    const url = `/products?id=${encodeURIComponent(productId)}`;
    return this.request(url, {
      method: 'DELETE',
    });
  }

  // Seller Shop API
  async getSellerShop(): Promise<SellerShop> {
    await this.ensureSeller('getSellerShop');
    return this.request<SellerShop>('/sellers/shop');
  }

  async updateSellerShop(updates: {
    shopName?: string;
    description?: string;
    imageURL?: string;
  }): Promise<{ success: boolean }> {
    await this.ensureSeller('updateSellerShop');
    return this.request('/sellers/shop', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);

