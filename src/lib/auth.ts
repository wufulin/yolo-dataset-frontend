import { tokenManager } from './api';
import type { User, AuthTokens } from '@/types';

/**
 * 认证工具函数集合
 */

// ====================
// Token管理
// ====================

/**
 * 获取访问令牌
 */
export function getAccessToken(): string | null {
  return tokenManager.getAccessToken();
}

/**
 * 获取刷新令牌
 */
export function getRefreshToken(): string | null {
  return tokenManager.getRefreshToken();
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
  return !!tokenManager.getAccessToken();
}

/**
 * 检查Token是否即将过期
 */
export function isTokenExpiringSoon(expiresIn: number = 300): boolean {
  const token = getAccessToken();
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = payload.exp;
    
    // 如果Token在指定时间内过期，返回true
    return (expiresAt - now) < expiresIn;
  } catch (error) {
    return true;
  }
}

/**
 * 解析JWT Token
 */
export function parseJWTPayload(token: string): any | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse JWT payload:', error);
    return null;
  }
}

/**
 * 获取Token过期时间
 */
export function getTokenExpirationTime(): Date | null {
  const token = getAccessToken();
  if (!token) return null;

  const payload = parseJWTPayload(token);
  if (!payload || !payload.exp) return null;

  return new Date(payload.exp * 1000);
}

/**
 * 获取当前用户ID
 */
export function getCurrentUserId(): string | null {
  const token = getAccessToken();
  if (!token) return null;

  const payload = parseJWTPayload(token);
  return payload?.sub || payload?.user_id || payload?.id || null;
}

/**
 * 获取用户角色
 */
export function getUserRole(): string | null {
  const token = getAccessToken();
  if (!token) return null;

  const payload = parseJWTPayload(token);
  return payload?.role || payload?.user_role || null;
}

/**
 * 获取用户权限
 */
export function getUserPermissions(): string[] {
  const token = getAccessToken();
  if (!token) return [];

  const payload = parseJWTPayload(token);
  return payload?.permissions || payload?.scopes || [];
}

/**
 * 检查用户是否有特定权限
 */
export function hasPermission(permission: string): boolean {
  const permissions = getUserPermissions();
  return permissions.includes(permission) || permissions.includes('*');
}

/**
 * 检查用户是否有特定角色
 */
export function hasRole(role: string): boolean {
  const userRole = getUserRole();
  return userRole === role;
}

/**
 * 检查用户是否为管理员
 */
export function isAdmin(): boolean {
  const userRole = getUserRole();
  return userRole === 'admin' || hasPermission('admin');
}

/**
 * 检查用户是否为超级用户
 */
export function isSuperUser(): boolean {
  const userRole = getUserRole();
  return userRole === 'super_admin' || hasPermission('super_admin');
}

// ====================
// 认证状态管理
// ====================

/**
 * 获取认证状态
 */
export function getAuthState(): {
  isAuthenticated: boolean;
  isTokenExpired: boolean;
  isTokenExpiringSoon: boolean;
  tokenExpirationTime: Date | null;
  userId: string | null;
  userRole: string | null;
  permissions: string[];
} {
  const token = getAccessToken();
  const isAuth = !!token;
  const tokenExpirationTime = getTokenExpirationTime();
  const isTokenExpired = tokenExpirationTime ? tokenExpirationTime < new Date() : true;
  const isTokenSoon = isTokenExpiringSoon();
  
  return {
    isAuthenticated: isAuth,
    isTokenExpired,
    isTokenExpiringSoon: isTokenSoon,
    tokenExpirationTime,
    userId: getCurrentUserId(),
    userRole: getUserRole(),
    permissions: getUserPermissions(),
  };
}

/**
 * 检查认证状态变化
 */
export function checkAuthStateChange(
  previousState: ReturnType<typeof getAuthState>,
  currentState: ReturnType<typeof getAuthState>
): {
  hasChanged: boolean;
  changes: string[];
} {
  const changes: string[] = [];

  if (previousState.isAuthenticated !== currentState.isAuthenticated) {
    changes.push('authentication');
  }

  if (previousState.userId !== currentState.userId) {
    changes.push('user');
  }

  if (previousState.userRole !== currentState.userRole) {
    changes.push('role');
  }

  if (JSON.stringify(previousState.permissions) !== JSON.stringify(currentState.permissions)) {
    changes.push('permissions');
  }

  if (previousState.isTokenExpired !== currentState.isTokenExpired) {
    changes.push('token_expiration');
  }

  return {
    hasChanged: changes.length > 0,
    changes,
  };
}

