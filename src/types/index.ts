// 统一的类型导出
export * from './auth';
export * from './dataset';
export * from './annotation';
export * from './upload';

// API通用响应类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
    request_id?: string;
  };
  message?: string;
  timestamp?: string;
}

// 分页响应
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// 通用查询参数
export interface QueryParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
}

// 状态类型
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// 主题类型
export type Theme = 'light' | 'dark' | 'auto';

// 通知类型
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// 通知项
export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

// 模态框配置
export interface ModalConfig {
  open: boolean;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  maskClosable?: boolean;
}

// 表格列定义
export interface TableColumn<T = unknown> {
  key: string;
  title: string;
  dataIndex: keyof T;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
}

// 表格分页配置
export interface TablePagination {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  pageSizeOptions?: string[];
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
}

// 树形数据结构
export interface TreeNode {
  key: string;
  title: string;
  children?: TreeNode[];
  icon?: React.ReactNode;
  disabled?: boolean;
  selectable?: boolean;
  checkable?: boolean;
  [key: string]: unknown;
}

// 文件树节点
export interface FileTreeNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  path: string;
  size?: number;
  children?: FileTreeNode[];
  parentId?: string;
  metadata?: Record<string, unknown>;
}

// 快捷键配置
export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
  category?: string;
}

// 应用配置
export interface AppConfig {
  api: {
    baseURL: string;
    timeout: number;
    retryAttempts: number;
  };
  upload: {
    chunkSize: number;
    maxConcurrent: number;
    maxRetries: number;
  };
  annotation: {
    defaultTool: string;
    showGrid: boolean;
    showLabels: boolean;
    gridSize: number;
  };
  ui: {
    theme: Theme;
    language: string;
    pageSize: number;
    itemsPerPage: number[];
  };
  features: {
    enableCollaboration: boolean;
    enableRealtimeSync: boolean;
    enableOfflineMode: boolean;
  };
}

// 系统信息
export interface SystemInfo {
  userAgent: string;
  platform: string;
  language: string;
  cookieEnabled: boolean;
  online: boolean;
  screen: {
    width: number;
    height: number;
    colorDepth: number;
  };
  storage: {
    localStorage: boolean;
    sessionStorage: boolean;
    indexedDB: boolean;
  };
  network: {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  };
}

// 性能指标
export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  firstMeaningfulPaint: number;
  speedIndex: number;
  timeToInteractive: number;
}

// 错误信息
export interface ErrorInfo {
  name: string;
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  url: string;
  lineNumber?: number;
  columnNumber?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, unknown>;
}

// 用户反馈
export interface UserFeedback {
  id: string;
  type: 'bug' | 'feature' | 'improvement' | 'general';
  title: string;
  description: string;
  email?: string;
  screenshots?: string[];
  created_at: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
}

// 导出配置
export interface ExportConfig {
  format: 'yolo' | 'coco' | 'pascal_voc' | 'json';
  include_images?: boolean;
  include_annotations?: boolean;
  include_metadata?: boolean;
  split_by_ratio?: {
    train: number;
    val: number;
    test: number;
  };
  output_directory?: string;
  compression_level?: number;
}

// 导入配置
export interface ImportConfig {
  format: 'yolo' | 'coco' | 'pascal_voc' | 'label_studio';
  validate_annotations?: boolean;
  generate_missing_annotations?: boolean;
  class_mapping?: Record<string, string>;
  auto_split?: boolean;
  split_ratios?: {
    train: number;
    val: number;
    test: number;
  };
}

// 协作会话
export interface CollaborationSession {
  session_id: string;
  dataset_id: string;
  participants: Array<{
    user_id: string;
    username: string;
    role: 'owner' | 'editor' | 'annotator' | 'viewer';
    joined_at: string;
    last_active: string;
  }>;
  permissions: {
    can_edit: boolean;
    can_annotate: boolean;
    can_comment: boolean;
    can_export: boolean;
  };
  settings: {
    auto_save: boolean;
    show_cursor: boolean;
    show_selection: boolean;
    real_time_sync: boolean;
  };
  status: 'active' | 'paused' | 'ended';
  created_at: string;
  updated_at: string;
}

// 实时事件
export interface RealtimeEvent {
  id: string;
  type: 'annotation_created' | 'annotation_updated' | 'annotation_deleted' | 'user_joined' | 'user_left' | 'cursor_moved' | 'selection_changed';
  user_id: string;
  dataset_id: string;
  data: unknown;
  timestamp: number;
}

// 审计日志
export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, unknown>;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  success: boolean;
  error_message?: string;
}

// API使用统计
export interface APIUsageStats {
  endpoint: string;
  method: string;
  status_code: number;
  response_time: number;
  request_size: number;
  response_size: number;
  timestamp: string;
  user_id?: string;
}

// 数据分析
export interface AnalyticsData {
  date_range: {
    start: string;
    end: string;
  };
  metrics: {
    total_datasets: number;
    total_images: number;
    total_annotations: number;
    active_users: number;
    storage_used: number;
    api_requests: number;
    error_rate: number;
  };
  trends: {
    datasets_growth: number;
    images_growth: number;
    annotations_growth: number;
    users_growth: number;
  };
  breakdown: {
    by_dataset_type: Record<string, number>;
    by_annotation_quality: Record<string, number>;
    by_user_activity: Record<string, number>;
    by_api_endpoint: Record<string, number>;
  };
}
