'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import Navigation from '@/components/layout/Navigation';
import { ArrowLeft, FolderOpen, Upload as UploadIcon } from 'lucide-react';
import UppyUpload from '@/components/upload/UppyUpload';
import { toast } from 'sonner';

export default function UploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [datasetName, setDatasetName] = useState('');
  const [datasetDescription, setDatasetDescription] = useState('');
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [existingDatasets, setExistingDatasets] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');

  useEffect(() => {
    // Mock dataset list
    const mockDatasets = [
      { id: '1', name: 'Default Dataset' },
      { id: '2', name: 'Vehicle Detection Dataset' },
      { id: '3', name: 'Face Recognition Dataset' },
    ];
    setExistingDatasets(mockDatasets);

    const preselectedDataset = searchParams.get('dataset');
    if (preselectedDataset) {
      setSelectedDatasetId(preselectedDataset);
    }
  }, [searchParams]);

  const handleCreateDataset = async () => {
    if (!datasetName.trim()) {
      toast.error('Please enter dataset name');
      return;
    }

    try {
      // Mock create dataset
      const newDatasetId = Date.now().toString();
      const newDataset = {
        id: newDatasetId,
        name: datasetName,
        description: datasetDescription,
        created_at: new Date().toISOString(),
      };

      // Should call API to create dataset
      console.log('Creating dataset:', newDataset);

      setDatasetId(newDatasetId);
      setSelectedDatasetId(newDatasetId);
      toast.success(`Dataset "${datasetName}" created successfully`);
    } catch (error) {
      toast.error('Failed to create dataset');
    }
  };

  const handleUploadComplete = (result: any) => {
    toast.success('File upload complete, processing...');
    // Add file processing logic here
  };

  const selectedDataset = existingDatasets.find(d => d.id === selectedDatasetId);

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
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Upload Dataset
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side: Create or select dataset */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Select Existing Dataset */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FolderOpen className="h-5 w-5" />
                    <span>Select Dataset</span>
                  </CardTitle>
                  <CardDescription>
                    Choose an existing dataset or create a new one
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Select Dataset
                    </label>
                    <select
                      value={selectedDatasetId}
                      onChange={(e) => setSelectedDatasetId(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Please select a dataset</option>
                      {existingDatasets.map((dataset) => (
                        <option key={dataset.id} value={dataset.id}>
                          {dataset.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedDatasetId && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Selected: {selectedDataset?.name}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Create New Dataset */}
              <Card>
                <CardHeader>
                  <CardTitle>Create New Dataset</CardTitle>
                  <CardDescription>
                    Create a new dataset
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Dataset Name"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    placeholder="Enter dataset name"
                  />
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Dataset Description
                    </label>
                    <textarea
                      value={datasetDescription}
                      onChange={(e) => setDatasetDescription(e.target.value)}
                      placeholder="Enter dataset description (optional)"
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                  
                  <Button
                    onClick={handleCreateDataset}
                    className="w-full"
                    disabled={!datasetName.trim()}
                  >
                    Create Dataset
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right side: Upload area */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UploadIcon className="h-5 w-5" />
                  <span>Upload Files</span>
                </CardTitle>
                <CardDescription>
                  Supports JPG, PNG, WebP and other image formats, max 100MB per file
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDatasetId ? (
                  <UppyUpload
                    datasetId={selectedDatasetId}
                    onUploadComplete={handleUploadComplete}
                  />
                ) : (
                  <div className="text-center py-12">
                    <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Please select a dataset or create a new one first
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upload Instructions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Upload Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Supported formats: JPG, JPEG, PNG, WebP, GIF
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    File size limit: Max 100MB per file
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    File quantity limit: Max 100 files
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    After upload, the system will automatically process files and generate thumbnails
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
