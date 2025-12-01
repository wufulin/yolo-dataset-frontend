'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import Navigation from '@/components/layout/Navigation';
import { ArrowLeft, Upload as UploadIcon, FileText, Info } from 'lucide-react';
import UppyUpload from '@/components/upload/UppyUpload';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

type DatasetType = 'Classify' | 'Detect' | 'OBB' | 'Segment' | 'POSE';

// 映射前端类型到后端类型
const datasetTypeMap: Record<DatasetType, string> = {
  'Classify': 'classify',
  'Detect': 'detect',
  'OBB': 'obb',
  'Segment': 'segment',
  'POSE': 'pose'
};

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
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleUploadProgress = (progress: UploadProgress) => {
    setUploadProgress(progress);
    if (progress.percentage > 0 && progress.percentage < 100) {
      setIsUploading(true);
    } else if (progress.percentage === 100) {
      setIsUploading(false);
      setUploadComplete(true);
    }
  };

  const handleUploadComplete = async (result: { dataset_id?: string; temp_object_name?: string } | null) => {
    setIsUploading(false);
    setUploadComplete(true);
    
    // Check if dataset was already created by backend
    // Backend process_dataset creates dataset for ZIP files and returns dataset_id
    if (result && result.dataset_id) {
      // Dataset already created by backend
      setDatasetId(result.dataset_id);
      toast.success(`Dataset "${datasetName}" created successfully!`);
      
      // 跳转到数据集列表页
      setTimeout(() => {
        router.push('/datasets');
      }, 1500);
    } else {
      // Upload failed
      toast.error('File upload failed.');
    }
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
      <header className="relative bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        {/* 装饰性背景元素 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-200 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-pink-200 dark:bg-pink-900/20 rounded-full blur-3xl opacity-30"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 sm:py-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="group relative flex items-center space-x-2 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 shadow-sm hover:shadow-lg font-semibold px-4 py-2"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                <span>Back</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side: Create dataset */}
          <div className="lg:col-span-1">
            {/* Dataset Information */}
            <Card className="border-0 shadow-xl bg-white dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Dataset Information</CardTitle>
                    <CardDescription className="mt-0.5 text-gray-600 dark:text-gray-400">Enter dataset information before uploading files</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <Input
                  label="Dataset Name *"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  placeholder="Enter dataset name"
                />
                
                <Select
                  label="Dataset Type *"
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
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Dataset Description
                  </label>
                  <textarea
                    value={datasetDescription}
                    onChange={(e) => setDatasetDescription(e.target.value)}
                    placeholder="Enter dataset description (optional)"
                    rows={3}
                    className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-400 resize-none bg-white dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 transition-all duration-200 shadow-sm hover:shadow-md"
                  />
                </div>
                
              </CardContent>
            </Card>
          </div>

          {/* Right side: Upload area */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-md">
                    <UploadIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Upload Files</CardTitle>
                    <CardDescription className="mt-0.5 text-gray-600 dark:text-gray-400">Supports JPG, PNG, WebP and other image formats, max 100GB per file</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <UppyUpload
                  datasetInfo={
                    datasetName.trim() && datasetType
                      ? {
                          name: datasetName.trim(),
                          description: datasetDescription || '',
                          dataset_type: datasetTypeMap[datasetType],
                        }
                      : null
                  }
                  onUploadComplete={handleUploadComplete}
                  onProgress={handleUploadProgress}
                  buttonText="Start Upload And Create"
                  requireDatasetInfo={true}
                />
                
                {/* Upload Progress Bar */}
                {uploadProgress && uploadProgress.percentage > 0 && (
                  <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                        {isUploading ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            Upload Complete and verifying...
                          </>
                        )}
                      </span>
                      <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                        {uploadProgress.percentage}%
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-blue-200/50 dark:bg-blue-800/50 rounded-full h-4 mb-4 overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-4 rounded-full transition-all duration-300 ease-out shadow-md relative overflow-hidden"
                        style={{ width: `${uploadProgress.percentage}%` }}
                      >
                        {isUploading && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                        )}
                      </div>
                    </div>
                    
                    {/* Upload Details */}
                    <div className="flex items-center justify-between text-xs font-semibold text-blue-800 dark:text-blue-200 bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-lg">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        Files: {uploadProgress.uploadedFiles} / {uploadProgress.totalFiles}
                      </span>
                      <span>
                        {formatBytes(uploadProgress.uploadedBytes)} / {formatBytes(uploadProgress.totalBytes)}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Upload Status */}
                {uploadComplete && datasetId && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border-2 border-green-300 dark:border-green-700 shadow-lg">
                    <p className="text-sm font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
                      <span className="text-lg">✓</span>
                      Files uploaded and dataset created successfully!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upload Instructions */}
            <Card className="mt-6 border-0 shadow-xl bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-800/50 dark:to-indigo-900/10 backdrop-blur-sm">
              <CardHeader className="pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                    <Info className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Upload Instructions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start space-x-4 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                  <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-400/20 mt-0.5">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
                    Supported formats: YOLO Format with ZIP Archive
                  </p>
                </div>
                <div className="flex items-start space-x-4 p-3 rounded-lg bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                  <div className="p-2 rounded-lg bg-purple-500/10 dark:bg-purple-400/20 mt-0.5">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
                    File size limit: Max 100GB per file
                  </p>
                </div>
                <div className="flex items-start space-x-4 p-3 rounded-lg bg-pink-50/50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800">
                  <div className="p-2 rounded-lg bg-pink-500/10 dark:bg-pink-400/20 mt-0.5">
                    <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
                    File quantity limit: Max 100 files
                  </p>
                </div>
                <div className="flex items-start space-x-4 p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                  <div className="p-2 rounded-lg bg-indigo-500/10 dark:bg-indigo-400/20 mt-0.5">
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
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
