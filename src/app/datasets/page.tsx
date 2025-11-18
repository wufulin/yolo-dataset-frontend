'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import Navigation from '@/components/layout/Navigation';
import { Plus, FolderOpen, Image, Tag, Calendar, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface Dataset {
  id: string;
  name: string;
  description: string;
  imageCount: number;
  annotationCount: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'processing' | 'completed';
}

export default function DatasetsPage() {
  const router = useRouter();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock load dataset list
    const loadDatasets = async () => {
      setLoading(true);
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockDatasets: Dataset[] = [
          {
            id: '1',
            name: 'Vehicle Detection Dataset',
            description: 'Annotated data containing various vehicle types and traffic scenarios',
            imageCount: 1250,
            annotationCount: 3456,
            createdAt: '2024-01-15',
            updatedAt: '2024-01-20',
            status: 'active'
          },
          {
            id: '2',
            name: 'Face Recognition Dataset',
            description: 'Face image annotations across multiple age groups and ethnicities',
            imageCount: 890,
            annotationCount: 2134,
            createdAt: '2024-01-10',
            updatedAt: '2024-01-18',
            status: 'completed'
          },
          {
            id: '3',
            name: 'COCO Training Dataset',
            description: 'Object detection annotations in COCO format',
            imageCount: 567,
            annotationCount: 1456,
            createdAt: '2024-01-05',
            updatedAt: '2024-01-12',
            status: 'processing'
          }
        ];
        
        setDatasets(mockDatasets);
      } catch (error) {
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

  const handleUploadToDataset = (datasetId: string) => {
    router.push(`/upload?dataset=${datasetId}`);
  };

  const getStatusBadge = (status: Dataset['status']) => {
    const statusConfig = {
      active: { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' }
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
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
                {datasets.filter(d => d.status === 'active').length} active datasets
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
                {datasets.reduce((sum, d) => sum + d.imageCount, 0).toLocaleString()}
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
                {datasets.reduce((sum, d) => sum + d.annotationCount, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Avg {Math.round(datasets.reduce((sum, d) => sum + d.annotationCount, 0) / datasets.length || 0)} per dataset
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
                  <Card key={dataset.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{dataset.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {dataset.description}
                          </CardDescription>
                        </div>
                        {getStatusBadge(dataset.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Images</span>
                          <span className="font-medium">{dataset.imageCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Annotations</span>
                          <span className="font-medium">{dataset.annotationCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Updated</span>
                          <span className="font-medium">{dataset.updatedAt}</span>
                        </div>
                        
                        <div className="flex space-x-2 pt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUploadToDataset(dataset.id)}
                            className="flex-1"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Upload
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleViewDataset(dataset.id)}
                            className="flex-1"
                          >
                            <ArrowRight className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
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
