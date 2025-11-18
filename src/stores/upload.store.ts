import { create } from 'zustand';
import { 
  UploadProgress, 
  UploadConfig, 
  UploadEvent, 
  UploadEventType,
  UPLOAD_CONSTANTS,
  ResumeMetadata
} from '../types';
import { uploadAPI } from '../lib/api';

interface UploadState {
  // 上传统计
  totalUploads: number;
  successfulUploads: number;
  failedUploads: number;
  activeUploads: number;
  
  // 上传配置
  config: UploadConfig;
  
  // 上传会话
  sessions: Map<string, UploadProgress>;
  queue: string[]; // 会话ID队列
  active: Set<string>; // 活跃会话
  paused: Set<string>; // 暂停会话
  completed: Set<string>; // 已完成会话
  failed: Set<string>; // 失败会话
  
  // 断点续传元数据
  resumeMetadata: Map<string, ResumeMetadata>;
  
  // 网络状态
  networkStatus: {
    type: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
    effectiveType: string;
  };
  
  // Actions
  initializeUpload: (file: File, datasetId: string, options?: Partial<UploadConfig>) => Promise<string>;
  startUpload: (sessionId: string) => Promise<void>;
  pauseUpload: (sessionId: string) => void;
  resumeUpload: (sessionId: string) => void;
  cancelUpload: (sessionId: string) => void;
  retryUpload: (sessionId: string) => void;
  removeUpload: (sessionId: string) => void;
  
  // 事件监听
  onUploadEvent: (event: UploadEvent) => void;
  
  // 工具方法
  getUploadProgress: (sessionId: string) => UploadProgress | undefined;
  getAllActiveUploads: () => UploadProgress[];
  getUploadStatistics: () => {
    totalUploads: number;
    successfulUploads: number;
    failedUploads: number;
    activeUploads: number;
    successRate: number;
    averageSpeed: number;
  };
  
  // 配置管理
  updateConfig: (config: Partial<UploadConfig>) => void;
  resetStatistics: () => void;
  
  // 断点续传
  saveResumeMetadata: (sessionId: string, metadata: ResumeMetadata) => void;
  loadResumeMetadata: (sessionId: string) => ResumeMetadata | undefined;
  clearResumeMetadata: (sessionId: string) => void;
  
  // 网络优化
  optimizeConfigForNetwork: () => void;
}

// 默认配置
const defaultConfig: UploadConfig = {
  chunkSize: UPLOAD_CONSTANTS.DEFAULT_CHUNK_SIZE,
  maxConcurrent: UPLOAD_CONSTANTS.MAX_CONCURRENT_UPLOADS,
  maxRetries: UPLOAD_CONSTANTS.MAX_RETRIES,
  retryDelay: UPLOAD_CONSTANTS.RETRY_DELAY,
  enableResume: true,
  enableProgress: true,
  minChunkSize: UPLOAD_CONSTANTS.MIN_CHUNK_SIZE,
  maxChunkSize: UPLOAD_CONSTANTS.MAX_CHUNK_SIZE
};

