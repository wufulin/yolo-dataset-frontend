import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  QueryParams,
  User,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  Dataset,
  DatasetListParams,
  DatasetStatistics,
  YOLOAnnotation,
  AnnotationClass,
  UploadProgress,
  UploadOptions,
  Image,
  ImageListParams,
  ImageDetail,
  ExportConfig,
  ImportConfig,
  CollaborationSession,
  APIUsageStats,
} from '@/types';

// API配置
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token刷新锁
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  
  failedQueue = [];
};

// JWT token管理
class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  setTokens(tokens: AuthTokens) {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(`${API_CONFIG.baseURL}/auth/refresh`, {
        refresh_token: this.refreshToken,
      });

      const { access_token } = response.data.data;
      this.accessToken = access_token;
      
      return access_token;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }
}

const tokenManager = new TokenManager();

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 如果正在刷新token，将请求添加到队列中
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await tokenManager.refreshAccessToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenManager.clearTokens();
        
        // 重定向到登录页面
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// 错误处理工具
const handleApiError = (error: unknown): never => {
  // 检查是否是 axios 错误
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string; error?: { message?: string } } } };
    // 服务器响应错误
    const errorData = axiosError.response?.data;
    const errorMessage = errorData?.message || errorData?.error?.message || '服务器错误';
    throw new Error(errorMessage);
  } else if (error && typeof error === 'object' && 'request' in error) {
    // 网络错误
    throw new Error('网络连接失败，请检查网络连接');
  } else if (error instanceof Error) {
    // 其他错误
    throw new Error(error.message || '未知错误');
  } else {
    // 未知错误类型
    throw new Error('未知错误');
  }
};

// === 认证API ===
export const authApi = {
  // 用户登录
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await apiClient.post<ApiResponse<{
        user: User;
        tokens: AuthTokens;
      }>>('/auth/login', credentials);

      if (response.data.success && response.data.data) {
        const { user, tokens } = response.data.data;
        tokenManager.setTokens(tokens);
        return user;
      }
      
      throw new Error(response.data.message || '登录失败');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 用户注册
  async register(data: RegisterData): Promise<User> {
    try {
      const response = await apiClient.post<ApiResponse<{
        user: User;
        tokens: AuthTokens;
      }>>('/auth/register', data);

      if (response.data.success && response.data.data) {
        const { user, tokens } = response.data.data;
        tokenManager.setTokens(tokens);
        return user;
      }
      
      throw new Error(response.data.message || '注册失败');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 刷新token
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/refresh', {
        refresh_token: refreshToken,
      });

      if (response.data.success && response.data.data) {
        const tokens = response.data.data;
        tokenManager.setTokens(tokens);
        return tokens;
      }
      
      throw new Error(response.data.message || 'Token刷新失败');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 获取当前用户信息
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/auth/me');

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || '获取用户信息失败');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 用户登出
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // 即使登出失败也清除本地token
    } finally {
      tokenManager.clearTokens();
    }
  },
};

