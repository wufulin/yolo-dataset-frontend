'use client';

import React, { useState, useCallback } from 'react';
import Uppy from '@uppy/core';
import { Dashboard } from '@uppy/react';
import ProgressBar from '@uppy/progress-bar';
import { toast } from 'sonner';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import '@uppy/progress-bar/dist/style.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk

interface UppyUploadProps {
  datasetInfo?: {
    name: string;
    description?: string;
    dataset_type: string;
  } | null;
  onUploadComplete?: (result: any) => void;
  onProgress?: (progress: { percentage: number; uploadedFiles: number; totalFiles: number; uploadedBytes: number; totalBytes: number }) => void;
  buttonText?: string;
  requireDatasetInfo?: boolean;
}

export default function UppyUpload({ datasetInfo, onUploadComplete, onProgress, buttonText = 'Start Upload', requireDatasetInfo = false }: UppyUploadProps) {
  const [fileCount, setFileCount] = useState(0);
  const [uppy] = useState(() => {
    const uppyInstance = new Uppy({
      restrictions: {
        allowedFileTypes: ['image/*', '.zip'],
        maxNumberOfFiles: 1, // 只能上传一个文件
        // 移除前端文件大小限制，由后端验证（后端限制为 100GB）
      },
      autoProceed: false,
      allowMultipleUploadBatches: false, // 不允许多个上传批次
      })
      .use(ProgressBar, {
        target: 'body',
        fixed: true,
        locale: {
          strings: {
            uploadComplete: 'Upload complete',
            uploadPaused: 'Upload paused',
            resumeUpload: 'Resume upload',
            pauseUpload: 'Pause upload',
            xFilesUploaded: '{{}} files uploaded',
            uploadXFiles: 'Upload {{}} files',
            uploadFile: 'Upload 1 file',
            xFilesLeft: '{{}} files remaining',
            uploadFiles: 'Upload files',
          },
        },
      });

    // 监听文件变化
    uppyInstance.on('file-added', () => {
      setFileCount(uppyInstance.getFiles().length);
    });

    uppyInstance.on('file-removed', () => {
      setFileCount(uppyInstance.getFiles().length);
    });

    return uppyInstance;
  });

  // 分片上传函数
  const uploadFileInChunks = useCallback(async (
    file: File,
    onFileProgress?: (uploadedBytes: number, totalBytes: number) => void
  ): Promise<void> => {
    const token = localStorage.getItem('token');
    const totalSize = file.size;
    const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);
    
    console.log(`Starting upload: ${file.name}, size: ${totalSize}, chunks: ${totalChunks}`);
    
    // 1. 调用 /api/v1/upload/start 开始上传
    const startFormData = new FormData();
    startFormData.append('filename', file.name);
    startFormData.append('total_size', totalSize.toString());
    startFormData.append('total_chunks', totalChunks.toString());
    startFormData.append('chunk_size', CHUNK_SIZE.toString());

    try {
      const startResponse = await fetch(`${API_BASE_URL}/api/v1/upload/start`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : 'Basic YWRtaW46YWRtaW4=',
        },
        body: startFormData,
      });

      if (!startResponse.ok) {
        const errorText = await startResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText || `HTTP ${startResponse.status}` };
        }
        console.error('Start upload failed:', errorData);
        throw new Error(errorData.detail || `Failed to start upload: ${startResponse.status}`);
      }

      const startData = await startResponse.json();
      const upload_id = startData.upload_id;
      
      if (!upload_id) {
        throw new Error('No upload_id returned from server');
      }
      
      console.log('Upload session started:', upload_id);

      // 2. 上传每个分片
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, totalSize);
        const chunk = file.slice(start, end);

        console.log(`Uploading chunk ${chunkIndex + 1}/${totalChunks}, size: ${chunk.size}`);

        const chunkFormData = new FormData();
        chunkFormData.append('file', chunk, file.name);

        const chunkResponse = await fetch(
          `${API_BASE_URL}/api/v1/upload/chunk/${upload_id}/${chunkIndex}`,
          {
            method: 'POST',
            headers: {
              'Authorization': token ? `Bearer ${token}` : 'Basic YWRtaW46YWRtaW4=',
            },
            body: chunkFormData,
          }
        );

        if (!chunkResponse.ok) {
          const errorText = await chunkResponse.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { detail: errorText || `HTTP ${chunkResponse.status}` };
          }
          console.error(`Chunk ${chunkIndex} upload failed:`, errorData);
          throw new Error(errorData.detail || `Failed to upload chunk ${chunkIndex}: ${chunkResponse.status}`);
        }

        // 更新单个文件的进度（用于回调）
        const uploadedBytes = Math.min((chunkIndex + 1) * CHUNK_SIZE, totalSize);
        if (onFileProgress) {
          onFileProgress(uploadedBytes, totalSize);
        }
      }

      // 3. 调用 /api/v1/upload/complete 完成上传
      console.log('Completing upload:', upload_id);
      const completeResponse = await fetch(
        `${API_BASE_URL}/api/v1/upload/complete/${upload_id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : 'Basic YWRtaW46YWRtaW4=',
          },
          body: JSON.stringify({
            upload_id: upload_id,
            filename: file.name,
            dataset_info: datasetInfo && datasetInfo.name ? {
              name: datasetInfo.name,
              description: datasetInfo.description || '',
              dataset_type: datasetInfo.dataset_type,
              class_names: []
            } : null
          }),
        }
      );

      if (!completeResponse.ok) {
        const errorText = await completeResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText || `HTTP ${completeResponse.status}` };
        }
        console.error('Complete upload failed:', errorData);
        throw new Error(errorData.detail || `Failed to complete upload: ${completeResponse.status}`);
      }

      const completeData = await completeResponse.json();
      console.log('Upload completed:', completeData);
      return completeData;
    } catch (error: any) {
      console.error('Upload error in uploadFileInChunks:', error);
      throw error;
    }
  }, [datasetInfo, onProgress]);

  const handleUpload = useCallback(async () => {
    const files = uppy.getFiles();
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    console.log('Files to upload:', files);
    toast.info(`Starting upload of ${files.length} file(s)...`);

    let uploadedFiles = 0;
    let totalBytes = files.reduce((sum, f) => sum + (f.size || 0), 0);
    let uploadedBytes = 0;
    const fileSizes = files.map(f => f.size || 0);
    const fileUploadedBytes: number[] = new Array(files.length).fill(0);

    let lastResult: any = null;
    
    // 更新进度的辅助函数
    const updateProgress = () => {
      if (onProgress) {
        const totalUploaded = fileUploadedBytes.reduce((sum, bytes) => sum + bytes, 0);
        const percentage = totalBytes > 0 ? Math.round((totalUploaded / totalBytes) * 100) : 0;
        onProgress({
          percentage,
          uploadedFiles,
          totalFiles: files.length,
          uploadedBytes: totalUploaded,
          totalBytes,
        });
      }
    };
    
    try {
      // 逐个上传文件
      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        const uppyFile = files[fileIndex];
        try {
          // 获取实际的 File 对象
          const file = uppyFile.data as File;
          
          if (!file || !(file instanceof File)) {
            console.error('Invalid file object:', uppyFile);
            toast.error(`File "${uppyFile.name}" is invalid`);
            continue;
          }

          console.log(`Uploading file: ${file.name}, size: ${file.size}`);
          
          // 上传文件，并传入进度回调
          const result = await uploadFileInChunks(
            file,
            (fileUploaded, fileTotal) => {
              // 更新当前文件的上传字节数
              fileUploadedBytes[fileIndex] = fileUploaded;
              // 更新总进度
              updateProgress();
            }
          );
          
          lastResult = result; // 保存最后一个文件的上传结果（包含 dataset_id）
          uploadedFiles++;
          fileUploadedBytes[fileIndex] = file.size || 0; // 确保文件完成时设置为完整大小
          uploadedBytes += file.size || 0;
          
      toast.success(`File "${file.name}" uploaded successfully`);
      
          // 更新最终进度
          updateProgress();
        } catch (error: any) {
          console.error(`Error uploading file ${uppyFile.name}:`, error);
          toast.error(`File "${uppyFile.name}" upload failed: ${error.message || 'Unknown error'}`);
        }
      }

      // 所有文件上传完成，传递后端返回的结果（包含 dataset_id）
      if (onUploadComplete) {
        onUploadComplete(lastResult || {
          successful: files.slice(0, uploadedFiles),
          failed: files.slice(uploadedFiles),
        });
      }

      if (uploadedFiles === files.length) {
        toast.success('All files uploaded successfully');
        setTimeout(() => {
          uppy.cancelAll();
          uppy.clear();
        }, 2000);
      } else {
        toast.warning(`${uploadedFiles} of ${files.length} files uploaded successfully`);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
    }
  }, [uppy, onUploadComplete, onProgress, uploadFileInChunks]);

  React.useEffect(() => {
    return () => {
      // Clean up Uppy instance
      uppy.cancelAll();
      uppy.clear();
    };
  }, [uppy]);

  return (
    <div className="w-full">
      <Dashboard
        uppy={uppy}
        height={400 as any}
        proudlyDisplayPoweredByUppy={false}
        showRemoveButtonAfterComplete={true}
        showProgressDetails={true}
        hideUploadButton={true}
        hideRetryButton={true}
        hidePauseResumeButton={true}
        hideCancelButton={true}
        theme="light"
        locale={{} as any}
      />
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={(e) => {
            e.preventDefault();
            console.log('Upload button clicked');
            console.log('Dataset Info:', datasetInfo);
            console.log('Files count:', fileCount);
            handleUpload();
          }}
          disabled={fileCount === 0 || (requireDatasetInfo && (!datasetInfo || !datasetInfo.name || !datasetInfo.dataset_type))}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