export const useUploadStore = create<UploadState>((set, get) => ({
  // 初始状态
  totalUploads: 0,
  successfulUploads: 0,
  failedUploads: 0,
  activeUploads: 0,
  
  config: defaultConfig,
  
  sessions: new Map(),
  queue: [],
  active: new Set(),
  paused: new Set(),
  completed: new Set(),
  failed: new Set(),
  
  resumeMetadata: new Map(),
  
  networkStatus: {
    type: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false,
    effectiveType: '4g'
  },
  
  initializeUpload: async (file: File, datasetId: string, options?: Partial<UploadConfig>): Promise<string> => {
    const { config, sessions } = get();
    
    // 验证文件
    if (file.size > UPLOAD_CONSTANTS.MAX_FILE_SIZE) {
      throw new Error(`文件大小超过限制（${UPLOAD_CONSTANTS.MAX_FILE_SIZE / (1024**3)}GB）`);
    }
    
    const sessionId = generateSessionId();
    const mergedConfig = { ...config, ...options };
    
    // 创建上传会话
    const session: UploadProgress = {
      sessionId,
      status: 'initialized',
      progress: {
        uploadedChunks: 0,
        totalChunks: Math.ceil(file.size / mergedConfig.chunkSize),
        uploadedBytes: 0,
        totalBytes: file.size,
        percentage: 0,
        speed: 0,
        estimatedTimeRemaining: 0
      },
      startTime: Date.now(),
      lastUpdateTime: Date.now()
    };
    
    // 保存会话
    sessions.set(sessionId, session);
    
    set(state => ({
      sessions: new Map(sessions),
      queue: [...state.queue, sessionId],
      totalUploads: state.totalUploads + 1
    }));
    
    try {
      // 创建上传会话
      const sessionResponse = await uploadAPI.createSession({
        filename: file.name,
        file_size: file.size,
        file_type: 'image',
        dataset_id: datasetId,
        chunk_size: mergedConfig.chunkSize
      });
      
      if (sessionResponse.success) {
        const { session_id, file_id } = sessionResponse.data;
        
        // 更新会话信息
        const updatedSession = {
          ...session,
          fileId: file_id
        };
        
        sessions.set(sessionId, updatedSession);
        
        set(state => ({
          sessions: new Map(sessions)
        }));
        
        return sessionId;
      } else {
        throw new Error(sessionResponse.error?.message || '创建上传会话失败');
      }
    } catch (error: any) {
      // 清理失败的会话
      sessions.delete(sessionId);
      set(state => ({
        sessions: new Map(sessions),
        queue: state.queue.filter(id => id !== sessionId)
      }));
      throw error;
    }
  },
  
  startUpload: async (sessionId: string) => {
    const { sessions, config } = get();
    const session = sessions.get(sessionId);
    
    if (!session) {
      throw new Error('上传会话不存在');
    }
    
    if (session.status === 'uploading') {
      return; // 已经在上传中
    }
    
    // 更新会话状态
    const updatedSession = {
      ...session,
      status: 'uploading' as const
    };
    
    sessions.set(sessionId, updatedSession);
    
    set(state => ({
      sessions: new Map(sessions),
      active: new Set([...state.active, sessionId]),
      paused: new Set([...state.paused].filter(id => id !== sessionId)),
      activeUploads: state.activeUploads + 1
    }));
    
    try {
      // 开始实际的上传逻辑
      // 这里应该调用实际的上传实现
      await simulateUpload(sessionId, config);
      
      // 上传完成
      get().onUploadEvent({
        type: 'upload_completed',
        sessionId,
        data: { fileId: session.fileId },
        timestamp: Date.now()
      });
      
    } catch (error: any) {
      // 上传失败
      get().onUploadEvent({
        type: 'upload_failed',
        sessionId,
        data: { error: error.message },
        timestamp: Date.now()
      });
    }
  },
  
  pauseUpload: (sessionId: string) => {
    const { sessions } = get();
    const session = sessions.get(sessionId);
    
    if (!session) return;
    
    session.status = 'paused';
    sessions.set(sessionId, session);
    
    set(state => ({
      sessions: new Map(sessions),
      active: new Set([...state.active].filter(id => id !== sessionId)),
      paused: new Set([...state.paused, sessionId])
    }));
    
    get().onUploadEvent({
      type: 'upload_paused',
      sessionId,
      timestamp: Date.now()
    });
  },
  
  resumeUpload: (sessionId: string) => {
    const { sessions } = get();
    const session = sessions.get(sessionId);
    
    if (!session) return;
    
    session.status = 'uploading';
    sessions.set(sessionId, session);
    
    set(state => ({
      sessions: new Map(sessions),
      active: new Set([...state.active, sessionId]),
      paused: new Set([...state.paused].filter(id => id !== sessionId))
    }));
    
    get().onUploadEvent({
      type: 'upload_resumed',
      sessionId,
      timestamp: Date.now()
    });
    
    // 继续上传
    get().startUpload(sessionId);
  },
  
  cancelUpload: (sessionId: string) => {
    const { sessions } = get();
    const session = sessions.get(sessionId);
    
    if (!session) return;
    
    session.status = 'cancelled';
    sessions.set(sessionId, session);
    
    set(state => ({
      sessions: new Map(sessions),
      queue: state.queue.filter(id => id !== sessionId),
      active: new Set([...state.active].filter(id => id !== sessionId)),
      paused: new Set([...state.paused].filter(id => id !== sessionId)),
      activeUploads: Math.max(0, state.activeUploads - 1)
    }));
    
    get().onUploadEvent({
      type: 'upload_cancelled',
      sessionId,
      timestamp: Date.now()
    });
  },
  
  retryUpload: (sessionId: string) => {
    const { sessions, failed } = get();
    
    // 从失败集合中移除
    failed.delete(sessionId);
    
    // 重新开始上传
    get().startUpload(sessionId);
  },
  
  removeUpload: (sessionId: string) => {
    const { sessions } = get();
    sessions.delete(sessionId);
    
    set(state => ({
      sessions: new Map(sessions),
      queue: state.queue.filter(id => id !== sessionId),
      active: new Set([...state.active].filter(id => id !== sessionId)),
      paused: new Set([...state.paused].filter(id => id !== sessionId)),
      completed: new Set([...state.completed].filter(id => id !== sessionId)),
      failed: new Set([...state.failed].filter(id => id !== sessionId))
    }));
    
    // 清理断点续传元数据
    get().clearResumeMetadata(sessionId);
  },
  
  onUploadEvent: (event: UploadEvent) => {
    const { sessions, config } = get();
    const session = sessions.get(event.sessionId);
    
    if (!session) return;
    
    switch (event.type) {
      case 'chunk_completed':
        // 更新进度
        const progress = session.progress;
        progress.uploadedChunks += 1;
        progress.uploadedBytes = Math.min(
          progress.uploadedBytes + config.chunkSize,
          progress.totalBytes
        );
        progress.percentage = (progress.uploadedChunks / progress.totalChunks) * 100;
        
        // 计算速度
        const now = Date.now();
        const timeElapsed = (now - session.lastUpdateTime) / 1000;
        const bytesSinceLastUpdate = config.chunkSize;
        progress.speed = bytesSinceLastUpdate / timeElapsed;
        
        // 估算剩余时间
        const remainingBytes = progress.totalBytes - progress.uploadedBytes;
        progress.estimatedTimeRemaining = remainingBytes / progress.speed;
        
        session.lastUpdateTime = now;
        break;
        
      case 'upload_completed':
        session.status = 'completed';
        session.progress.percentage = 100;
        
        set(state => ({
          successfulUploads: state.successfulUploads + 1,
          activeUploads: Math.max(0, state.activeUploads - 1),
          completed: new Set([...state.completed, event.sessionId])
        }));
        break;
        
      case 'upload_failed':
        session.status = 'failed';
        
        set(state => ({
          failedUploads: state.failedUploads + 1,
          activeUploads: Math.max(0, state.activeUploads - 1),
          failed: new Set([...state.failed, event.sessionId])
        }));
        break;
    }
    
    sessions.set(event.sessionId, session);
    set({ sessions: new Map(sessions) });
  },
  
  getUploadProgress: (sessionId: string) => {
    const { sessions } = get();
    return sessions.get(sessionId);
  },
  
  getAllActiveUploads: () => {
    const { sessions } = get();
    return Array.from(sessions.values()).filter(
      session => session.status === 'uploading'
    );
  },
  
  getUploadStatistics: () => {
    const { totalUploads, successfulUploads, failedUploads, activeUploads } = get();
    
    return {
      totalUploads,
      successfulUploads,
      failedUploads,
      activeUploads,
      successRate: totalUploads > 0 ? (successfulUploads / totalUploads) * 100 : 0,
      averageSpeed: 0 // 这里可以计算平均速度
    };
  },
  
  updateConfig: (newConfig: Partial<UploadConfig>) => {
    set(state => ({
      config: { ...state.config, ...newConfig }
    }));
  },
  
  resetStatistics: () => {
    set({
      totalUploads: 0,
      successfulUploads: 0,
      failedUploads: 0,
      activeUploads: 0
    });
  },
  
  saveResumeMetadata: (sessionId: string, metadata: ResumeMetadata) => {
    const { resumeMetadata } = get();
    resumeMetadata.set(sessionId, metadata);
    set({ resumeMetadata: new Map(resumeMetadata) });
    
    // 保存到本地存储
    try {
      localStorage.setItem(
        `yolo_upload_resume_${sessionId}`,
        JSON.stringify(metadata)
      );
    } catch (error) {
      console.error('Failed to save resume metadata:', error);
    }
  },
  
  loadResumeMetadata: (sessionId: string): ResumeMetadata | undefined => {
    const { resumeMetadata } = get();
    
    // 先从内存中查找
    if (resumeMetadata.has(sessionId)) {
      return resumeMetadata.get(sessionId);
    }
    
    // 从本地存储中加载
    try {
      const stored = localStorage.getItem(`yolo_upload_resume_${sessionId}`);
      if (stored) {
        const metadata = JSON.parse(stored);
        resumeMetadata.set(sessionId, metadata);
        set({ resumeMetadata: new Map(resumeMetadata) });
        return metadata;
      }
    } catch (error) {
      console.error('Failed to load resume metadata:', error);
    }
    
    return undefined;
  },
  
  clearResumeMetadata: (sessionId: string) => {
    const { resumeMetadata } = get();
    resumeMetadata.delete(sessionId);
    set({ resumeMetadata: new Map(resumeMetadata) });
    
    // 清除本地存储
    try {
      localStorage.removeItem(`yolo_upload_resume_${sessionId}`);
    } catch (error) {
      console.error('Failed to clear resume metadata:', error);
    }
  },
  
  optimizeConfigForNetwork: () => {
    const { networkStatus, config } = get();
    
    let optimizedConfig = { ...config };
    
    // 根据网络类型调整配置
    switch (networkStatus.effectiveType) {
      case 'slow-2g':
      case '2g':
        optimizedConfig.chunkSize = 1024 * 1024; // 1MB
        optimizedConfig.maxConcurrent = 1;
        break;
        
      case '3g':
        optimizedConfig.chunkSize = 5 * 1024 * 1024; // 5MB
        optimizedConfig.maxConcurrent = 2;
        break;
        
      case '4g':
      default:
        optimizedConfig.chunkSize = 50 * 1024 * 1024; // 50MB
        optimizedConfig.maxConcurrent = 3;
        break;
    }
    
    // 如果开启了数据保护，减小分片大小
    if (networkStatus.saveData) {
      optimizedConfig.chunkSize = Math.min(optimizedConfig.chunkSize, 5 * 1024 * 1024);
    }
    
    get().updateConfig(optimizedConfig);
  }
}));