// ====================
// 认证保护
// ====================

/**
 * 检查页面访问权限
 */
export function canAccessPage(
  requiredPermissions: string[] = [],
  requiredRoles: string[] = []
): boolean {
  if (!isAuthenticated()) {
    return false;
  }

  // 检查角色权限
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return false;
    }
  }

  // 检查权限
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    );
    if (!hasRequiredPermissions) {
      return false;
    }
  }

  return true;
}

/**
 * 检查数据集访问权限
 */
export function canAccessDataset(
  datasetOwnerId: string,
  datasetPermissions: string[] = []
): boolean {
  const currentUserId = getCurrentUserId();
  const userRole = getUserRole();

  // 管理员和超级用户可以访问所有数据集
  if (isAdmin() || isSuperUser()) {
    return true;
  }

  // 数据集拥有者可以访问
  if (datasetOwnerId === currentUserId) {
    return true;
  }

  // 检查共享权限
  if (datasetPermissions.includes('view') || datasetPermissions.includes('edit')) {
    return true;
  }

  return false;
}

/**
 * 检查图像访问权限
 */
export function canAccessImage(
  imageOwnerId: string,
  imagePermissions: string[] = []
): boolean {
  const currentUserId = getCurrentUserId();
  const userRole = getUserRole();

  // 管理员和超级用户可以访问所有图像
  if (isAdmin() || isSuperUser()) {
    return true;
  }

  // 图像拥有者可以访问
  if (imageOwnerId === currentUserId) {
    return true;
  }

  // 检查共享权限
  if (imagePermissions.includes('view') || imagePermissions.includes('edit')) {
    return true;
  }

  return false;
}

/**
 * 检查标注操作权限
 */
export function canAnnotateImage(
  imageOwnerId: string,
  imagePermissions: string[] = []
): boolean {
  const currentUserId = getCurrentUserId();
  const userRole = getUserRole();

  // 管理员和超级用户可以标注所有图像
  if (isAdmin() || isSuperUser()) {
    return true;
  }

  // 图像拥有者可以标注
  if (imageOwnerId === currentUserId) {
    return true;
  }

  // 检查编辑权限
  if (imagePermissions.includes('edit') || imagePermissions.includes('annotate')) {
    return true;
  }

  return false;
}

/**
 * 检查数据集管理权限
 */
export function canManageDataset(datasetOwnerId: string): boolean {
  const currentUserId = getCurrentUserId();
  const userRole = getUserRole();

  // 管理员和超级用户可以管理所有数据集
  if (isAdmin() || isSuperUser()) {
    return true;
  }

  // 数据集拥有者可以管理
  return datasetOwnerId === currentUserId;
}

/**
 * 检查数据集共享权限
 */
export function canShareDataset(datasetOwnerId: string): boolean {
  const currentUserId = getCurrentUserId();
  const userRole = getUserRole();

  // 管理员和超级用户可以共享所有数据集
  if (isAdmin() || isSuperUser()) {
    return true;
  }

  // 数据集拥有者可以共享
  return datasetOwnerId === currentUserId;
}

/**
 * 检查数据集删除权限
 */
export function canDeleteDataset(datasetOwnerId: string): boolean {
  const currentUserId = getCurrentUserId();
  const userRole = getUserRole();

  // 管理员和超级用户可以删除所有数据集
  if (isAdmin() || isSuperUser()) {
    return true;
  }

  // 数据集拥有者可以删除
  return datasetOwnerId === currentUserId;
}

/**
 * 检查系统管理权限
 */
export function canManageSystem(): boolean {
  return isAdmin() || isSuperUser();
}

/**
 * 检查用户管理权限
 */
export function canManageUsers(): boolean {
  return isAdmin() || isSuperUser();
}

/**
 * 检查系统设置权限
 */
export function canAccessSystemSettings(): boolean {
  return isSuperUser();
}

// ====================
// 路由保护
// ====================

/**
 * 获取登录后重定向路径
 */
export function getPostLoginRedirect(): string {
  if (typeof window === 'undefined') return '/dashboard';
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('redirect') || '/dashboard';
}

/**
 * 获取登出后重定向路径
 */
export function getPostLogoutRedirect(): string {
  if (typeof window === 'undefined') return '/auth/login';
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('redirect') || '/auth/login';
}

/**
 * 需要认证的路由
 */
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/datasets',
  '/upload',
  '/profile',
  '/settings',
  '/analytics',
];

