import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type {
  User,
  Dataset,
  Image,
  YOLOAnnotation,
  AnnotationClass,
  DatasetListParams,
  ImageListParams,
  AnnotationListParams,
  QueryParams,
} from '@/types';

// ====================
// 查询键管理
// ====================

export const queryKeys = {
  // 认证相关
  auth: {
    me: ['auth', 'me'] as const,
  },
  
  // 数据集相关
  datasets: {
    all: ['datasets'] as const,
    lists: (params?: DatasetListParams) => ['datasets', 'list', params] as const,
    detail: (id: string) => ['datasets', 'detail', id] as const,
    statistics: (id: string) => ['datasets', 'statistics', id] as const,
    classes: (id: string) => ['datasets', 'classes', id] as const,
  },
  
  // 图像相关
  images: {
    all: (datasetId: string) => ['images', datasetId] as const,
    lists: (datasetId: string, params?: ImageListParams) => ['images', datasetId, 'list', params] as const,
    detail: (datasetId: string, imageId: string) => ['images', datasetId, 'detail', imageId] as const,
    thumbnail: (datasetId: string, imageId: string, size: string) => ['images', datasetId, 'thumbnail', imageId, size] as const,
  },
  
  // 标注相关
  annotations: {
    all: (datasetId: string, imageId: string) => ['annotations', datasetId, imageId] as const,
    lists: (datasetId: string, imageId: string, params?: AnnotationListParams) => ['annotations', datasetId, imageId, 'list', params] as const,
  },
  
  // 分析相关
  analytics: {
    userStats: (dateRange: { start: string; end: string }) => ['analytics', 'user-stats', dateRange] as const,
    apiUsage: (dateRange: { start: string; end: string }) => ['analytics', 'api-usage', dateRange] as const,
  },
  
  // 上传相关
  upload: {
    status: (uploadId: string) => ['upload', 'status', uploadId] as const,
  },
  
  // 协作相关
  collaboration: {
    session: (sessionId: string) => ['collaboration', 'session', sessionId] as const,
  },
} as const;

// ====================
// 认证查询
// ====================

/**
 * 获取当前用户信息
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: api.auth.getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5分钟
    retry: (failureCount, error: any) => {
      // 如果是401错误，不重试
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// ====================
// 数据集查询
// ====================

/**
 * 获取数据集列表
 */
export function useDatasets(params?: DatasetListParams & QueryParams) {
  return useQuery({
    queryKey: queryKeys.datasets.lists(params),
    queryFn: () => api.dataset.getDatasets(params),
    staleTime: 2 * 60 * 1000, // 2分钟
    keepPreviousData: true,
  });
}

/**
 * 获取数据集详情
 */