// === 数据集API ===
export const datasetApi = {
  // 获取数据集列表
  async getDatasets(params?: DatasetListParams & QueryParams): Promise<PaginatedResponse<Dataset>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Dataset>>('/datasets', {
        params,
      });

      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 获取数据集详情
  async getDataset(id: string): Promise<Dataset> {
    try {
      const response = await apiClient.get<ApiResponse<Dataset>>(`/datasets/${id}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || '获取数据集详情失败');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 创建数据集
  async createDataset(data: Omit<Dataset, 'id' | 'owner_id' | 'created_at' | 'updated_at'>): Promise<Dataset> {
    try {
      const response = await apiClient.post<ApiResponse<Dataset>>('/datasets', data);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || '创建数据集失败');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 更新数据集
  async updateDataset(id: string, data: Partial<Dataset>): Promise<Dataset> {
    try {
      const response = await apiClient.patch<ApiResponse<Dataset>>(`/datasets/${id}`, data);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || '更新数据集失败');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 删除数据集
  async deleteDataset(id: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse>(`/datasets/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || '删除数据集失败');
      }
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 获取数据集统计信息
  async getDatasetStatistics(id: string): Promise<DatasetStatistics> {
    try {
      const response = await apiClient.get<ApiResponse<DatasetStatistics>>(`/datasets/${id}/statistics`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || '获取统计数据失败');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 导出数据集
  async exportDataset(id: string, config: ExportConfig): Promise<{ download_url: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{ download_url: string }>>(`/datasets/${id}/export`, config);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || '导出数据集失败');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 导入数据集
  async importDataset(config: ImportConfig, files: File[]): Promise<{ task_id: string }> {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });
      formData.append('config', JSON.stringify(config));

      const response = await apiClient.post<ApiResponse<{ task_id: string }>>('/datasets/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || '导入数据集失败');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 分享数据集
  async shareDataset(id: string, emails: string[], permission: 'viewer' | 'editor' | 'annotator'): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse>(`/datasets/${id}/share`, {
        emails,
        permission,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || '分享数据集失败');
      }
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// === 图像API ===
export const imageApi = {
  // 获取图像列表
  async getImages(datasetId: string, params?: ImageListParams & QueryParams): Promise<PaginatedResponse<Image>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Image>>(`/datasets/${datasetId}/images`, {
        params,
      });

      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 获取图像详情
  async getImage(datasetId: string, imageId: string): Promise<ImageDetail> {
    try {
      const response = await apiClient.get<ApiResponse<ImageDetail>>(`/datasets/${datasetId}/images/${imageId}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || '获取图像详情失败');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 获取缩略图
  async getThumbnail(datasetId: string, imageId: string, size: 'small' | 'medium' | 'large' = 'medium'): Promise<string> {
    try {
      const response = await apiClient.get<ApiResponse<{ url: string }>>(
        `/datasets/${datasetId}/images/${imageId}/thumbnail`,
        {
          params: { size },
        }
      );

      if (response.data.success && response.data.data) {
        return response.data.data.url;
      }
      
      throw new Error(response.data.message || '获取缩略图失败');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 删除图像
  async deleteImage(datasetId: string, imageId: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse>(`/datasets/${datasetId}/images/${imageId}`);

      if (!response.data.success) {
        throw new Error(response.data.message || '删除图像失败');
      }
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// === 标注API ===
export const annotationApi = {
  // 获取图像标注
  async getAnnotations(datasetId: string, imageId: string): Promise<YOLOAnnotation[]> {
    try {
      const response = await apiClient.get<ApiResponse<YOLOAnnotation[]>>(
        `/datasets/${datasetId}/images/${imageId}/annotations`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || '获取标注失败');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 创建标注
  async createAnnotation(
    datasetId: string,
    imageId: string,
    annotation: Omit<YOLOAnnotation, 'id' | 'created_at' | 'updated_at'>
  ): Promise<YOLOAnnotation> {
    try {
      const response = await apiClient.post<ApiResponse<YOLOAnnotation>>(
        `/datasets/${datasetId}/images/${imageId}/annotations`,
        annotation
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || '创建标注失败');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 更新标注
  async updateAnnotation(
    datasetId: string,
    imageId: string,
    annotationId: string,
    data: Partial<YOLOAnnotation>
  ): Promise<YOLOAnnotation> {
    try {
      const response = await apiClient.patch<ApiResponse<YOLOAnnotation>>(
        `/datasets/${datasetId}/images/${imageId}/annotations/${annotationId}`,
        data
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || '更新标注失败');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 删除标注
  async deleteAnnotation(datasetId: string, imageId: string, annotationId: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse>(
        `/datasets/${datasetId}/images/${imageId}/annotations/${annotationId}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || '删除标注失败');
      }
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 批量操作标注
  async batchUpdateAnnotations(
    datasetId: string,
    imageId: string,
    operations: Array<{
      action: 'create' | 'update' | 'delete';
      annotation?: Omit<YOLOAnnotation, 'id' | 'created_at' | 'updated_at'>;
      annotation_id?: string;
      data?: Partial<YOLOAnnotation>;
    }>
  ): Promise<{ created: YOLOAnnotation[]; updated: YOLOAnnotation[]; deleted: string[] }> {
    try {
      const response = await apiClient.post<ApiResponse<{
        created: YOLOAnnotation[];
        updated: YOLOAnnotation[];
        deleted: string[];
      }>>(`/datasets/${datasetId}/images/${imageId}/annotations/batch`, {
        operations,
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || '批量操作标注失败');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 获取标注类
  async getAnnotationClasses(datasetId: string): Promise<AnnotationClass[]> {
    try {
      const response = await apiClient.get<ApiResponse<AnnotationClass[]>>(`/datasets/${datasetId}/classes`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || '获取标注类失败');
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// === 上传API ===
export const uploadApi = {
  // 初始化上传
  async initiateUpload(file: File, datasetId: string, options?: UploadOptions): Promise<{
    upload_id: string;
    chunk_count: number;
    chunk_size: number;
  }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('dataset_id', datasetId);
      if (options) {
        formData.append('options', JSON.stringify(options));
      }

      const response = await apiClient.post<ApiResponse<{
        upload_id: string;
        chunk_count: number;
        chunk_size: number;
      }>>('/upload/initiate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || '初始化上传失败');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 上传分片
  async uploadChunk(uploadId: string, chunkIndex: number, chunkData: Blob, chunkHash: string): Promise<{
    success: boolean;
    chunk_index: number;
    chunk_hash: string;
  }> {
    try {
      const formData = new FormData();
      formData.append('chunk', chunkData);
      formData.append('chunk_index', chunkIndex.toString());
      formData.append('chunk_hash', chunkHash);

      const response = await apiClient.post<ApiResponse<{
        success: boolean;
        chunk_index: number;
        chunk_hash: string;
      }>>(`/upload/${uploadId}/chunk`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || '上传分片失败');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 完成上传
  async completeUpload(uploadId: string, fileHash: string): Promise<{
    success: boolean;
    image_id: string;
    dataset_id: string;
  }> {
    try {
      const response = await apiClient.post<ApiResponse<{
        success: boolean;
        image_id: string;
        dataset_id: string;
      }>>(`/upload/${uploadId}/complete`, {
        file_hash: fileHash,
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || '完成上传失败');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 获取上传状态
  async getUploadStatus(uploadId: string): Promise<UploadProgress> {
    try {
      const response = await apiClient.get<ApiResponse<UploadProgress>>(`/upload/${uploadId}/status`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || '获取上传状态失败');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 取消上传
  async cancelUpload(uploadId: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse>(`/upload/${uploadId}`);

      if (!response.data.success) {
        throw new Error(response.data.message || '取消上传失败');
      }
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// === 协作API ===
export const collaborationApi = {
  // 创建协作会话
  async createSession(datasetId: string): Promise<CollaborationSession> {
    try {
      const response = await apiClient.post<ApiResponse<CollaborationSession>>(`/datasets/${datasetId}/collaboration`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || '创建协作会话失败');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 加入协作会话
  async joinSession(sessionId: string): Promise<CollaborationSession> {
    try {
      const response = await apiClient.post<ApiResponse<CollaborationSession>>(`/collaboration/${sessionId}/join`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || '加入协作会话失败');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 离开协作会话
  async leaveSession(sessionId: string): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse>(`/collaboration/${sessionId}/leave`);

      if (!response.data.success) {
        throw new Error(response.data.message || '离开协作会话失败');
      }
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// === 分析API ===
export const analyticsApi = {
  // 获取用户活动统计
  async getUserStats(dateRange: { start: string; end: string }): Promise<{
    total_datasets: number;
    total_images: number;
    total_annotations: number;
    daily_activity: Array<{
      date: string;
      datasets_created: number;
      images_uploaded: number;
      annotations_made: number;
    }>;
  }> {
    try {
      const response = await apiClient.get<ApiResponse<{
        total_datasets: number;
        total_images: number;
        total_annotations: number;
        daily_activity: Array<{
          date: string;
          datasets_created: number;
          images_uploaded: number;
          annotations_made: number;
        }>;
      }>>('/analytics/user-stats', {
        params: dateRange,
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || '获取用户统计失败');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // 获取API使用统计
  async getAPIUsageStats(dateRange: { start: string; end: string }): Promise<APIUsageStats[]> {
    try {
      const response = await apiClient.get<ApiResponse<APIUsageStats[]>>('/analytics/api-usage', {
        params: dateRange,
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || '获取API使用统计失败');
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// 导出所有API
export const api = {
  auth: authApi,
  dataset: datasetApi,
  image: imageApi,
  annotation: annotationApi,
  upload: uploadApi,
  collaboration: collaborationApi,
  analytics: analyticsApi,
};

// 导出TokenManager实例
export { tokenManager };
export default api;