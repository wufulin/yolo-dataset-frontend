'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui';
import { 
  ArrowLeft, 
  Square,
  Type,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface Annotation {
  id: string;
  className: string;
  class_id?: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence?: number;
}

interface ClassInfo {
  id: string;
  name: string;
  color: string;
  class_id?: number;
}

interface BackendAnnotation {
  _id: string;
  class_name: string;
  class_id?: number;
  bbox: {
    x_center: number;
    y_center: number;
    width: number;
    height: number;
  };
  confidence?: number;
}

// 生成颜色的辅助函数
const generateColor = (index: number): string => {
  const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
    '#ff9ff3', '#54a0ff', '#5f27cd', '#48dbfb', '#0abde3',
    '#ee5a6f', '#c44569', '#f368e0', '#ff9ff3', '#00d2d3'
  ];
  return colors[index % colors.length];
};

export default function AnnotateImagePage() {
  const router = useRouter();
  const params = useParams();
  const datasetId = params.id as string;
  const imageId = params.imageId as string;
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [image, setImage] = useState<{
    url: string;
    width: number;
    height: number;
    filename: string;
  } | null>(null);
  
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [currentTool] = useState<'bbox' | 'point'>('bbox');
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [scale] = useState(1);
  const [offset] = useState({ x: 0, y: 0 });
  const [showAnnotations, setShowAnnotations] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      try {
        // 从 sessionStorage 读取图片数据
        const imageDataStr = sessionStorage.getItem('currentImageData');
        if (!imageDataStr) {
          if (isMounted) {
            toast.error('No image data found');
          }
          return;
        }

        const imageData = JSON.parse(imageDataStr);
        
        const loadedImage = {
          url: imageData.file_url,
          width: imageData.width,
          height: imageData.height,
          filename: imageData.filename
        };

        if (isMounted) {
          setImage(loadedImage);
        }
        
        // 转换后端返回的标注数据为前端格式
        // YOLO格式: bbox = { x_center, y_center, width, height } (归一化坐标 0-1)
        // 需要转换为像素坐标
        const convertedAnnotations: Annotation[] = imageData.annotations.map((ann: BackendAnnotation) => ({
          id: ann._id,
          className: ann.class_name,
          class_id: ann.class_id,
          bbox: {
            // 从归一化的 YOLO 格式转换为像素坐标
            x: (ann.bbox.x_center - ann.bbox.width / 2) * imageData.width,
            y: (ann.bbox.y_center - ann.bbox.height / 2) * imageData.height,
            width: ann.bbox.width * imageData.width,
            height: ann.bbox.height * imageData.height
          },
          confidence: ann.confidence
        }));
        
        if (isMounted) {
          setAnnotations(convertedAnnotations);
        }

        // 从 annotations 中提取所有不同的 class_name 作为 classes
        const uniqueClasses = new Map<string, ClassInfo>();
        imageData.annotations.forEach((ann: BackendAnnotation, index: number) => {
          if (!uniqueClasses.has(ann.class_name)) {
            uniqueClasses.set(ann.class_name, {
              id: ann.class_name,
              name: ann.class_name,
              color: generateColor(ann.class_id || index),
              class_id: ann.class_id
            });
          }
        });
        
        const classesArray = Array.from(uniqueClasses.values());
        
        if (isMounted) {
          setClasses(classesArray);
          
          // 设置默认选中第一个类别
          if (classesArray.length > 0) {
            setSelectedClass(classesArray[0]);
          }
        }
      } catch (error) {
        console.error('Failed to load image:', error);
        if (isMounted) {
          toast.error('Failed to load image');
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [imageId]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !image) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw image
    if (imageRef.current) {
      const img = imageRef.current;
      ctx.save();
      ctx.translate(offset.x, offset.y);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      ctx.restore();
    }

    if (!showAnnotations) return;

    // Draw annotations
    annotations.forEach(annotation => {
      const classInfo = classes.find(c => c.id === annotation.className);
      const color = classInfo?.color || '#ff0000';
      
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 / scale; // Adjust line width based on scale
      ctx.setLineDash([]);
      
      // Draw bounding box
      ctx.strokeRect(
        annotation.bbox.x + offset.x,
        annotation.bbox.y + offset.y,
        annotation.bbox.width,
        annotation.bbox.height
      );

      // Draw label background
      const labelText = classInfo?.name || annotation.className;
      ctx.font = `${12 / scale}px Arial`;
      const textMetrics = ctx.measureText(labelText);
      const labelHeight = 20 / scale;
      const labelWidth = textMetrics.width + 10 / scale;
      
      ctx.fillStyle = color;
      ctx.fillRect(
        annotation.bbox.x + offset.x,
        annotation.bbox.y + offset.y - labelHeight,
        labelWidth,
        labelHeight
      );
      
      // Draw label text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(
        labelText,
        annotation.bbox.x + offset.x + 5 / scale,
        annotation.bbox.y + offset.y - 5 / scale
      );

      // Draw selected state
      if (selectedAnnotation === annotation.id) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3 / scale;
        ctx.setLineDash([5 / scale, 5 / scale]);
        ctx.strokeRect(
          annotation.bbox.x + offset.x,
          annotation.bbox.y + offset.y,
          annotation.bbox.width,
          annotation.bbox.height
        );
      }

      ctx.restore();
    });

    // Draw rectangle being drawn
    if (drawing && currentTool === 'bbox') {
      // Can add realtime drawing logic here
    }
  }, [image, annotations, scale, offset, showAnnotations, selectedAnnotation, classes, drawing, currentTool]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - offset.x) / scale;
    const y = (event.clientY - rect.top - offset.y) / scale;

    if (currentTool === 'bbox' && drawing) {
      // Complete bounding box drawing
      const width = Math.abs(x - currentStart.x);
      const height = Math.abs(y - currentStart.y);
      const xPos = Math.min(x, currentStart.x);
      const yPos = Math.min(y, currentStart.y);

      if (width > 10 && height > 10 && selectedClass) {
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          className: selectedClass.id,
          class_id: selectedClass.class_id,
          bbox: { x: xPos, y: yPos, width, height }
        };
        
        setAnnotations(prev => [...prev, newAnnotation]);
        toast.success(`Added ${selectedClass.name} annotation`);
      }
      
      setDrawing(false);
    }
  };

  const [currentStart, setCurrentStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'bbox') {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left - offset.x) / scale;
      const y = (event.clientY - rect.top - offset.y) / scale;

      setCurrentStart({ x, y });
      setDrawing(true);
    }
  };

  // Removed unused handlers: handleSave, handleZoomIn, handleZoomOut, handleReset

  const handleDeleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
    setSelectedAnnotation(null);
    toast.success('Annotation deleted');
  };

  if (!image) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="relative bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        {/* 装饰性背景元素 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-30"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="group relative flex items-center space-x-2 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 shadow-sm hover:shadow-lg font-semibold px-4 py-2"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Image Annotation - {image.filename}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Dataset: {datasetId} • {annotations.length} annotations
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex h-[calc(100vh-73px)] bg-gray-50 dark:bg-gray-900">
        {/* Left Toolbar */}
        <div className="w-72 bg-white dark:bg-gray-800/70 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto shadow-xl">
          <div className="space-y-6">
            {/* Class Selection */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Square className="h-4 w-4 text-blue-500" />
                Annotation Classes
              </h3>
              <div className="space-y-2">
                {classes.length > 0 ? (
                  classes.map((classInfo) => (
                    <button
                      key={classInfo.id}
                      onClick={() => setSelectedClass(classInfo)}
                      className={`w-full text-left p-3 rounded-lg text-sm border transition-all duration-200 ${
                        selectedClass?.id === classInfo.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/40'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: classInfo.color }}
                        />
                        <span>{classInfo.name}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    No classes available
                  </div>
                )}
              </div>
            </div>

            {/* View Control */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Eye className="h-4 w-4 text-purple-500" />
                View Control
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 shadow-sm"
                  onClick={() => setShowAnnotations(!showAnnotations)}
                >
                  {showAnnotations ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                  {showAnnotations ? 'Hide Annotations' : 'Show Annotations'}
                </Button>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Zoom: {(scale * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Annotation List */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Type className="h-4 w-4 text-green-500" />
                Annotations ({annotations.length})
              </h3>
              <div className="space-y-1">
                {annotations.length > 0 ? (
                  annotations.map((annotation) => {
                    const classInfo = classes.find(c => c.id === annotation.className);
                    return (
                      <div
                        key={annotation.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                          selectedAnnotation === annotation.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                            : 'border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700/60'
                        }`}
                        onClick={() => setSelectedAnnotation(annotation.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: classInfo?.color }}
                            />
                            <span className="text-sm">{classInfo?.name || annotation.className}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAnnotation(annotation.id);
                            }}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          x:{annotation.bbox.x.toFixed(0)}, y:{annotation.bbox.y.toFixed(0)}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    No annotations yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Canvas Area */}
        <div className="flex-1 relative">
          <div className="h-full w-full overflow-hidden bg-gray-100 dark:bg-gray-900 shadow-inner">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="w-full h-full cursor-crosshair"
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={image.url}
              alt={image.filename}
              className="hidden"
              onLoad={() => drawCanvas()}
            />
          </div>
          
          {/* Info Tooltip */}
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
            Selected Class: {selectedClass?.name || 'None'} • Current Tool: {currentTool === 'bbox' ? 'Bounding Box' : 'Point'}
          </div>
        </div>
      </main>
    </div>
  );
}