export function useDataset(datasetId: string) {
  return useQuery({
    queryKey: queryKeys.datasets.detail(datasetId),
    queryFn: () => api.dataset.getDataset(datasetId),
    enabled: !!datasetId,
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

/**
 * 获取数据集统计信息
 */
export function useDatasetStatistics(datasetId: string) {
  return useQuery({
    queryKey: queryKeys.datasets.statistics(datasetId),
    queryFn: () => api.dataset.getDatasetStatistics(datasetId),
    enabled: !!datasetId,
    staleTime: 10 * 60 * 1000, // 10分钟
  });
}

/**
 * 获取数据集标注类
 */
export function useDatasetClasses(datasetId: string) {
  return useQuery({
    queryKey: queryKeys.datasets.classes(datasetId),
    queryFn: () => api.annotation.getAnnotationClasses(datasetId),
    enabled: !!datasetId,
    staleTime: 30 * 60 * 1000, // 30分钟
  });
}

// ====================
// 图像查询
// ====================

/**
 * 获取图像列表
 */
export function useImages(datasetId: string, params?: ImageListParams & QueryParams) {
  return useQuery({
    queryKey: queryKeys.images.lists(datasetId, params),
    queryFn: () => api.image.getImages(datasetId, params),
    enabled: !!datasetId,
    staleTime: 5 * 60 * 1000, // 5分钟
    keepPreviousData: true,
  });
}

/**
 * 获取图像详情
 */
export function useImageDetail(datasetId: string, imageId: string) {
  return useQuery({
    queryKey: queryKeys.images.detail(datasetId, imageId),
    queryFn: () => api.image.getImage(datasetId, imageId),
    enabled: !!datasetId && !!imageId,
    staleTime: 10 * 60 * 1000, // 10分钟
  });
}

/**
 * 获取图像缩略图URL
 */
export function useImageThumbnail(datasetId: string, imageId: string, size: 'small' | 'medium' | 'large' = 'medium') {
  return useQuery({
    queryKey: queryKeys.images.thumbnail(datasetId, imageId, size),
    queryFn: () => api.image.getThumbnail(datasetId, imageId, size),
    enabled: !!datasetId && !!imageId,
    staleTime: 60 * 60 * 1000, // 1小时
    retry: false,
  });
}

// ====================
// 标注查询
// ====================

/**
 * 获取图像标注
 */
export function useAnnotations(datasetId: string, imageId: string) {
  return useQuery({
    queryKey: queryKeys.annotations.all(datasetId, imageId),
    queryFn: () => api.annotation.getAnnotations(datasetId, imageId),
    enabled: !!datasetId && !!imageId,
    staleTime: 30 * 1000, // 30秒（标注数据经常变化）
  });
}

// ====================
// 分析查询
// ====================

/**
 * 获取用户统计信息
 */
export function useUserStats(dateRange: { start: string; end: string }) {
  return useQuery({
    queryKey: queryKeys.analytics.userStats(dateRange),
    queryFn: () => api.analytics.getUserStats(dateRange),
    enabled: !!dateRange.start && !!dateRange.end,
    staleTime: 15 * 60 * 1000, // 15分钟
  });
}

/**
 * 获取API使用统计
 */
export function useAPIUsageStats(dateRange: { start: string; end: string }) {
  return useQuery({
    queryKey: queryKeys.analytics.apiUsage(dateRange),
    queryFn: () => api.analytics.getAPIUsageStats(dateRange),
    enabled: !!dateRange.start && !!dateRange.end,
    staleTime: 15 * 60 * 1000, // 15分钟
  });
}

// ====================
// 上传查询
// ====================

/**
 * 获取上传状态
 */
export function useUploadStatus(uploadId: string) {
  return useQuery({
    queryKey: queryKeys.upload.status(uploadId),
    queryFn: () => api.upload.getUploadStatus(uploadId),
    enabled: !!uploadId,
    refetchInterval: (data) => {
      // 如果上传未完成，每2秒刷新一次
      if (data?.state === 'uploading' || data?.state === 'pending') {
        return 2000;
      }
      return false;
    },
  });
}

// ====================
// 协作查询
// ====================

/**
 * 获取协作会话信息
 */
export function useCollaborationSession(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.collaboration.session(sessionId),
    queryFn: () => api.collaboration.joinSession(sessionId),
    enabled: !!sessionId,
    staleTime: 10 * 1000, // 10秒
    refetchInterval: 5000, // 每5秒刷新
  });
}

// ====================
// 认证Mutation
// ====================

/**
 * 用户登录
 */
export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.auth.login,
    onSuccess: (user) => {
      // 清除所有缓存
      queryClient.clear();
      // 设置用户信息
      queryClient.setQueryData(queryKeys.auth.me, user);
      toast.success('登录成功');
    },
    onError: (error: any) => {
      toast.error(error.message || '登录失败');
    },
  });
}

/**
 * 用户注册
 */
export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.auth.register,
    onSuccess: (user) => {
      // 清除所有缓存
      queryClient.clear();
      // 设置用户信息
      queryClient.setQueryData(queryKeys.auth.me, user);
      toast.success('注册成功');
    },
    onError: (error: any) => {
      toast.error(error.message || '注册失败');
    },
  });
}

/**
 * 用户登出
 */
export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.auth.logout,
    onSuccess: () => {
      // 清除所有缓存
      queryClient.clear();
      toast.success('已退出登录');
    },
    onError: (error: any) => {
      // 即使登出API失败，也清除本地状态
      queryClient.clear();
      toast.success('已退出登录');
    },
  });
}

// ====================
// 数据集Mutation
// ====================

/**
 * 创建数据集
 */
export function useCreateDataset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.dataset.createDataset,
    onSuccess: (newDataset) => {
      // 更新数据集列表缓存
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets.all });
      queryClient.setQueryData(queryKeys.datasets.detail(newDataset.id), newDataset);
      toast.success('数据集创建成功');
    },
    onError: (error: any) => {
      toast.error(error.message || '创建数据集失败');
    },
  });
}

/**
 * 更新数据集
 */
export function useUpdateDataset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Dataset> }) =>
      api.dataset.updateDataset(id, data),
    onSuccess: (updatedDataset, { id }) => {
      // 更新缓存
      queryClient.setQueryData(queryKeys.datasets.detail(id), updatedDataset);
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets.statistics(id) });
      toast.success('数据集更新成功');
    },
    onError: (error: any) => {
      toast.error(error.message || '更新数据集失败');
    },
  });
}

