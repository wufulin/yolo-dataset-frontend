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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { DatasetResponse } from '@/types/dataset';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface ImageItem {
  id: string;
  dataset_id: string;
  filename: string;
  file_path: string;
  file_url: string;
  file_size: number;
  file_hash: string;
  width: number;
  height: number;
  channels: number;
  format: string;
  split: string;
  annotations: any[];
  metadata: any;
  is_annotated: boolean;
  annotation_count: number;
  created_at: string;
  updated_at: string;
}

export default function DatasetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const datasetId = params.id as string;
  
  const [dataset, setDataset] = useState<DatasetResponse | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadDatasetDetail();
    setCurrentPage(1); // 重置页码当数据集变化时
  }, [datasetId]);

  useEffect(() => {
    loadImages();
  }, [datasetId, currentPage]);

  const loadDatasetDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/v1/datasets/${datasetId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : 'Basic YWRtaW46YWRtaW4=',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dataset details');
      }

      const data = await response.json();
      setDataset(data);
    } catch (error) {
      console.error('Failed to load dataset details:', error);
      toast.error('Failed to load dataset details');
    }
  };

  const loadImages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/v1/datasets/${datasetId}/images?page=${currentPage}&page_size=${pageSize}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : 'Basic YWRtaW46YWRtaW4=',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      setImages(data.items || []);
      
      // 处理分页信息
      if (data.pagination) {
        setTotal(data.pagination.total || 0);
        setTotalPages(data.pagination.pages || 0);
      } else if (data.total !== undefined) {
        // 如果没有 pagination 对象，尝试从 data 中获取
        setTotal(data.total || 0);
        setTotalPages(Math.ceil((data.total || 0) / pageSize));
      }
    } catch (error) {
      console.error('Failed to load images:', error);
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAnnotationView = (imageId: string) => {
    const imageData = images.find(img => img.id === imageId);
    if (imageData) {
      // 将图片数据存储到 sessionStorage
      sessionStorage.setItem('currentImageData', JSON.stringify(imageData));
    }
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
                className="group relative flex items-center space-x-2 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 shadow-sm hover:shadow-lg font-semibold px-4 py-2"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
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
          <Button 
            onClick={handleBack}
            className="group relative flex items-center space-x-2 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 shadow-sm hover:shadow-lg font-semibold px-4 py-2"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Back to Dataset List</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      {/* Header */}
      <header className="relative bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        {/* 装饰性背景元素 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-30"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 sm:py-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="group relative flex items-center space-x-2 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 shadow-sm hover:shadow-lg font-semibold px-4 py-2"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                <span>Back</span>
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <ImageIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {dataset.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-1">
                    {dataset.description || 'No description provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 dark:bg-blue-800/30 rounded-full -mr-16 -mt-16 opacity-20"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">Total Images</CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-400/20">
                <ImageIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">
                {dataset.num_images.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 dark:bg-green-800/30 rounded-full -mr-16 -mt-16 opacity-20"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-green-900 dark:text-green-100">Total Annotations</CardTitle>
              <div className="p-2 rounded-lg bg-green-500/10 dark:bg-green-400/20">
                <Tag className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-1">
                {dataset.num_annotations.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 dark:bg-purple-800/30 rounded-full -mr-16 -mt-16 opacity-20"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-purple-900 dark:text-purple-100">Classes</CardTitle>
              <div className="p-2 rounded-lg bg-purple-500/10 dark:bg-purple-400/20">
                <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-1">
                {dataset.class_names.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Image List */}
        <Card className="border-0 shadow-xl bg-white dark:bg-gray-800/50 backdrop-blur-sm">
          <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Image List</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {images.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No images found</p>
                </div>
              ) : (
                images.map((image) => (
                  <div 
                    key={image.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleAnnotationView(image.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleAnnotationView(image.id);
                      }
                    }}
                    className="group relative flex items-center space-x-4 p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 bg-white/50 dark:bg-gray-800/30 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {/* 左侧装饰条 */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Thumbnail */}
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                      <img
                        src={image.file_url}
                        alt={image.filename}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96x96?text=No+Image';
                        }}
                      />
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 min-w-0 pl-2">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1.5">
                        {image.filename}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-900/50 text-xs font-medium text-gray-700 dark:text-gray-300">
                          <ImageIcon className="h-3 w-3" />
                          {image.width}×{image.height}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-900/50 text-xs font-medium text-gray-700 dark:text-gray-300">
                          {(image.file_size / 1024).toFixed(1)}KB
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${
                          image.split === 'train' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          image.split === 'val' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                        }`}>
                          {image.split}
                        </span>
                      </div>
                    </div>
                    
                    {/* Annotation Info */}
                    <div className="text-center px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900/50 min-w-[100px]">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {image.annotation_count}
                      </p>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Annotations
                      </p>
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnnotationView(image.id);
                        }}
                        className="min-w-[100px] border-2 group-hover:border-blue-500 group-hover:bg-blue-500 group-hover:text-white dark:group-hover:border-blue-400 dark:group-hover:bg-blue-400 transition-all duration-300 shadow-sm group-hover:shadow-md font-semibold"
                      >
                        {image.annotation_count > 0 ? 'View' : 'Annotate'}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, total)} of {total} images
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="flex items-center space-x-1 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                          className={`min-w-[40px] ${currentPage === pageNum ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md' : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'} transition-all duration-200 shadow-sm hover:shadow-md`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className="flex items-center space-x-1 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
