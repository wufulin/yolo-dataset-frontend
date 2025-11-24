/**
 * 简化的认证工具函数 - 用于替代复杂的JWT管理
 */

export interface SimpleUser {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

export interface SimpleAuthState {
  isAuthenticated: boolean;
  user: SimpleUser | null;
  timestamp: number;
}

/**
 * 检查是否已认证
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const auth = localStorage.getItem('auth');
    if (!auth) return false;
    
    const authData: SimpleAuthState = JSON.parse(auth);
    
    // 检查认证是否过期（24小时）
    const now = Date.now();
    const authTime = authData.timestamp;
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    if (now - authTime > twentyFourHours) {
      clearAuthState();
      return false;
    }
    
    return authData.isAuthenticated && authData.user !== null;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

/**
 * 获取当前用户
 */
export function getCurrentUser(): SimpleUser | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const auth = localStorage.getItem('auth');
    if (!auth) return null;
    
    const authData: SimpleAuthState = JSON.parse(auth);
    return authData.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * 检查是否为管理员
 */
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'admin';
}

/**
 * 清除认证状态
 */
export function clearAuthState(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth');
  }
}

/**
 * 设置认证状态
 */
export function setAuthState(user: SimpleUser): void {
  if (typeof window !== 'undefined') {
    const authData: SimpleAuthState = {
      isAuthenticated: true,
      user,
      timestamp: Date.now()
    };
    localStorage.setItem('auth', JSON.stringify(authData));
  }
}

/**
 * 需要认证的路由
 */
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/datasets',
  '/upload',
];

/**
 * 检查路由是否需要认证
 */
export function requiresAuth(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * 检查认证错误
 */
export function isAuthError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const err = error as { response?: { status?: number }; code?: string; message?: string };
    return (
      err.response?.status === 401 ||
      err.code === 'UNAUTHORIZED' ||
      (typeof err.message === 'string' && (err.message.includes('认证') || err.message.includes('token')))
    );
  }
  return false;
}

/**
 * 处理认证错误
 */
export function handleAuthError(error: unknown): void {
  if (isAuthError(error)) {
    clearAuthState();
    
    if (typeof window !== 'undefined') {
      const redirect = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/auth/login?redirect=${redirect}`;
    }
  }
}