/**
 * 删除数据集
 */
export function useDeleteDataset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.dataset.deleteDataset,
    onSuccess: (_, datasetId) => {
      // 从缓存中移除
      queryClient.removeQueries({ queryKey: queryKeys.datasets.detail(datasetId) });
      queryClient.removeQueries({ queryKey: queryKeys.datasets.statistics(datasetId) });
      queryClient.removeQueries({ queryKey: queryKeys.datasets.classes(datasetId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets.all });
      toast.success('数据集删除成功');
    },
    onError: (error: any) => {
      toast.error(error.message || '删除数据集失败');
    },
  });
}

/**
 * 分享数据集
 */
export function useShareDataset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ datasetId, emails, permission }: { 
      datasetId: string; 
      emails: string[]; 
      permission: 'viewer' | 'editor' | 'annotator' 
    }) => api.dataset.shareDataset(datasetId, emails, permission),
    onSuccess: (_, { datasetId }) => {
      // 刷新数据集详情
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets.detail(datasetId) });
      toast.success('数据集分享成功');
    },
    onError: (error: any) => {
      toast.error(error.message || '分享数据集失败');
    },
  });
}

// ====================
// 图像Mutation
// ====================

/**
 * 删除图像
 */
export function useDeleteImage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ datasetId, imageId }: { datasetId: string; imageId: string }) =>
      api.image.deleteImage(datasetId, imageId),
    onSuccess: (_, { datasetId, imageId }) => {
      // 从缓存中移除
      queryClient.removeQueries({ queryKey: queryKeys.images.detail(datasetId, imageId) });
      queryClient.removeQueries({ queryKey: queryKeys.images.thumbnail(datasetId, imageId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.images.all(datasetId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets.statistics(datasetId) });
      toast.success('图像删除成功');
    },
    onError: (error: any) => {
      toast.error(error.message || '删除图像失败');
    },
  });
}

// ====================
// 标注Mutation
// ====================

/**
 * 创建标注
 */
export function useCreateAnnotation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ datasetId, imageId, annotation }: { 
      datasetId: string; 
      imageId: string; 
      annotation: Omit<YOLOAnnotation, 'id' | 'created_at' | 'updated_at'> 
    }) => api.annotation.createAnnotation(datasetId, imageId, annotation),
    onMutate: async ({ datasetId, imageId, annotation }) => {
      // 取消相关查询
      await queryClient.cancelQueries({ queryKey: queryKeys.annotations.all(datasetId, imageId) });
      
      // 获取之前的数据
      const previousAnnotations = queryClient.getQueryData<YOLOAnnotation[]>(
        queryKeys.annotations.all(datasetId, imageId)
      );
      
      // 乐观更新
      if (previousAnnotations) {
        const optimisticAnnotation: YOLOAnnotation = {
          ...annotation,
          id: 'temp-' + Date.now(), // 临时ID
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        queryClient.setQueryData(
          queryKeys.annotations.all(datasetId, imageId),
          [...previousAnnotations, optimisticAnnotation]
        );
      }
      
      return { previousAnnotations };
    },
    onError: (error, { datasetId, imageId }, context) => {
      // 回滚到之前的数据
      if (context?.previousAnnotations) {
        queryClient.setQueryData(
          queryKeys.annotations.all(datasetId, imageId),
          context.previousAnnotations
        );
      }
      toast.error(error.message || '创建标注失败');
    },
    onSuccess: (newAnnotation, { datasetId, imageId }) => {
      // 刷新标注列表以获取真实数据
      queryClient.invalidateQueries({ queryKey: queryKeys.annotations.all(datasetId, imageId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets.statistics(datasetId) });
      toast.success('标注创建成功');
    },
  });
}

/**
 * 更新标注
 */
