import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthTokens, LoginCredentials, RegisterData } from '../types';
import { authApi, tokenManager } from '../lib/api';

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
  clearError: () => void;
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  hasPermission: (permission: string) => boolean;
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
          const user = await authApi.login(credentials);
          
          // 从 tokenManager 获取 tokens（login 方法已经设置了 tokens）
          const accessToken = tokenManager.getAccessToken();
          const refreshToken = tokenManager.getRefreshToken();
          
          if (!accessToken || !refreshToken) {
            throw new Error('获取 tokens 失败');
          }
          
          set({
            user,
            tokens: { 
              access_token: accessToken, 
              refresh_token: refreshToken, 
              token_type: 'Bearer', 
              expires_in: 3600 
            },
            isAuthenticated: true,
            permissions: user.permissions,
            isLoading: false,
            error: null
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '登录失败';
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        
        try {
          const user = await authApi.register(data);
          
          // 从 tokenManager 获取 tokens（register 方法已经设置了 tokens）
          const accessToken = tokenManager.getAccessToken();
          const refreshToken = tokenManager.getRefreshToken();
          
          if (!accessToken || !refreshToken) {
            throw new Error('获取 tokens 失败');
          }
          
          set({
            user,
            tokens: { 
              access_token: accessToken, 
              refresh_token: refreshToken, 
              token_type: 'Bearer', 
              expires_in: 3600 
            },
            isAuthenticated: true,
            permissions: user.permissions,
            isLoading: false,
            error: null
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '注册失败';
          set({
            error: errorMessage,
            isLoading: false
          });
          throw error;
        }
      },

      logout: async () => {
        const { tokens } = get();
        
        try {
          if (tokens?.access_token) {
            await authApi.logout();
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
          authApi.logout();
        }
      },

      refreshToken: async () => {
        const { tokens } = get();
        
        if (!tokens?.refresh_token) {
          throw new Error('没有刷新令牌');
        }
        
        try {
          const newTokens = await authApi.refreshToken(tokens.refresh_token);
          
          // authApi.refreshToken 已经在内部设置了 tokens 到 tokenManager
          set(state => ({
            tokens: {
              ...state.tokens!,
              ...newTokens
            }
          }));
        } catch (error: unknown) {
          // 刷新失败，清除认证状态
          await get().logout();
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
        authApi.refreshToken(tokens.access_token);
      },

      hasPermission: (permission: string) => {
        const { permissions } = get();
        return permissions.includes(permission);
      },
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
