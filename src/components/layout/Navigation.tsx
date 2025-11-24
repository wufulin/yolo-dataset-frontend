'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui';
import { 
  Home, 
  FolderOpen, 
  Upload, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { clearAuthState, getCurrentUser } from '@/lib/auth-simple';
import { toast } from 'sonner';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const user = getCurrentUser();

  const handleLogout = () => {
    clearAuthState();
    toast.success('Logged out successfully');
    router.push('/auth/login');
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      current: pathname === '/dashboard'
    },
    {
      name: 'Datasets',
      href: '/datasets',
      icon: FolderOpen,
      current: pathname.startsWith('/datasets')
    },
    {
      name: 'Upload',
      href: '/upload',
      icon: Upload,
      current: pathname === '/upload'
    }
  ];

  if (!user || pathname.startsWith('/auth/')) {
    return null;
  }

  return (
    <nav className="relative bg-gradient-to-r from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
      {/* 装饰性背景元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200/10 dark:bg-blue-900/5 rounded-full -ml-32 -mt-32 blur-3xl"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/10 dark:bg-indigo-900/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                YOLO Platform
              </h1>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    className={`${
                      item.current
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 border-transparent'
                    } relative inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border`}
                  >
                    {item.current && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-400/10 dark:to-indigo-400/10 rounded-lg"></div>
                    )}
                    <Icon className={`h-4 w-4 mr-2 ${item.current ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                    <span className="relative z-10">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user.username}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2 border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 移动端导航 */}
      <div className="sm:hidden relative">
        <div className="pt-2 pb-3 space-y-1 px-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`${
                  item.current
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-500 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white'
                } relative flex items-center pl-4 pr-4 py-2.5 border-l-4 rounded-r-lg text-base font-semibold w-full text-left transition-all duration-200`}
              >
                {item.current && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 dark:from-blue-400/5 dark:to-indigo-400/5 rounded-r-lg"></div>
                )}
                <Icon className={`h-5 w-5 mr-3 ${item.current ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                <span className="relative z-10">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
