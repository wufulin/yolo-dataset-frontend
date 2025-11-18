'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simplified authentication: username and password are both admin
    if (username === 'admin' && password === 'admin') {
      // Store simplified authentication state
      localStorage.setItem('auth', JSON.stringify({
        isAuthenticated: true,
        user: { id: '1', username: 'admin', role: 'admin' },
        timestamp: Date.now()
      }));
      
      toast.success('Login successful');
      router.push('/dashboard');
    } else {
      toast.error('Incorrect username or password, please use admin/admin');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">YOLO Annotation Platform</CardTitle>
          <CardDescription className="text-center">
            Please login with administrator account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoFocus
            />
            
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Default Account:</strong> admin / admin
              </p>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}