/**
 * 需要管理员权限的路由
 */
export const ADMIN_ROUTES = [
  '/admin',
  '/system',
  '/users',
  '/settings/system',
];

/**
 * 检查路由是否需要认证
 */
export function requiresAuth(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * 检查路由是否需要管理员权限
 */
export function requiresAdmin(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route));
}

// ====================
// 错误处理
// ====================

/**
 * 检查认证错误
 */
export function isAuthError(error: any): boolean {
  return (
    error?.response?.status === 401 ||
    error?.code === 'UNAUTHORIZED' ||
    error?.message?.includes('认证') ||
    error?.message?.includes('token')
  );
}

/**
 * 检查权限错误
 */
export function isPermissionError(error: any): boolean {
  return (
    error?.response?.status === 403 ||
    error?.code === 'FORBIDDEN' ||
    error?.message?.includes('权限') ||
    error?.message?.includes('permission')
  );
}

/**
 * 处理认证错误
 */
export function handleAuthError(error: any): void {
  if (isAuthError(error)) {
    // 清除所有认证信息
    clearAuthState();
    
    // 重定向到登录页面
    if (typeof window !== 'undefined') {
      const redirect = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/auth/login?redirect=${redirect}`;
    }
  }
}

/**
 * 清除认证状态
 */
export function clearAuthState(): void {
  tokenManager.clearTokens();
  
  // 清除localStorage中的认证信息
  if (typeof window !== 'undefined') {
    const authKeys = [
      'auth.user',
      'auth.tokens',
      'auth.state',
      'user.preferences',
      'user.settings',
    ];
    
    authKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

// ====================
// 认证状态持久化
// ====================

/**
 * 保存认证状态到localStorage
 */
export function saveAuthState(user: User, tokens: AuthTokens): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth.user', JSON.stringify(user));
    localStorage.setItem('auth.tokens', JSON.stringify(tokens));
    
    // 保存认证状态摘要
    const state = {
      userId: user.id,
      userRole: user.role,
      tokenExpirationTime: getTokenExpirationTime()?.toISOString(),
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('auth.state', JSON.stringify(state));
  }
}

/**
 * 从localStorage恢复认证状态
 */
export function restoreAuthState(): {
  user: User | null;
  tokens: AuthTokens | null;
  state: any | null;
} {
  if (typeof window === 'undefined') {
    return { user: null, tokens: null, state: null };
  }

  try {
    const userStr = localStorage.getItem('auth.user');
    const tokensStr = localStorage.getItem('auth.tokens');
    const stateStr = localStorage.getItem('auth.state');

    return {
      user: userStr ? JSON.parse(userStr) : null,
      tokens: tokensStr ? JSON.parse(tokensStr) : null,
      state: stateStr ? JSON.parse(stateStr) : null,
    };
  } catch (error) {
    console.error('Failed to restore auth state:', error);
    clearAuthState();
    return { user: null, tokens: null, state: null };
  }
}

/**
 * 同步认证状态
 */
export function syncAuthState(): boolean {
  const { user, tokens, state } = restoreAuthState();
  
  if (!user || !tokens) {
    return false;
  }

  // 检查Token是否过期
  if (isTokenExpiringSoon()) {
    clearAuthState();
    return false;
  }

  // 恢复Token管理器状态
  tokenManager.setTokens(tokens);
  return true;
}

// ====================
// 导出默认对象
// ====================

export const authUtils = {
  // Token管理
  getAccessToken,
  getRefreshToken,
  isAuthenticated,
  isTokenExpiringSoon,
  parseJWTPayload,
  getTokenExpirationTime,
  
  // 用户信息
  getCurrentUserId,
  getUserRole,
  getUserPermissions,
  hasPermission,
  hasRole,
  isAdmin,
  isSuperUser,
  
  // 状态管理
  getAuthState,
  checkAuthStateChange,
  
  // 权限检查
  canAccessPage,
  canAccessDataset,
  canAccessImage,
  canAnnotateImage,
  canManageDataset,
  canShareDataset,
  canDeleteDataset,
  canManageSystem,
  canManageUsers,
  canAccessSystemSettings,
  
  // 路由保护
  getPostLoginRedirect,
  getPostLogoutRedirect,
  requiresAuth,
  requiresAdmin,
  
  // 错误处理
  isAuthError,
  isPermissionError,
  handleAuthError,
  clearAuthState,
  
  // 状态持久化
  saveAuthState,
  restoreAuthState,
  syncAuthState,
};

export default authUtils;