export function useUpdateAnnotation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ datasetId, imageId, annotationId, data }: { 
      datasetId: string; 
      imageId: string; 
      annotationId: string; 
      data: Partial<YOLOAnnotation> 
    }) => api.annotation.updateAnnotation(datasetId, imageId, annotationId, data),
    onMutate: async ({ datasetId, imageId, annotationId, data }) => {
      // 取消相关查询
      await queryClient.cancelQueries({ queryKey: queryKeys.annotations.all(datasetId, imageId) });
      
      // 获取之前的数据
      const previousAnnotations = queryClient.getQueryData<YOLOAnnotation[]>(
        queryKeys.annotations.all(datasetId, imageId)
      );
      
      // 乐观更新
      if (previousAnnotations) {
        const updatedAnnotations = previousAnnotations.map(annotation =>
          annotation.id === annotationId
            ? { ...annotation, ...data, updated_at: new Date().toISOString() }
            : annotation
        );
        
        queryClient.setQueryData(
          queryKeys.annotations.all(datasetId, imageId),
          updatedAnnotations
        );
      }
      
      return { previousAnnotations };
    },
    onError: (error, { datasetId, imageId }, context) => {
      // 回滚到之前的数据
      if (context?.previousAnnotations) {
        queryClient.setQueryData(
          queryKeys.annotations.all(datasetId, imageId),
          context.previousAnnotations
        );
      }
      toast.error(error.message || '更新标注失败');
    },
    onSuccess: (_, { datasetId, imageId }) => {
      // 刷新标注列表以获取真实数据
      queryClient.invalidateQueries({ queryKey: queryKeys.annotations.all(datasetId, imageId) });
      toast.success('标注更新成功');
    },
  });
}

/**
 * 删除标注
 */
export function useDeleteAnnotation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ datasetId, imageId, annotationId }: { 
      datasetId: string; 
      imageId: string; 
      annotationId: string 
    }) => api.annotation.deleteAnnotation(datasetId, imageId, annotationId),
    onMutate: async ({ datasetId, imageId, annotationId }) => {
      // 取消相关查询
      await queryClient.cancelQueries({ queryKey: queryKeys.annotations.all(datasetId, imageId) });
      
      // 获取之前的数据
      const previousAnnotations = queryClient.getQueryData<YOLOAnnotation[]>(
        queryKeys.annotations.all(datasetId, imageId)
      );
      
      // 乐观更新
      if (previousAnnotations) {
        const filteredAnnotations = previousAnnotations.filter(
          annotation => annotation.id !== annotationId
        );
        
        queryClient.setQueryData(
          queryKeys.annotations.all(datasetId, imageId),
          filteredAnnotations
        );
      }
      
      return { previousAnnotations };
    },
    onError: (error, { datasetId, imageId }, context) => {
      // 回滚到之前的数据
      if (context?.previousAnnotations) {
        queryClient.setQueryData(
          queryKeys.annotations.all(datasetId, imageId),
          context.previousAnnotations
        );
      }
      toast.error(error.message || '删除标注失败');
    },
    onSuccess: (_, { datasetId, imageId }) => {
      // 刷新标注列表以获取真实数据
      queryClient.invalidateQueries({ queryKey: queryKeys.annotations.all(datasetId, imageId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets.statistics(datasetId) });
      toast.success('标注删除成功');
    },
  });
}

/**
 * 批量操作标注
 */
export function useBatchUpdateAnnotations() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ datasetId, imageId, operations }: { 
      datasetId: string; 
      imageId: string; 
      operations: Array<{
        action: 'create' | 'update' | 'delete';
        annotation?: Omit<YOLOAnnotation, 'id' | 'created_at' | 'updated_at'>;
        annotation_id?: string;
        data?: Partial<YOLOAnnotation>;
      }>
    }) => api.annotation.batchUpdateAnnotations(datasetId, imageId, operations),
    onSuccess: (_, { datasetId, imageId }) => {
      // 刷新标注列表
      queryClient.invalidateQueries({ queryKey: queryKeys.annotations.all(datasetId, imageId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets.statistics(datasetId) });
      toast.success('批量操作成功');
    },
    onError: (error: any) => {
      toast.error(error.message || '批量操作失败');
    },
  });
}

// ====================
// 导出所有hooks
// ====================

export const hooks = {
  // 查询
  useCurrentUser,
  useDatasets,
  useDataset,
  useDatasetStatistics,
  useDatasetClasses,
  useImages,
  useImageDetail,
  useImageThumbnail,
  useAnnotations,
  useUserStats,
  useAPIUsageStats,
  useUploadStatus,
  useCollaborationSession,
  
  // 认证突变
  useLogin,
  useRegister,
  useLogout,
  
  // 数据集突变
  useCreateDataset,
  useUpdateDataset,
  useDeleteDataset,
  useShareDataset,
  
  // 图像突变
  useDeleteImage,
  
  // 标注突变
  useCreateAnnotation,
  useUpdateAnnotation,
  useDeleteAnnotation,
  useBatchUpdateAnnotations,
};

export default hooks;