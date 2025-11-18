'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui';
import { 
  Home, 
  FolderOpen, 
  Upload, 
  Tag, 
  LogOut 
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
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                YOLO Annotation Platform
              </h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    className={`${
                      item.current
                        ? 'border-blue-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Welcome, {user.username}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 移动端导航 */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`${
                  item.current
                    ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left`}
              >
                <Icon className="h-4 w-4 inline mr-2" />
                {item.name}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
