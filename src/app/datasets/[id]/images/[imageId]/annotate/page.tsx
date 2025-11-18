'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import Navigation from '@/components/layout/Navigation';
import { 
  ArrowLeft, 
  Save, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Move,
  Square,
  Circle,
  Type,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface Annotation {
  id: string;
  className: string;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence?: number;
}

const CLASSES = [
  { id: 'car', name: 'Car', color: '#ff6b6b' },
  { id: 'truck', name: 'Truck', color: '#4ecdc4' },
  { id: 'bus', name: 'Bus', color: '#45b7d1' },
  { id: 'motorcycle', name: 'Motorcycle', color: '#96ceb4' },
  { id: 'bicycle', name: 'Bicycle', color: '#feca57' },
  { id: 'person', name: 'Person', color: '#ff9ff3' },
  { id: 'traffic_light', name: 'Traffic Light', color: '#54a0ff' },
  { id: 'traffic_sign', name: 'Traffic Sign', color: '#5f27cd' }
];

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
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [drawing, setDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'bbox' | 'point'>('bbox');
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);

  useEffect(() => {
    loadImage();
  }, [imageId]);

  useEffect(() => {
    drawCanvas();
  }, [image, annotations, scale, offset, showAnnotations, selectedAnnotation]);

  const loadImage = async () => {
    try {
      // Mock load image
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockImage = {
        url: `https://picsum.photos/800/600?random=${imageId}`,
        width: 800,
        height: 600,
        filename: `image_${imageId}.jpg`
      };

      setImage(mockImage);
      
      // Mock load existing annotations
      const mockAnnotations: Annotation[] = [
        {
          id: '1',
          className: 'car',
          bbox: { x: 100, y: 150, width: 200, height: 100 }
        },
        {
          id: '2',
          className: 'person',
          bbox: { x: 400, y: 200, width: 80, height: 160 }
        }
      ];
      
      setAnnotations(mockAnnotations);
    } catch (error) {
      toast.error('Failed to load image');
    }
  };

  const drawCanvas = () => {
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
      const classInfo = CLASSES.find(c => c.id === annotation.className);
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
  };

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

      if (width > 10 && height > 10) {
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          className: selectedClass.id,
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

  const handleSave = async () => {
    try {
      // Mock save annotations
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Annotations saved');
      router.push(`/datasets/${datasetId}`);
    } catch (error) {
      toast.error('Save failed');
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleReset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

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
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Image Annotation - {image.filename}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Dataset: {datasetId} • {annotations.length} annotations
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset View
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4 mr-2" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4 mr-2" />
              </Button>
              <Button onClick={handleSave} className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Save</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex h-[calc(100vh-73px)]">
        {/* Left Toolbar */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Tool Selection */}
            <div>
              <h3 className="font-medium mb-3">Annotation Tools</h3>
              <div className="space-y-2">
                <Button
                  variant={currentTool === 'bbox' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setCurrentTool('bbox')}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Bounding Box
                </Button>
              </div>
            </div>

            {/* Class Selection */}
            <div>
              <h3 className="font-medium mb-3">Annotation Classes</h3>
              <div className="space-y-1">
                {CLASSES.map((classInfo) => (
                  <button
                    key={classInfo.id}
                    onClick={() => setSelectedClass(classInfo)}
                    className={`w-full text-left p-2 rounded text-sm ${
                      selectedClass.id === classInfo.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
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
                ))}
              </div>
            </div>

            {/* View Control */}
            <div>
              <h3 className="font-medium mb-3">View Control</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setShowAnnotations(!showAnnotations)}
                >
                  {showAnnotations ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                  {showAnnotations ? 'Hide Annotations' : 'Show Annotations'}
                </Button>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Zoom: {(scale * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Annotation List */}
            <div>
              <h3 className="font-medium mb-3">Annotations ({annotations.length})</h3>
              <div className="space-y-1">
                {annotations.map((annotation) => {
                  const classInfo = CLASSES.find(c => c.id === annotation.className);
                  return (
                    <div
                      key={annotation.id}
                      className={`p-2 rounded border cursor-pointer ${
                        selectedAnnotation === annotation.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => setSelectedAnnotation(annotation.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: classInfo?.color }}
                          />
                          <span className="text-sm">{classInfo?.name}</span>
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
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Canvas Area */}
        <div className="flex-1 relative">
          <div className="h-full w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="w-full h-full cursor-crosshair"
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
            />
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
            Selected Class: {selectedClass.name} • Current Tool: {currentTool === 'bbox' ? 'Bounding Box' : 'Point'}
          </div>
        </div>
      </main>
    </div>
  );
}
