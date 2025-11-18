'use client';

import React, { useState, useCallback } from 'react';
import Uppy from '@uppy/core';
import { Dashboard } from '@uppy/react';
import AwsS3 from '@uppy/aws-s3';
import ProgressBar from '@uppy/progress-bar';
import { toast } from 'sonner';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import '@uppy/progress-bar/dist/style.css';

// Setup MinIO configuration - adjust according to your environment
const MINIO_CONFIG = {
  endpoint: process.env.NEXT_PUBLIC_MINIO_ENDPOINT || 'localhost:9000',
  region: process.env.NEXT_PUBLIC_MINIO_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_MINIO_ACCESS_KEY || '',
    secretAccessKey: process.env.NEXT_PUBLIC_MINIO_SECRET_KEY || '',
  },
  forcePathStyle: true,
};

interface UppyUploadProps {
  datasetId: string;
  onUploadComplete?: (result: any) => void;
}

export default function UppyUpload({ datasetId, onUploadComplete }: UppyUploadProps) {
  const [uppy] = useState(() => 
    new Uppy({
      restrictions: {
        allowedFileTypes: ['image/*'],
        maxNumberOfFiles: 100,
        maxFileSize: 100 * 1024 * 1024, // 100MB
      },
      autoProceed: false,
      allowMultipleUploadBatches: true,
    })
      .use(AwsS3, {
        getUploadParameters: async (file) => {
          // Need to implement logic to get presigned URL
          try {
            const response = await fetch('/api/upload/sign', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')!).user.id : ''}`,
              },
              body: JSON.stringify({
                filename: file.name,
                contentType: file.type,
                datasetId,
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to get upload URL');
            }

            const data = await response.json();
            return {
              method: 'PUT',
              url: data.url,
              headers: {
                'Content-Type': file.type,
              },
            };
          } catch (error) {
            console.error('Error getting upload parameters:', error);
            throw error;
          }
        },
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
      })
  );

  const handleUpload = useCallback(() => {
    uppy.on('upload', () => {
      toast.info('Starting file upload...');
    });

    uppy.on('upload-success', (file, response) => {
      toast.success(`File "${file.name}" uploaded successfully`);
      
      // Notify server that file upload is complete
      fetch('/api/upload/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')!).user.id : ''}`,
        },
        body: JSON.stringify({
          key: response.uploadURL?.split('/').pop(),
          filename: file.name,
          datasetId,
        }),
      }).catch(error => {
        console.error('Error notifying upload completion:', error);
      });

      if (onUploadComplete) {
        onUploadComplete(response);
      }
    });

    uppy.on('upload-error', (file, error) => {
      toast.error(`File "${file.name}" upload failed: ${error.message}`);
    });

    uppy.on('complete', () => {
      toast.success('All files uploaded successfully');
      uppy.reset();
    });

    uppy.upload();
  }, [uppy, datasetId, onUploadComplete]);

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
        height={400}
        proudlyDisplayPoweredByUppy={false}
        showRemoveButtonAfterComplete={true}
        showProgressDetails={true}
        showProgressPanel={true}
        theme="light"
        locale={{
          strings: {
            dropFiles: 'Drop files here',
            browse: 'Browse files',
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
        }}
      />
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleUpload}
          disabled={uppy.getFiles().length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Start Upload ({uppy.getFiles().length} files)
        </button>
      </div>
    </div>
  );
}
