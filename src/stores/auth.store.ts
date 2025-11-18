import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthTokens, LoginCredentials, RegisterData } from '../types';
import { authAPI } from '../lib/api';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: string[];

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<User['profile']>) => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  hasPermission: (permission: string) => boolean;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      permissions: [],

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authAPI.login(credentials);
          
          if (response.success) {
            const { access_token, refresh_token, user } = response.data;
            
            set({
              user,
              tokens: { access_token, refresh_token, token_type: 'Bearer', expires_in: 3600 },
              isAuthenticated: true,
              permissions: user.permissions,
              isLoading: false,
              error: null
            });
            
            // 设置API默认token
            authAPI.setAuthToken(access_token);
          } else {
            throw new Error('登录失败');
          }
        } catch (error: any) {
          set({
            error: error.message || '登录失败',
            isLoading: false,
            isAuthenticated: false
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authAPI.register(data);
          
          if (response.success) {
            // 注册成功后可以自动登录
            await get().login({ login: data.email, password: data.password });
          } else {
            throw new Error(response.error?.message || '注册失败');
          }
        } catch (error: any) {
          set({
            error: error.message || '注册失败',
            isLoading: false
          });
          throw error;
        }
      },

      logout: async () => {
        const { tokens } = get();
        
        try {
          if (tokens?.access_token) {
            await authAPI.logout();
          }
        } catch (error) {
          // 即使退出API调用失败，也要清除本地状态
          console.error('Logout API error:', error);
        } finally {
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            permissions: [],
            error: null
          });
          
          // 清除API token
          authAPI.clearAuthToken();
        }
      },

      refreshToken: async () => {
        const { tokens } = get();
        
        if (!tokens?.refresh_token) {
          throw new Error('没有刷新令牌');
        }
        
        try {
          const response = await authAPI.refreshToken(tokens.refresh_token);
          
          if (response.success) {
            const { access_token, expires_in } = response.data;
            
            set(state => ({
              tokens: {
                ...state.tokens!,
                access_token,
                expires_in
              }
            }));
            
            // 更新API token
            authAPI.setAuthToken(access_token);
          } else {
            throw new Error('令牌刷新失败');
          }
        } catch (error: any) {
          // 刷新失败，清除认证状态
          await get().logout();
          throw error;
        }
      },

      updateProfile: async (profileData: Partial<User['profile']>) => {
        const { user } = get();
        
        if (!user) {
          throw new Error('用户未登录');
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const response = await authAPI.updateProfile(profileData);
          
          if (response.success) {
            set({
              user: { ...user, profile: { ...user.profile, ...profileData } },
              isLoading: false
            });
          } else {
            throw new Error(response.error?.message || '更新个人信息失败');
          }
        } catch (error: any) {
          set({
            error: error.message || '更新个人信息失败',
            isLoading: false
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      setUser: (user: User) => {
        set({
          user,
          isAuthenticated: true,
          permissions: user.permissions
        });
      },

      setTokens: (tokens: AuthTokens) => {
        set({ tokens });
        authAPI.setAuthToken(tokens.access_token);
      },

      hasPermission: (permission: string) => {
        const { permissions } = get();
        return permissions.includes(permission);
      },

      checkAuth: async () => {
        const { tokens, user, isAuthenticated } = get();
        
        if (!tokens || !user || !isAuthenticated) {
          return;
        }
        
        try {
          // 检查当前token是否还有效
          const response = await authAPI.getCurrentUser();
          
          if (response.success) {
            // 更新用户信息
            set({
              user: response.data,
              isAuthenticated: true,
              permissions: response.data.permissions
            });
          } else {
            // Token可能已过期，尝试刷新
            await get().refreshToken();
          }
        } catch (error) {
          // 检查失败，可能需要重新登录
          console.error('Auth check failed:', error);
        }
      }
    }),
    {
      name: 'yolo-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions
      })
    }
  )
);

// 自动刷新token的定时器
let refreshTimer: NodeJS.Timeout | null = null;

export const startTokenRefreshTimer = () => {
  const { tokens } = useAuthStore.getState();
  
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
  
  if (tokens && tokens.expires_in) {
    // 在token过期前5分钟刷新
    const refreshTime = (tokens.expires_in - 300) * 1000;
    
    refreshTimer = setInterval(async () => {
      try {
        await useAuthStore.getState().refreshToken();
      } catch (error) {
        console.error('Auto refresh token failed:', error);
      }
    }, refreshTime);
  }
};

export const stopTokenRefreshTimer = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

// 初始化时启动定时器
if (typeof window !== 'undefined') {
  // 延迟启动，避免SSR问题
  setTimeout(() => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      startTokenRefreshTimer();
    }
  }, 1000);
}

// 监听认证状态变化
useAuthStore.subscribe(
  (state) => state.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      startTokenRefreshTimer();
    } else {
      stopTokenRefreshTimer();
    }
  }
);
