'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { getCurrentUser, clearAuthState } from '@/lib/auth-simple';
import Navigation from '@/components/layout/Navigation';
import { Plus, FolderOpen, Upload, Tag, LogOut, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  datasetCount: number;
  imageCount: number;
  annotationCount: number;
  storageUsage: string;
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
    storageUsage: '0 GB'
  });
  const [recentDatasets, setRecentDatasets] = useState<RecentDataset[]>([]);
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock load dashboard data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStats({
        datasetCount: 12,
        imageCount: 1245,
        annotationCount: 3678,
        storageUsage: '2.3 GB'
      });

      setRecentDatasets([
        { id: '1', name: 'COCO Training Dataset', imageCount: 234, annotationCount: 1456 },
        { id: '2', name: 'Vehicle Detection Dataset', imageCount: 567, annotationCount: 2134 },
        { id: '3', name: 'Face Recognition Training Set', imageCount: 890, annotationCount: 3456 }
      ]);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    }
  };

  const handleLogout = () => {
    clearAuthState();
    toast.success('Logged out successfully');
    router.push('/auth/login');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'create-dataset':
        router.push('/upload');
        break;
      case 'upload':
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
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage your YOLO datasets and annotations
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleQuickAction('create-dataset')}
            >
              <FolderOpen className="h-6 w-6" />
              <span>Create Dataset</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleQuickAction('upload')}
            >
              <Upload className="h-6 w-6" />
              <span>Upload Files</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleQuickAction('view-datasets')}
            >
              <Tag className="h-6 w-6" />
              <span>View Datasets</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Datasets</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.datasetCount}</div>
              <p className="text-xs text-muted-foreground">
                {Math.floor(stats.datasetCount * 0.8)} active datasets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Images</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">🖼️</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.imageCount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +156 from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Annotations</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.annotationCount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +432 from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">💾</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.storageUsage}</div>
              <p className="text-xs text-muted-foreground">
                Total limit: 10 GB
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Datasets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Datasets</CardTitle>
              <CardDescription>Your recently created and accessed datasets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentDatasets.map((dataset) => (
                <div 
                  key={dataset.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => router.push(`/datasets/${dataset.id}`)}
                >
                  <div>
                    <h3 className="font-semibold">{dataset.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {dataset.imageCount} images • {dataset.annotationCount} annotations
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              ))}
              <div className="text-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/datasets')}
                >
                  View All Datasets
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>YOLO Format Support</CardTitle>
              <CardDescription>Platform focused on YOLO format dataset processing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">YOLO v5/v8 Format Support</p>
                    <p className="text-xs text-gray-500">Full support for latest YOLO format standards</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Automated Annotation Tools</p>
                    <p className="text-xs text-gray-500">Efficient bounding box annotation interface</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Dataset Management</p>
                    <p className="text-xs text-gray-500">Organize and manage your datasets</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">MinIO S3 Storage</p>
                    <p className="text-xs text-gray-500">Fast and reliable large file uploads</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Start your YOLO dataset annotation journey
                  </p>
                  <Button onClick={() => router.push('/upload')} className="w-full">
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