// 工具函数
function generateSessionId(): string {
  return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 模拟上传过程（实际项目中需要替换为真实的上传实现）
async function simulateUpload(sessionId: string, config: UploadConfig) {
  const { onUploadEvent } = useUploadStore.getState();
  
  const session = useUploadStore.getState().getUploadProgress(sessionId);
  if (!session) return;
  
  const totalChunks = session.progress.totalChunks;
  
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const currentSession = useUploadStore.getState().getUploadProgress(sessionId);
    if (!currentSession || currentSession.status === 'paused' || currentSession.status === 'cancelled') {
      break;
    }
    
    // 模拟分片上传
    await new Promise(resolve => setTimeout(resolve, 100));
    
    onUploadEvent({
      type: 'chunk_completed',
      sessionId,
      data: { chunkIndex },
      timestamp: Date.now()
    });
  }
  
  // 模拟完成上传
  onUploadEvent({
    type: 'upload_completed',
    sessionId,
    timestamp: Date.now()
  });
}

// 清理过期的断点续传元数据
export const cleanupExpiredResumeMetadata = () => {
  const { resumeMetadata } = useUploadStore.getState();
  const now = Date.now();
  const expiryTime = UPLOAD_CONSTANTS.SESSION_EXPIRY;
  
  for (const [sessionId, metadata] of resumeMetadata.entries()) {
    const age = now - metadata.lastModified.getTime();
    if (age > expiryTime) {
      useUploadStore.getState().clearResumeMetadata(sessionId);
    }
  }
};

// 在客户端初始化时清理过期数据
if (typeof window !== 'undefined') {
  setTimeout(() => {
    cleanupExpiredResumeMetadata();
  }, 5000);
}
