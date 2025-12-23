const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
    // 同时设置AI服务token
    if (typeof window !== 'undefined') {
      const { aiService } = require('./aiService');
      aiService.setToken(token);
    }
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: '网络错误' }));
      throw new Error(error.error || '请求失败');
    }

    return response.json();
  }

  // 认证相关
  async register(data: { email: string; username: string; password: string }) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 用户相关
  async getProfile() {
    return this.request<any>('/users/me');
  }

  async updateBodyMeasurements(data: any) {
    return this.request<any>('/users/body-measurements', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserStats() {
    return this.request<any>('/users/stats');
  }

  // 服装相关
  async getClothingItems(params?: { category?: string; search?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any[]>(`/clothing${query ? `?${query}` : ''}`);
  }

  async createClothingItem(data: any) {
    return this.request<any>('/clothing', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClothingItem(id: string, data: any) {
    return this.request<any>(`/clothing/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteClothingItem(id: string) {
    return this.request<any>(`/clothing/${id}`, {
      method: 'DELETE',
    });
  }

  // 造型相关
  async getSavedLooks() {
    return this.request<any[]>('/looks');
  }

  async createLook(data: any) {
    return this.request<any>('/looks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLook(id: string, data: any) {
    return this.request<any>(`/looks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLook(id: string) {
    return this.request<any>(`/looks/${id}`, {
      method: 'DELETE',
    });
  }

  // 信息流相关
  async getFeedPosts(page = 1, limit = 20) {
    return this.request<any[]>(`/feed?page=${page}&limit=${limit}`);
  }

  async createFeedPost(data: { lookId: string; caption?: string }) {
    return this.request<any>('/feed', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async toggleLike(postId: string) {
    return this.request<{ liked: boolean }>(`/feed/${postId}/like`, {
      method: 'POST',
    });
  }

  // 上传相关
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    return this.request<{ url: string }>('/upload/image', {
      method: 'POST',
      body: formData,
      headers: {}, // 让浏览器设置Content-Type
    });
  }

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.request<{ url: string }>('/upload/avatar', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }
}

export const apiService = new ApiService();