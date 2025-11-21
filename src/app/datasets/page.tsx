'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import Navigation from '@/components/layout/Navigation';
import { Plus, FolderOpen, Image, Tag, Calendar, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { DatasetResponse } from '@/types/dataset';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default function DatasetsPage() {
  const router = useRouter();
  const [datasets, setDatasets] = useState<DatasetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(9);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [totalAnnotations, setTotalAnnotations] = useState(0);

  useEffect(() => {
    loadDatasets();
  }, [currentPage]);

  const loadDatasets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/v1/datasets?page=${currentPage}&page_size=${pageSize}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : 'Basic YWRtaW46YWRtaW4=',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch datasets');
      }

      const data = await response.json();
      const items = data.items || [];
      
      // 调试：检查第一个数据项的字段
      if (items.length > 0) {
        console.log('First dataset item keys:', Object.keys(items[0]));
        console.log('First dataset item:', items[0]);
      }
      
      setDatasets(items);
      
      // 处理分页信息 - 支持多种可能的 API 响应格式
      let calculatedTotal = 0;
      let calculatedPages = 0;
      
      if (data.pagination) {
        // 格式: { items: [], pagination: { total, pages, ... } }
        calculatedTotal = data.pagination.total || 0;
        calculatedPages = data.pagination.pages || 0;
      } else if (data.total !== undefined) {
        // 格式: { items: [], total: number }
        calculatedTotal = data.total || 0;
        calculatedPages = Math.ceil(calculatedTotal / pageSize);
      } else if (items.length > 0) {
        // 如果没有分页信息，但返回了数据，尝试根据数据量判断
        // 如果返回的数据量等于 pageSize，可能还有更多数据
        if (items.length === pageSize) {
          // 假设还有更多数据，至少显示 2 页
          calculatedTotal = currentPage * pageSize + 1; // 至少比当前页多
          calculatedPages = currentPage + 1;
        } else {
          // 返回的数据少于 pageSize，说明这是最后一页
          calculatedTotal = (currentPage - 1) * pageSize + items.length;
          calculatedPages = currentPage;
        }
      }
      
      setTotal(calculatedTotal);
      setTotalPages(calculatedPages);
      
      // 计算当前页的总图片数和标注数
      const currentPageImages = items.reduce((sum: number, d: DatasetResponse) => sum + d.num_images, 0);
      const currentPageAnnotations = items.reduce((sum: number, d: DatasetResponse) => sum + d.num_annotations, 0);
      setTotalImages(currentPageImages);
      setTotalAnnotations(currentPageAnnotations);
      
      // 调试信息
      console.log('Pagination info:', {
        currentPage,
        pageSize,
        itemsCount: items.length,
        total: calculatedTotal,
        totalPages: calculatedPages,
        dataKeys: Object.keys(data)
      });
    } catch (error) {
      console.error('Failed to load datasets:', error);
      toast.error('Failed to load datasets');
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

  const handleCreateDataset = () => {
    router.push('/upload');
  };

  const handleViewDataset = (datasetId: string | undefined) => {
    if (!datasetId) {
      console.error('Dataset ID is undefined');
      toast.error('Invalid dataset ID');
      return;
    }
    router.push(`/datasets/${datasetId}`);
  };

  const getDatasetTypeBadge = (datasetType: DatasetResponse['dataset_type']) => {
    const typeConfig = {
      detect: { label: 'Detect', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      obb: { label: 'OBB', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
      segment: { label: 'Segment', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      pose: { label: 'Pose', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
      classify: { label: 'Classify', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' }
    };

    const config = typeConfig[datasetType];
    return (
      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status?: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      active: { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
      ready: { label: 'Ready', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      archived: { label: 'Archived', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
    };

    const config = status ? statusConfig[status] || statusConfig['active'] : statusConfig['active'];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Dataset Management
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
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <FolderOpen className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Dataset Management
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base ml-14">
                Manage all your datasets, images, and annotations in one place
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button 
                onClick={handleCreateDataset} 
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold px-6 py-2.5 rounded-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Create Dataset</span>
              </Button>
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
              <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">Total Datasets</CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-400/20">
                <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">
                {total.toLocaleString()}
              </div>
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Total datasets
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 dark:bg-purple-800/30 rounded-full -mr-16 -mt-16 opacity-20"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-purple-900 dark:text-purple-100">Total Images</CardTitle>
              <div className="p-2 rounded-lg bg-purple-500/10 dark:bg-purple-400/20">
                <Image className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-1">
                {totalImages.toLocaleString()}
              </div>
              <p className="text-xs font-medium text-purple-700 dark:text-purple-300">
                In current page
              </p>
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
                {totalAnnotations.toLocaleString()}
              </div>
              <p className="text-xs font-medium text-green-700 dark:text-green-300">
                In current page
              </p>
            </CardContent>
          </Card>

        </div>

        {/* Dataset List */}
        <Card className="border-0 shadow-xl bg-white dark:bg-gray-800/50 backdrop-blur-sm">
          <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">My Datasets</CardTitle>
                <CardDescription className="mt-1 text-gray-600 dark:text-gray-400">
                  Manage all your datasets, including image uploads and annotations
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {datasets.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
                  <FolderOpen className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No datasets yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Create your first dataset to start annotating and managing your image collections
                </p>
                <Button 
                  onClick={handleCreateDataset}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Dataset
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {datasets.map((dataset) => {
                  // 支持多种可能的 ID 字段名
                  const datasetId = (dataset as any).id || (dataset as any)._id || (dataset as any).dataset_id;
                  
                  if (!datasetId) {
                    console.error('Dataset missing ID field:', dataset);
                    return null;
                  }
                  
                  return (
                  <Card 
                    key={datasetId}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleViewDataset(datasetId)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleViewDataset(datasetId);
                      }
                    }}
                    className="group relative overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl transition-all duration-300 flex flex-col bg-white dark:bg-gray-800/50 backdrop-blur-sm cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {/* 装饰性渐变背景 */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <CardHeader className="flex-none pb-3">
                      <div className="flex items-start justify-between mb-3">
                        {getDatasetTypeBadge(dataset.dataset_type)}
                        {getStatusBadge(dataset.status)}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {dataset.name}
                        </CardTitle>
                        <CardDescription className="mt-2 line-clamp-2 min-h-[2.5rem] text-gray-600 dark:text-gray-400">
                          {dataset.description || 'No description provided'}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between pt-0">
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                          <span className="text-gray-600 dark:text-gray-400 flex items-center">
                            <Image className="h-4 w-4 mr-2" />
                            Images
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">{dataset.num_images.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                          <span className="text-gray-600 dark:text-gray-400 flex items-center">
                            <Tag className="h-4 w-4 mr-2" />
                            Annotations
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">{dataset.num_annotations.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                          <span className="text-gray-600 dark:text-gray-400 flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Updated
                          </span>
                          <span className="font-medium text-xs text-gray-700 dark:text-gray-300">{formatDate(dataset.updated_at)}</span>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDataset(datasetId);
                          }}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium group/btn"
                        >
                          <span className="group-hover/btn:translate-x-1 transition-transform duration-200 inline-block">
                            View Dataset
                          </span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            )}
            
            {/* Pagination */}
            {(totalPages > 1 || datasets.length === pageSize) && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, total || (currentPage * pageSize))} of {total || '?'} datasets
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="flex items-center space-x-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages || 1) }, (_, i) => {
                      const maxPages = totalPages || 1;
                      let pageNum: number;
                      if (maxPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= maxPages - 2) {
                        pageNum = maxPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading || pageNum > (totalPages || 1)}
                          className="min-w-[40px]"
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
                    disabled={currentPage >= (totalPages || 1) || loading || datasets.length < pageSize}
                    className="flex items-center space-x-1"
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
