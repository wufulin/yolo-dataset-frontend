// 图像和标注相关类型定义
export interface ImageMetadata {
  image_id: string;
  dataset_id: string;
  original_filename: string;
  stored_filename: string;
  file_path: string;
  thumbnail_path?: string;
  dimensions: {
    width: number;
    height: number;
    channels: number;
  };
  file_info: {
    size_bytes: number;
    format: string;
    color_space: string;
    dpi?: { x: number; y: number };
  };
  exif_data?: {
    camera_make?: string;
    camera_model?: string;
    focal_length?: number;
    aperture?: string;
    iso?: number;
    shutter_speed?: string;
    date_taken?: string;
  };
  quality_metrics?: {
    brightness: number;
    contrast: number;
    sharpness: number;
    noise_level: number;
    blur_score: number;
  };
  processing_status: {
    uploaded: boolean;
    processed: boolean;
    thumbnail_generated: boolean;
    quality_analyzed: boolean;
    exif_extracted: boolean;
    ready_for_annotation: boolean;
  };
  metadata: {
    tags?: string[];
    notes?: string;
    source_url?: string;
  };
  uploader_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  usage_count: number;
  annotation_count: number;
}

// YOLO标注格式
export interface YOLOAnnotation {
  class_id: number;
  x_center: number; // 归一化坐标 [0, 1]
  y_center: number; // 归一化坐标 [0, 1]
  width: number;    // 归一化宽度 [0, 1]
  height: number;   // 归一化高度 [0, 1]
  confidence?: number; // 置信度 [0, 1]
  probability?: number; // 概率 [0, 1]
}

// 边界框
export interface BoundingBox {
  x: number; // 左上角x坐标
  y: number; // 左上角y坐标
  width: number;
  height: number;
  x_center?: number; // 中心点x坐标
  y_center?: number; // 中心点y坐标
}

// 分割标注
export interface Segmentation {
  polygon_points: number[][];
  mask_image_url?: string;
  segmentation_type: 'polygon' | 'mask' | 'both';
  area: number;
}

// 标注质量评估
export interface QualityAssessment {
  accuracy_score: number;
  precision_score: number;
  review_status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  review_notes?: string;
  review_date?: string;
}

// 完整的标注对象
export interface Annotation {
  annotation_id: string;
  image_id: string;
  dataset_id: string;
  yolo_annotation: YOLOAnnotation;
  bounding_box: BoundingBox;
  labels: {
    class_name: string;
    display_name: string;
    color: string;
    priority: number;
  };
  segmentation?: Segmentation;
  quality_assessment?: QualityAssessment;
  annotator_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// 创建标注请求
export interface CreateAnnotationRequest {
  yolo_annotation: YOLOAnnotation;
  segmentation?: Segmentation;
  metadata?: {
    creation_method?: 'manual' | 'auto' | 'semi_auto';
    tool_version?: string;
    session_id?: string;
    notes?: string;
  };
}

// 更新标注请求
export interface UpdateAnnotationRequest {
  annotation_id: string;
  yolo_annotation?: YOLOAnnotation;
  quality_notes?: string;
}

// 批量更新标注请求
export interface BatchUpdateAnnotationsRequest {
  updates: Array<{
    annotation_id: string;
    yolo_annotation?: YOLOAnnotation;
    quality_notes?: string;
  }>;
}

// 图像列表响应
export interface ImageListResponse {
  success: boolean;
  data: ImageMetadata[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// 图像详情响应
export interface ImageDetailResponse {
  success: boolean;
  data: ImageMetadata & {
    dataset: {
      dataset_id: string;
      name: string;
      privacy: string;
      owner_id: string;
    };
    annotations?: Annotation[];
    preview_url?: string;
    signed_file_url?: string;
  };
  message?: string;
}

// 标注响应
export interface AnnotationsResponse {
  success: boolean;
  data: {
    image_id: string;
    annotations: Annotation[];
    yolo_format?: string; // YOLO格式的标注文本
    coco_format?: any;     // COCO格式标注对象
    summary: {
      total: number;
      high_quality: number;
      needs_review: number;
      classes: Array<{
        class_name: string;
        count: number;
      }>;
    };
  };
  message?: string;
}

// 批量更新响应
export interface BatchUpdateResponse {
  success: boolean;
  data: {
    results: Array<{
      annotation_id: string;
      success: boolean;
      modified: number;
      error?: string;
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  };
  message?: string;
}

// 图像查询参数
export interface ImageQueryParams {
  dataset_id?: string;
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'filename' | 'file_size' | 'dimensions' | 'usage_count';
  sort_order?: 'asc' | 'desc';
  tags?: string;
  formats?: string; // 逗号分隔的文件格式
  min_width?: number;
  max_width?: number;
  min_height?: number;
  max_height?: number;
  has_annotations?: boolean;
  upload_status?: 'uploading' | 'completed' | 'failed' | 'processing';
  ready_for_annotation?: boolean;
}

// 标注工具类型
export type AnnotationTool = 
  | 'select'
  | 'rectangle'
  | 'polygon'
  | 'point'
  | 'line'
  | 'freehand';

// 标注事件
export interface AnnotationEvent {
  type: 'create' | 'update' | 'delete' | 'select';
  annotation?: Annotation;
  tool?: AnnotationTool;
  coordinates?: {
    x: number;
    y: number;
  };
}

// 画布状态
export interface CanvasState {
  image: HTMLImageElement | null;
  annotations: Annotation[];
  selectedAnnotationId: string | null;
  tool: AnnotationTool;
  zoom: number;
  pan: { x: number; y: number };
  isDragging: boolean;
  showGrid: boolean;
  showLabels: boolean;
}
