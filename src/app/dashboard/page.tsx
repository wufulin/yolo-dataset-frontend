'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import Navigation from '@/components/layout/Navigation';
import { Plus, FolderOpen, Tag, Image, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  datasetCount: number;
  imageCount: number;
  annotationCount: number;
  storageUsage: string;
  storageUsed: string;
  storageTotal: string;
  storagePercentage: number;
}

interface StorageInfo {
  used_bytes: number;
  used_formatted: string;
  available_bytes: number;
  available_formatted: string;
  total_bytes: number;
  total_formatted: string;
  usage_percentage: number;
  object_count: number;
}

interface RecentDataset {
  id: string;
  name: string;
  imageCount: number;
  annotationCount: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    datasetCount: 0,
    imageCount: 0,
    annotationCount: 0,
    storageUsage: '0 GB',
    storageUsed: '0 B',
    storageTotal: '0 B',
    storagePercentage: 0
  });
  const [recentDatasets, setRecentDatasets] = useState<RecentDataset[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const token = localStorage.getItem('token');
        
        // Load storage info
        try {
          const storageResponse = await fetch(`${API_BASE_URL}/api/v1/base-info/storage`, {
            headers: {
              'Authorization': token ? `Bearer ${token}` : 'Basic YWRtaW46YWRtaW4=',
            },
          });

          if (storageResponse.ok && isMounted) {
            const storageData: StorageInfo = await storageResponse.json();
            setStats(prev => ({
              ...prev,
              storageUsed: storageData.used_formatted,
              storageTotal: storageData.total_formatted,
              storageUsage: `${storageData.used_formatted} / ${storageData.total_formatted}`,
              storagePercentage: storageData.usage_percentage
            }));
          }
        } catch (storageError) {
          console.error('Failed to load storage info:', storageError);
          // Continue with other data even if storage info fails
        }

        // Load datasets list (get all datasets for statistics, first 3 for Recent Datasets)
        try {
          const datasetsResponse = await fetch(`${API_BASE_URL}/api/v1/datasets?page=1&page_size=100`, {
            headers: {
              'Authorization': token ? `Bearer ${token}` : 'Basic YWRtaW46YWRtaW4=',
            },
          });

          if (datasetsResponse.ok && isMounted) {
            const datasetsData = await datasetsResponse.json();
            const datasets = datasetsData.items || [];
            
            // Calculate statistics from all datasets (same as datasets page)
            const totalDatasets = datasets.length;
            const totalImages = datasets.reduce((sum: number, d: { num_images?: number }) => sum + (d.num_images || 0), 0);
            const totalAnnotations = datasets.reduce((sum: number, d: { num_annotations?: number }) => sum + (d.num_annotations || 0), 0);
            
            // Update all statistics
            setStats(prev => ({
              ...prev,
              datasetCount: totalDatasets,
              imageCount: totalImages,
              annotationCount: totalAnnotations
            }));

            // Convert to RecentDataset format and take only first 3
            const recentDatasetsData = datasets.slice(0, 3).map((dataset: { id: string; name: string; num_images?: number; num_annotations?: number }) => ({
              id: dataset.id,
              name: dataset.name,
              imageCount: dataset.num_images || 0,
              annotationCount: dataset.num_annotations || 0
            }));
            
            setRecentDatasets(recentDatasetsData);
          }
        } catch (datasetsError) {
          console.error('Failed to load datasets:', datasetsError);
          // Continue with empty list if datasets fail to load
          if (isMounted) {
            setRecentDatasets([]);
          }
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        if (isMounted) {
          toast.error('Failed to load dashboard data');
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'create-dataset':
        router.push('/upload');
        break;
      case 'view-datasets':
        router.push('/datasets');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Button 
              className="relative h-28 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden"
              onClick={() => handleQuickAction('create-dataset')}
            >
              {/* 装饰性背景元素 */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="relative z-10 p-3 rounded-xl bg-white/20 group-hover:bg-white/30 backdrop-blur-sm transition-all duration-300 group-hover:scale-110">
                <FolderOpen className="h-7 w-7" />
              </div>
              <span className="relative z-10 font-bold text-base tracking-wide">Create Dataset</span>
            </Button>
            <Button 
              variant="outline" 
              className="relative h-28 flex flex-col items-center justify-center space-y-3 border-2 border-indigo-200 dark:border-indigo-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 transition-all duration-300 group overflow-hidden shadow-lg hover:shadow-xl"
              onClick={() => handleQuickAction('view-datasets')}
            >
              {/* 装饰性背景元素 */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10 p-3 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 group-hover:from-indigo-200 group-hover:to-purple-200 dark:group-hover:from-indigo-800/50 dark:group-hover:to-purple-800/50 transition-all duration-300 group-hover:scale-110 shadow-md">
                <Tag className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="relative z-10 font-bold text-base tracking-wide text-gray-800 dark:text-gray-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">View Datasets</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
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
                {stats.datasetCount}
              </div>
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                {Math.floor(stats.datasetCount * 0.8)} active datasets
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
                {stats.imageCount.toLocaleString()}
              </div>
              <p className="text-xs font-medium text-purple-700 dark:text-purple-300">
                +156 from last week
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
                {stats.annotationCount.toLocaleString()}
              </div>
              <p className="text-xs font-medium text-green-700 dark:text-green-300">
                +432 from last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Datasets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="relative border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800/50 dark:to-blue-900/10 backdrop-blur-sm overflow-hidden">
            {/* 装饰性背景 */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-200/20 dark:bg-blue-800/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            
            <CardHeader className="relative pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                  <FolderOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Recent Datasets</CardTitle>
                  <CardDescription className="mt-0.5 text-gray-600 dark:text-gray-400">Your recently created and accessed datasets</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative pt-6 space-y-4">
              {recentDatasets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <FolderOpen className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No recent datasets</p>
                </div>
              ) : (
                recentDatasets.map((dataset) => (
                  <div 
                    key={dataset.id} 
                    className="group relative flex items-center justify-between p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 bg-white/50 dark:bg-gray-800/30 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md"
                    onClick={() => router.push(`/datasets/${dataset.id}`)}
                  >
                    {/* 左侧装饰条 */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="flex-1 pl-2">
                      <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1.5">
                        {dataset.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-4">
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800">
                          <Image className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium">{dataset.imageCount}</span>
                        </span>
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800">
                          <Tag className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                          <span className="font-medium">{dataset.annotationCount}</span>
                        </span>
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-4 group-hover:border-blue-500 group-hover:bg-blue-500 group-hover:text-white dark:group-hover:border-blue-400 dark:group-hover:bg-blue-400 transition-all duration-300 shadow-sm group-hover:shadow-md">
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </div>
                ))
              )}
              <div className="text-center pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/datasets')}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 border-2 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                >
                  View All Datasets
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="relative border-0 shadow-xl bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800/50 dark:to-purple-900/10 backdrop-blur-sm overflow-hidden">
            {/* 装饰性背景 */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-200/20 dark:bg-purple-800/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            
            <CardHeader className="relative pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-md">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">YOLO Format Support</CardTitle>
                  <CardDescription className="mt-0.5 text-gray-600 dark:text-gray-400">Platform focused on YOLO format dataset processing</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative pt-6 space-y-4">
              <div className="space-y-3">
                <div className="group flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 border border-blue-200/50 dark:border-blue-700/50 hover:shadow-md transition-all duration-300">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <div className="w-3.5 h-3.5 rounded-full bg-white"></div>
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">YOLO v5/v8 Format Support</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Full support for latest YOLO format standards</p>
                  </div>
                </div>
                <div className="group flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/30 dark:to-green-800/20 border border-green-200/50 dark:border-green-700/50 hover:shadow-md transition-all duration-300">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <div className="w-3.5 h-3.5 rounded-full bg-white"></div>
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Automated Annotation Tools</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Efficient bounding box annotation interface</p>
                  </div>
                </div>
                <div className="group flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/30 dark:to-purple-800/20 border border-purple-200/50 dark:border-purple-700/50 hover:shadow-md transition-all duration-300">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <div className="w-3.5 h-3.5 rounded-full bg-white"></div>
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Dataset Management</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Organize and manage your datasets</p>
                  </div>
                </div>
                <div className="group flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/30 dark:to-orange-800/20 border border-orange-200/50 dark:border-orange-700/50 hover:shadow-md transition-all duration-300">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <div className="w-3.5 h-3.5 rounded-full bg-white"></div>
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">MinIO S3 Storage</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Fast and reliable large file uploads</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Start your YOLO dataset annotation journey
                  </p>
                  <Button 
                    onClick={() => router.push('/upload')} 
                    className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Dataset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}