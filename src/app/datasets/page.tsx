'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import Navigation from '@/components/layout/Navigation';
import { Plus, FolderOpen, Image, Tag, Calendar, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { DatasetResponse } from '@/types/dataset';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default function DatasetsPage() {
  const router = useRouter();
  const [datasets, setDatasets] = useState<DatasetResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDatasets = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/v1/datasets?page=1&page_size=100`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : 'Basic YWRtaW46YWRtaW4=',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch datasets');
        }

        const data = await response.json();
        setDatasets(data.items || []);
      } catch (error) {
        console.error('Failed to load datasets:', error);
        toast.error('Failed to load datasets');
      } finally {
        setLoading(false);
      }
    };

    loadDatasets();
  }, []);

  const handleCreateDataset = () => {
    router.push('/upload');
  };

  const handleViewDataset = (datasetId: string) => {
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
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Dataset Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Manage all your datasets and images
              </p>
            </div>
            <Button onClick={handleCreateDataset} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Dataset</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Datasets</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{datasets.length}</div>
              <p className="text-xs text-muted-foreground">
                All datasets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Images</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {datasets.reduce((sum, d) => sum + d.num_images, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across {datasets.length} datasets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Annotations</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {datasets.reduce((sum, d) => sum + d.num_annotations, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Avg {Math.round(datasets.reduce((sum, d) => sum + d.num_annotations, 0) / datasets.length || 0)} per dataset
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.3 GB</div>
              <p className="text-xs text-muted-foreground">
                Uploaded in last 7 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dataset List */}
        <Card>
          <CardHeader>
            <CardTitle>My Datasets</CardTitle>
            <CardDescription>
              Manage all your datasets, including image uploads and annotations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {datasets.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No datasets yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Create your first dataset to start annotating
                </p>
                <Button onClick={handleCreateDataset}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Dataset
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {datasets.map((dataset) => (
                  <Card key={dataset.id} className="hover:shadow-lg transition-shadow flex flex-col">
                    <CardHeader className="flex-none">
                      <div className="flex items-start justify-between mb-3">
                        {getDatasetTypeBadge(dataset.dataset_type)}
                        {getStatusBadge(dataset.status)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{dataset.name}</CardTitle>
                        <CardDescription className="mt-1 line-clamp-2 min-h-[2.5rem]">
                          {dataset.description || 'No description provided'}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Images</span>
                          <span className="font-medium">{dataset.num_images.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Annotations</span>
                          <span className="font-medium">{dataset.num_annotations.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Updated</span>
                          <span className="font-medium text-xs">{formatDate(dataset.updated_at)}</span>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button
                          size="sm"
                          onClick={() => handleViewDataset(dataset.id)}
                          className="w-full"
                        >
                          View Dataset
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
