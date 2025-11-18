import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { AnnotationClass } from '@/types';

// ====================
// 样式工具
// ====================

/**
 * 合并并优化CSS类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ====================
// 文件大小格式化
// ====================

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * 解析文件大小字符串（如 "10MB" -> 10485760）
 */
export function parseFileSize(sizeString: string): number {
  const units = {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
    TB: 1024 * 1024 * 1024 * 1024,
  };

  const match = sizeString.toUpperCase().match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB|TB)$/);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2] as keyof typeof units;
  return value * units[unit];
}

/**
 * 获取文件大小的友好显示
 */
export function getFileSizeDisplay(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

// ====================
// 日期时间格式化
// ====================

/**
 * 格式化日期
 */
export function formatDate(date: string | Date, format = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = new Date(date);
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 格式化相对时间（如 "2小时前"）
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return '刚刚';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks}周前`;
  } else if (diffMonths < 12) {
    return `${diffMonths}个月前`;
  } else {
    return `${diffYears}年前`;
  }
}

/**
 * 检查是否为今天
 */
export function isToday(date: string | Date): boolean {
  const today = new Date();
  const target = new Date(date);
  
  return (
    today.getDate() === target.getDate() &&
    today.getMonth() === target.getMonth() &&
    today.getFullYear() === target.getFullYear()
  );
}

/**
 * 检查是否为昨天
 */
export function isYesterday(date: string | Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const target = new Date(date);
  
  return (
    yesterday.getDate() === target.getDate() &&
    yesterday.getMonth() === target.getMonth() &&
    yesterday.getFullYear() === target.getFullYear()
  );
}

// ====================
// 颜色工具
// ====================

/**
 * 生成随机颜色
 */
export function generateRandomColor(): string {
  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#eab308', // yellow
    '#84cc16', // lime
    '#22c55e', // green
    '#10b981', // emerald
    '#06b6d4', // cyan
    '#0ea5e9', // sky
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#a855f7', // purple
    '#d946ef', // fuchsia
    '#ec4899', // pink
    '#f43f5e', // rose
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * 生成哈希颜色（基于字符串）
 */
export function generateHashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

/**
 * 为标注类生成颜色
 */
export function generateClassColor(className: string, existingColors: Map<string, string>): string {
  // 如果已存在，返回现有颜色
  if (existingColors.has(className)) {
    return existingColors.get(className)!;
  }
  
  // 生成新颜色
  let color: string;
  let attempts = 0;
  const maxAttempts = 50;
  
  do {
    color = generateRandomColor();
    attempts++;
    
    // 确保颜色不重复
    if (!Array.from(existingColors.values()).includes(color)) {
      break;
    }
  } while (attempts < maxAttempts);
  
  existingColors.set(className, color);
  return color;
}

/**
 * 获取对比色（黑或白）
 */
export function getContrastColor(hexColor: string): string {
  // 移除#号并转换为RGB
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // 计算亮度
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  return brightness > 128 ? '#000000' : '#ffffff';
}

// ====================
// 字符串工具
// ====================

/**
 * 截断字符串
 */
export function truncate(str: string, length = 50, suffix = '...'): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + suffix;
}

/**
 * 生成随机ID
 */
export function generateId(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 生成UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 清理文件名
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[/\\?%*:|"<>]/g, '-') // 替换非法字符
    .replace(/\s+/g, '_') // 空格替换为下划线
    .toLowerCase()
    .slice(0, 255); // 限制长度
}

/**
 * 提取文件扩展名
 */
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex === -1 ? '' : filename.slice(lastDotIndex + 1).toLowerCase();
}

/**
 * 检查文件类型
 */
export function isImageFile(filename: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff'];
  const extension = getFileExtension(filename);
  return imageExtensions.includes(extension);
}

export function isVideoFile(filename: string): boolean {
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
  const extension = getFileExtension(filename);
  return videoExtensions.includes(extension);
}

export function isAnnotationFile(filename: string): boolean {
  const annotationExtensions = ['txt', 'json', 'xml', 'csv', 'yolo'];
  const extension = getFileExtension(filename);
  return annotationExtensions.includes(extension);
}

// ====================
// 数学工具
// ====================

/**
 * 计算两点距离
 */
export function calculateDistance(
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 计算矩形面积
 */
export function calculateRectangleArea(width: number, height: number): number {
  return width * height;
}

/**
 * 计算交集面积
 */
export function calculateIntersectionArea(
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number }
): number {
  const x1 = Math.max(rect1.x, rect2.x);
  const y1 = Math.max(rect1.y, rect2.y);
  const x2 = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
  const y2 = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);
  
  if (x2 <= x1 || y2 <= y1) {
    return 0;
  }
  
  return (x2 - x1) * (y2 - y1);
}

/**
 * 计算IoU（Intersection over Union）
 */
export function calculateIoU(
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number }
): number {
  const intersection = calculateIntersectionArea(rect1, rect2);
  const area1 = calculateRectangleArea(rect1.width, rect1.height);
  const area2 = calculateRectangleArea(rect2.width, rect2.height);
  const union = area1 + area2 - intersection;
  
  return union === 0 ? 0 : intersection / union;
}

/**
 * 标准化坐标到0-1范围
 */
export function normalizeCoordinates(
  coordinates: { x: number; y: number; width?: number; height?: number },
  canvasSize: { width: number; height: number }
): { x: number; y: number; width?: number; height?: number } {
  return {
    x: coordinates.x / canvasSize.width,
    y: coordinates.y / canvasSize.height,
    width: coordinates.width ? coordinates.width / canvasSize.width : undefined,
    height: coordinates.height ? coordinates.height / canvasSize.height : undefined,
  };
}

/**
 * 反标准化坐标（从0-1到实际像素）
 */
export function denormalizeCoordinates(
  coordinates: { x: number; y: number; width?: number; height?: number },
  canvasSize: { width: number; height: number }
): { x: number; y: number; width?: number; height?: number } {
  return {
    x: coordinates.x * canvasSize.width,
    y: coordinates.y * canvasSize.height,
    width: coordinates.width ? coordinates.width * canvasSize.width : undefined,
    height: coordinates.height ? coordinates.height * canvasSize.height : undefined,
  };
}

// ====================
// 数组工具
// ====================

/**
 * 数组去重
 */
export function uniqueArray<T>(array: T[], key?: keyof T): T[] {
  if (!key) {
    return Array.from(new Set(array));
  }
  
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * 数组分组
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    groups[groupKey] = groups[groupKey] || [];
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * 数组分块
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * 数组排序
 */
export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// ====================
// 对象工具
// ====================

/**
 * 深拷贝对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const clonedObj = {} as { [key: string]: any };
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj as T;
  }
  return obj;
}

/**
 * 对象属性是否存在
 */
export function hasProperty(obj: any, path: string): boolean {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current == null || !current.hasOwnProperty(key)) {
      return false;
    }
    current = current[key];
  }
  
  return true;
}

/**
 * 获取对象属性值
 */
export function getProperty(obj: any, path: string, defaultValue?: any): any {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current == null || !current.hasOwnProperty(key)) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current;
}

/**
 * 设置对象属性值
 */
export function setProperty(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current.hasOwnProperty(key) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

// ====================
// 验证工具
// ====================

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证密码强度
 */
export function validatePassword(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('密码长度至少8位');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('密码需要包含小写字母');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('密码需要包含大写字母');
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    feedback.push('密码需要包含数字');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push('密码需要包含特殊字符');
  } else {
    score += 1;
  }

  return {
    isValid: score >= 4,
    score,
    feedback,
  };
}

// ====================
// 异步工具
// ====================

/**
 * 延迟执行
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  attempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < attempts - 1) {
        await delay(delayMs);
      }
    }
  }
  
  throw lastError!;
}

/**
 * 并发限制
 */
export function pLimit(concurrency: number) {
  const queue: Array<() => Promise<any>> = [];
  let activeCount = 0;

  const next = () => {
    activeCount--;
    if (queue.length > 0) {
      const fn = queue.shift();
      fn && fn();
    }
  };

  const run = async (fn: () => Promise<any>, resolve: any, reject: any) => {
    activeCount++;
    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      next();
    }
  };

  const enqueue = (fn: () => Promise<any>) => {
    return new Promise((resolve, reject) => {
      const task = () => run(fn, resolve, reject);
      if (activeCount < concurrency) {
        task();
      } else {
        queue.push(task);
      }
    });
  };

  return enqueue;
}

// ====================
// 本地存储工具
// ====================

/**
 * 安全地设置localStorage
 */
export function setLocalStorage(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
    return false;
  }
}

/**
 * 安全地获取localStorage
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Failed to read from localStorage:', error);
    return defaultValue;
  }
}

/**
 * 删除localStorage项
 */
export function removeLocalStorage(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
    return false;
  }
}

// ====================
// URL工具
// ====================

/**
 * 构建查询参数
 */
export function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams();
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => query.append(key, String(item)));
      } else {
        query.append(key, String(value));
      }
    }
  }
  
  return query.toString();
}

/**
 * 解析查询参数
 */
export function parseQueryString(queryString: string): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {};
  const urlParams = new URLSearchParams(queryString);
  
  for (const [key, value] of urlParams.entries()) {
    if (params[key]) {
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value);
      } else {
        params[key] = [params[key] as string, value];
      }
    } else {
      params[key] = value;
    }
  }
  
  return params;
}

// ====================
// 性能工具
// ====================

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 测量函数执行时间
 */
export function measureTime<T>(fn: () => T): { result: T; time: number } {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  return { result, time: end - start };
}

export async function measureTimeAsync<T>(fn: () => Promise<T>): Promise<{ result: T; time: number }> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return { result, time: end - start };
}