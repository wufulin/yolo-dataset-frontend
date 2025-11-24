// 文件上传相关类型定义

// 上传会话创建请求
export interface CreateUploadSessionRequest {
  filename: string;
  file_size: number;
  file_type: 'image' | 'dataset_archive' | 'model';
  dataset_id: string;
  chunk_size?: number; // 分片大小（字节）
  content_type?: string; // 文件MIME类型
  checksum?: string; // SHA256校验和
  metadata?: Record<string, unknown>;
}

// 上传会话响应
export interface UploadSessionResponse {
  success: boolean;
  data: {
    session_id: string;
    file_id: string;
    upload_url: string;
    chunk_size: number;
    total_chunks: number;
    chunk_urls: string[];
    expires_at: string;
  };
  message?: string;
}

// 分片上传响应
export interface ChunkUploadResponse {
  success: boolean;
  data: {
    chunk_number: number;
    chunk_size: number;
    uploaded_at: string;
    chunk_hash: string;
  };
  message?: string;
}

// 上传完成请求
export interface CompleteUploadRequest {
  session_id: string;
  chunk_hashes?: string[]; // 各分片的哈希值
  metadata?: Record<string, unknown>;
}

// 上传完成响应
export interface UploadCompleteResponse {
  success: boolean;
  data: {
    file_id: string;
    file_url: string;
    thumbnail_url?: string;
    file_info: {
      size_bytes: number;
      format: string;
      dimensions: {
        width: number;
        height: number;
        channels: number;
      };
      processing_status: {
        uploaded: boolean;
        processed: boolean;
        thumbnail_generated: boolean;
        quality_analyzed: boolean;
        ready_for_annotation: boolean;
      };
    };
  };
  message?: string;
}

// 上传状态响应
export interface UploadStatusResponse {
  success: boolean;
  data: {
    session_id: string;
    status: 'pending' | 'uploading' | 'completed' | 'failed' | 'expired';
    progress: {
      uploaded_chunks: number;
      total_chunks: number;
      uploaded_bytes: number;
      total_bytes: number;
      percentage: number;
    };
    chunks_status: Array<{
      chunk_number: number;
      uploaded: boolean;
      size: number;
      uploaded_at?: string;
    }>;
    error_message?: string;
    expires_at: string;
  };
  message?: string;
}

// 分片信息
export interface ChunkInfo {
  index: number;
  size: number;
  data: Blob | ArrayBuffer;
  hash?: string;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  uploadId: string;
  retryCount: number;
  uploadedAt?: string;
}

// 上传进度
export interface UploadProgress {
  sessionId: string;
  fileId?: string;
  status: 'initialized' | 'uploading' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress: {
    uploadedChunks: number;
    totalChunks: number;
    uploadedBytes: number;
    totalBytes: number;
    percentage: number;
    speed: number; // bytes/second
    estimatedTimeRemaining: number; // seconds
  };
  currentChunk?: number;
  error?: string;
  startTime: number;
  lastUpdateTime: number;
}

// 上传配置
export interface UploadConfig {
  chunkSize: number; // 分片大小（字节）
  maxConcurrent: number; // 最大并发数
  maxRetries: number; // 最大重试次数
  retryDelay: number; // 重试延迟（毫秒）
  enableResume: boolean; // 启用断点续传
  enableProgress: boolean; // 启用进度追踪
  minChunkSize: number; // 最小分片大小
  maxChunkSize: number; // 最大分片大小
}

// 上传选项（用于 API 调用）
export interface UploadOptions {
  chunk_size?: number; // 分片大小（字节）
  max_concurrent?: number; // 最大并发数
  max_retries?: number; // 最大重试次数
  retry_delay?: number; // 重试延迟（毫秒）
  enable_resume?: boolean; // 启用断点续传
  enable_progress?: boolean; // 启用进度追踪
}

// 文件验证规则
export interface FileValidationRule {
  type: 'size' | 'type' | 'name' | 'count';
  condition: 'max' | 'min' | 'equals' | 'regex' | 'extension';
  value: number | string | RegExp;
  message: string;
}

// 文件验证结果
export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// 上传统计
export interface UploadStatistics {
  totalUploads: number;
  successfulUploads: number;
  failedUploads: number;
  totalBytesUploaded: number;
  averageSpeed: number;
  activeUploads: number;
  completedToday: number;
  errorRate: number;
}

// 网络状态
export interface NetworkStatus {
  type: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  downlink: number; // 下行速度 (Mbps)
  rtt: number; // 往返时间 (ms)
  saveData: boolean; // 是否开启数据保护
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
}

// 上传事件类型
export type UploadEventType = 
  | 'session_created'
  | 'chunk_started'
  | 'chunk_completed'
  | 'chunk_failed'
  | 'upload_completed'
  | 'upload_failed'
  | 'upload_paused'
  | 'upload_resumed'
  | 'upload_cancelled'
  | 'progress_updated';

// 上传事件
export interface UploadEvent {
  type: UploadEventType;
  sessionId: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

// 上传管理器状态
export interface UploadManagerState {
  sessions: Map<string, UploadProgress>;
  queue: string[]; // 会话ID队列
  active: Set<string>; // 活跃会话
  paused: Set<string>; // 暂停会话
  statistics: UploadStatistics;
  networkStatus: NetworkStatus;
  config: UploadConfig;
}

// 断点续传元数据
export interface ResumeMetadata {
  fileId: string;
  filename: string;
  fileSize: number;
  fileHash: string;
  sessionId: string;
  chunks: Map<number, {
    status: 'pending' | 'completed' | 'failed';
    size: number;
    hash?: string;
    uploadedAt?: string;
    retryCount: number;
  }>;
  createdAt: Date;
  lastModified: Date;
}

// 本地存储键前缀
export const UPLOAD_STORAGE_PREFIX = 'yolo_upload_';

// 上传相关常量
export const UPLOAD_CONSTANTS = {
  DEFAULT_CHUNK_SIZE: 50 * 1024 * 1024, // 50MB
  MIN_CHUNK_SIZE: 1024 * 1024, // 1MB
  MAX_CHUNK_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_FILE_SIZE: 100 * 1024 * 1024 * 1024, // 100GB
  MAX_CONCURRENT_UPLOADS: 3,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1秒
  SESSION_EXPIRY: 24 * 60 * 60 * 1000, // 24小时
  PROGRESS_UPDATE_INTERVAL: 100, // 100ms
} as const;

// 支持的文件类型
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/bmp',
  'image/tiff'
] as const;

export const SUPPORTED_ARCHIVE_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/gzip',
  'application/x-tar',
  'application/x-7z-compressed'
] as const;

// 文件大小格式化
export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex > 2 ? 2 : 1)} ${units[unitIndex]}`;
};

// 速度格式化
export const formatSpeed = (bytesPerSecond: number): string => {
  return `${formatFileSize(bytesPerSecond)}/s`;
};

// 时间格式化
export const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.ceil(seconds)}秒`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.ceil(seconds % 60);
  
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分钟`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`;
};
