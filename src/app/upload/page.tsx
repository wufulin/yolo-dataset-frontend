'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import Navigation from '@/components/layout/Navigation';
import { ArrowLeft, Upload as UploadIcon } from 'lucide-react';
import UppyUpload from '@/components/upload/UppyUpload';
import { toast } from 'sonner';

type DatasetType = 'Classify' | 'Detect' | 'OBB' | 'Segment' | 'POSE';

interface UploadProgress {
  percentage: number;
  uploadedFiles: number;
  totalFiles: number;
  uploadedBytes: number;
  totalBytes: number;
}

export default function UploadPage() {
  const router = useRouter();
  const [datasetName, setDatasetName] = useState('');
  const [datasetDescription, setDatasetDescription] = useState('');
  const [datasetType, setDatasetType] = useState<DatasetType>('Detect');
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
        type: datasetType,
        created_at: new Date().toISOString(),
      };

      // Should call API to create dataset
      console.log('Creating dataset:', newDataset);

      setDatasetId(newDatasetId);
      toast.success(`Dataset "${datasetName}" created successfully`);
    } catch (error) {
      toast.error('Failed to create dataset');
    }
  };

  const handleUploadProgress = (progress: UploadProgress) => {
    setUploadProgress(progress);
    if (progress.percentage > 0 && progress.percentage < 100) {
      setIsUploading(true);
    } else if (progress.percentage === 100) {
      setIsUploading(false);
    }
  };

  const handleUploadComplete = (result: any) => {
    toast.success('File upload complete, processing...');
    setIsUploading(false);
    // Add file processing logic here
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

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
          {/* Left side: Create dataset */}
          <div className="lg:col-span-1">
            {/* Create New Dataset */}
            <Card>
              <CardHeader>
                <CardTitle>Create New Dataset</CardTitle>
                <CardDescription>
                  Create a new dataset to start uploading
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Dataset Name"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  placeholder="Enter dataset name"
                />
                
                <Select
                  label="Dataset Type"
                  value={datasetType}
                  onChange={(e) => setDatasetType(e.target.value as DatasetType)}
                  options={[
                    { value: 'Classify', label: 'Classify' },
                    { value: 'Detect', label: 'Detect' },
                    { value: 'OBB', label: 'OBB' },
                    { value: 'Segment', label: 'Segment' },
                    { value: 'POSE', label: 'POSE' },
                  ]}
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
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                
                <Button
                  onClick={handleCreateDataset}
                  className="w-full"
                  disabled={!datasetName.trim()}
                >
                  Create Dataset
                </Button>

                {datasetId && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                      ✓ Dataset Created: {datasetName}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      Type: {datasetType}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
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
                <UppyUpload
                  datasetId={datasetId}
                  onUploadComplete={handleUploadComplete}
                  onProgress={handleUploadProgress}
                />
                
                {/* Upload Progress Bar */}
                {uploadProgress && uploadProgress.percentage > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {isUploading ? 'Uploading...' : 'Upload Complete'}
                      </span>
                      <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        {uploadProgress.percentage}%
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-3 mb-3 overflow-hidden">
                      <div
                        className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress.percentage}%` }}
                      />
                    </div>
                    
                    {/* Upload Details */}
                    <div className="flex items-center justify-between text-xs text-blue-800 dark:text-blue-200">
                      <span>
                        Files: {uploadProgress.uploadedFiles} / {uploadProgress.totalFiles}
                      </span>
                      <span>
                        {formatBytes(uploadProgress.uploadedBytes)} / {formatBytes(uploadProgress.totalBytes)}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Dataset Info */}
                {datasetId && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Uploading to: <span className="font-medium text-gray-900 dark:text-gray-100">{datasetName}</span>
                      {datasetType && <span className="ml-2 text-gray-500">({datasetType})</span>}
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
