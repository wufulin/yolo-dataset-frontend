// 数据集相关类型定义
export interface Dataset {
  dataset_id: string;
  name: string;
  description?: string;
  owner_id: string;
  owner: {
    username: string;
    email: string;
    profile: {
      first_name: string;
      last_name: string;
      avatar_url?: string;
    };
  };
  collaborators: Array<{
    user_id: string;
    role: 'viewer' | 'annotator' | 'editor' | 'admin';
    added_at: string;
    added_by: string;
  }>;
  yolo_config: {
    names: string[];
    nc: number;
    train: string;
    val: string;
    test?: string;
    class_colors: Record<string, string>;
  };
  statistics: {
    total_images: number;
    train_images: number;
    val_images: number;
    test_images: number;
    total_annotations: number;
    annotations_by_class: Record<string, number>;
  };
  status: 'draft' | 'processing' | 'ready' | 'archived';
  privacy: 'private' | 'public' | 'team';
  tags: string[];
  metadata: {
    project_type: 'object_detection' | 'segmentation';
    license?: string;
    source?: string;
  };
  split_config?: {
    train_ratio: number;
    val_ratio: number;
    test_ratio: number;
    stratify: boolean;
    random_seed: number;
  };
  created_at: string;
  updated_at: string;
  last_accessed_at?: string;
  is_favorite: boolean;
}

// 后端 API 返回的数据集类型（简化版）
export interface DatasetResponse {
  id: string;
  name: string;
  description?: string;
  dataset_type: 'detect' | 'obb' | 'segment' | 'pose' | 'classify';
  class_names: string[];
  num_images: number;
  num_annotations: number;
  splits: {
    train: number;
    val: number;
    test: number;
  };
  created_at: string;
  updated_at: string;
  status?: string;
}

export interface DatasetStatistics {
  basic_stats: {
    total_images: number;
    train_images: number;
    val_images: number;
    test_images: number;
    total_annotations: number;
    average_objects_per_image: number;
  };
  class_distribution: {
    annotations_by_class: Record<string, number>;
    percentages_by_class: Record<string, number>;
  };
  image_sizes: {
    min: { width: number; height: number };
    max: { width: number; height: number };
    average: { width: number; height: number };
  };
  quality_metrics: {
    average_brightness: number;
    average_contrast: number;
    average_sharpness: number;
    blur_ratio: number;
  };
  last_updated: string;
}

export interface CreateDatasetRequest {
  name: string;
  description?: string;
  privacy: 'private' | 'public' | 'team';
  tags?: string[];
  metadata: {
    project_type: 'object_detection' | 'segmentation';
    license?: string;
    source?: string;
  };
  yolo_config: {
    names: string[];
    class_colors?: Record<string, string>;
  };
  split_config?: {
    train_ratio: number;
    val_ratio: number;
    test_ratio: number;
    stratify?: boolean;
    random_seed?: number;
  };
}

export interface UpdateDatasetRequest {
  name?: string;
  description?: string;
  privacy?: 'private' | 'public' | 'team';
  tags?: string[];
  status?: 'draft' | 'processing' | 'ready' | 'archived';
  is_favorite?: boolean;
  yolo_config?: {
    names?: string[];
    class_colors?: Record<string, string>;
  };
  metadata?: {
    license?: string;
    source?: string;
  };
}

export interface DatasetListResponse {
  success: boolean;
  data: Dataset[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface DatasetDetailResponse {
  success: boolean;
  data: Dataset;
  message?: string;
}

export interface DatasetStatisticsResponse {
  success: boolean;
  data: DatasetStatistics;
  message?: string;
}

// 数据集查询参数
export interface DatasetQueryParams {
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'created_at' | 'updated_at' | 'total_images' | 'total_annotations';
  sort_order?: 'asc' | 'desc';
  search?: string;
  tags?: string;
  privacy?: 'private' | 'public' | 'team';
  status?: 'draft' | 'processing' | 'ready' | 'archived';
  is_favorite?: boolean;
}

// 数据集列表参数（别名，用于向后兼容）
export type DatasetListParams = DatasetQueryParams;
