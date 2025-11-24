// 认证相关类型定义
export interface User {
  user_id: string;
  email: string;
  username: string;
  role: 'admin' | 'user' | 'premium';
  profile: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
    company?: string;
    bio?: string;
  };
  subscription: {
    plan: 'free' | 'basic' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    limits: {
      max_datasets: number;
      max_images: number;
      max_storage_gb: number;
    };
  };
  permissions: string[];
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  is_active: boolean;
  is_verified: boolean;
}

export interface LoginCredentials {
  login: string; // 用户名或邮箱
  password: string;
  remember_me?: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  profile: {
    first_name: string;
    last_name: string;
    company?: string;
    bio?: string;
  };
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

export interface AuthResponse {
  success: boolean;
  data: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    user: User;
  };
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
    request_id: string;
  };
  timestamp: string;
}

export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}
