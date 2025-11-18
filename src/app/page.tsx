'use client';

import React from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            YOLO Dataset Annotation Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Professional YOLO dataset annotation and management platform. Make machine learning data annotation simple and efficient.
            Supports batch upload, intelligent annotation, team collaboration and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <a href="/auth/register">Get Started</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <a href="/auth/login">Sign In</a>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">🚀 Fast Upload</CardTitle>
              <CardDescription>Support 100GB large file chunked upload with resumable transfer</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Advanced chunked upload technology supporting super large files with pause, resume, and resumable transfer capabilities.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">🎯 Smart Annotation</CardTitle>
              <CardDescription>Professional annotation tools with multiple format support</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Complete YOLO annotation tools with rectangle and polygon support, visual interface with intuitive operation.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">👥 Team Collaboration</CardTitle>
              <CardDescription>Multi-user collaboration with real-time synchronization</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Support team member collaborative annotation with real-time synchronization and configurable permissions and roles.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Technical Features */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Technical Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-gray-600 dark:text-gray-300">Upload Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">100GB</div>
              <div className="text-gray-600 dark:text-gray-300">Max File Size</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-300">Concurrent Projects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-300">Technical Support</div>
            </div>
          </div>
        </div>

        {/* Supported Formats */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Supported Data Formats</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Image Formats</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• JPEG / JPG</li>
                <li>• PNG</li>
                <li>• WebP</li>
                <li>• TIFF</li>
                <li>• BMP</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Annotation Formats</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• YOLO (TXT)</li>
                <li>• COCO (JSON)</li>
                <li>• Pascal VOC (XML)</li>
                <li>• Label Studio</li>
                <li>• Custom Format</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Export Formats</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• YOLO</li>
                <li>• COCO</li>
                <li>• Pascal VOC</li>
                <li>• JSON</li>
                <li>• CSV</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Annotation Journey?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Register now and start creating and annotating your YOLO datasets
          </p>
          <Button asChild size="lg" className="text-lg px-8">
            <a href="/auth/register">Get Started Free</a>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 YOLO Dataset Annotation Platform. Developed by MiniMax Agent.</p>
        </div>
      </footer>
    </div>
  );
}