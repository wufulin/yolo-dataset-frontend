'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import Navigation from '@/components/layout/Navigation';
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  Tag, 
  Settings,
  Download,
  Upload,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface Dataset {
  id: string;
  name: string;
  description: string;
  imageCount: number;
  annotationCount: number;
  classCount: number;
}

interface ImageItem {
  id: string;
  filename: string;
  url: string;
  annotationCount: number;
  width: number;
  height: number;
  size: number;
}

export default function DatasetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const datasetId = params.id as string;
  
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  useEffect(() => {
    loadDatasetDetail();
  }, [datasetId]);

  const loadDatasetDetail = async () => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockDataset: Dataset = {
        id: datasetId,
        name: 'Vehicle Detection Dataset',
        description: 'Annotated data containing various vehicle types and traffic scenarios',
        imageCount: 1250,
        annotationCount: 3456,
        classCount: 8
      };

      const mockImages: ImageItem[] = Array.from({ length: 20 }, (_, i) => ({
        id: `image-${i + 1}`,
        filename: `vehicle_${(i + 1).toString().padStart(4, '0')}.jpg`,
        url: `https://picsum.photos/400/300?random=${i + 1}`,
        annotationCount: Math.floor(Math.random() * 5) + 1,
        width: 800,
        height: 600,
        size: Math.floor(Math.random() * 500) + 100 // KB
      }));

      setDataset(mockDataset);
      setImages(mockImages);
    } catch (error) {
      toast.error('Failed to load dataset details');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleSelectAll = () => {
    if (selectedImages.length === images.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(images.map(img => img.id));
    }
  };

  const handleAnnotationView = (imageId: string) => {
    router.push(`/datasets/${datasetId}/images/${imageId}/annotate`);
  };

  const handleBack = () => {
    router.push('/datasets');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Dataset Details
              </h1>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading...</span>
          </div>
        </main>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Dataset not found
          </h2>
          <Button onClick={handleBack}>Back to Dataset List</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dataset.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {dataset.description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Images
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export YOLO
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Images</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dataset.imageCount.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Annotations</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dataset.annotationCount.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Classes</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dataset.classCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annotated Images</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.floor(dataset.imageCount * 0.7).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                70% Complete
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Control Bar */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-end space-x-2">
              {selectedImages.length > 0 && (
                <Button variant="outline" size="sm">
                  Batch Annotate ({selectedImages.length})
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Image List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Image List</CardTitle>
                <CardDescription>
                  Total {images.length} images, {selectedImages.length} selected
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedImages.length === images.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {images.map((image) => (
                <div 
                  key={image.id} 
                  className="flex items-center space-x-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedImages.includes(image.id)}
                    onChange={() => handleImageSelect(image.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  
                  {/* Thumbnail */}
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={image.url}
                      alt={image.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {image.filename}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Size: {image.width}×{image.height} • {(image.size / 1024).toFixed(1)}KB
                    </p>
                  </div>
                  
                  {/* Annotation Info */}
                  <div className="text-center px-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {image.annotationCount}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Annotations
                    </p>
                  </div>
                  
                  {/* Action Button */}
                  <div className="flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAnnotationView(image.id)}
                      className="min-w-[80px]"
                    >
                      {image.annotationCount > 0 ? 'View' : 'Annotate'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
