# YOLO Dataset Annotation Platform

Professional YOLO dataset annotation and management platform, supporting large file chunked uploads, intelligent annotation, team collaboration and more.

## Tech Stack

- **Frontend Framework**: Next.js 14 + App Router
- **Development Language**: TypeScript
- **Styling Framework**: Tailwind CSS v4
- **State Management**: Zustand + React Query
- **HTTP Client**: Axios
- **UI Components**: Custom component library
- **File Upload**: React Dropzone + Chunked upload
- **Notification System**: Sonner
- **Type System**: Complete TypeScript type definitions

## Features

### 🚀 Fast Upload
- Support 100GB large file chunked upload
- Resumable transfer, pause and resume functionality
- Progress tracking and state management
- Batch multi-file uploads

### 🎯 Smart Annotation
- Professional YOLO annotation tools
- Support rectangle and polygon annotations
- Visual annotation interface
- YOLO/COCO/Pascal VOC format support

### 👥 Team Collaboration
- Multi-user collaborative annotation
- Real-time annotation result synchronization
- Permission and role management
- Collaboration session management

### 📊 Data Management
- Dataset CRUD operations
- Image list and detail viewing
- Batch annotation operations
- Export multiple formats

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard
│   ├── datasets/          # Dataset pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Basic UI components
│   ├── auth/             # Authentication components
│   ├── layout/           # Layout components
│   ├── upload/           # Upload components
│   └── viewer/           # Viewer components
├── lib/                  # Core libraries
│   ├── api.ts           # API client
│   ├── auth.ts          # Authentication utilities
│   ├── hooks.ts         # React Query Hooks
│   ├── providers.tsx    # React Query Provider
│   └── utils.ts         # Utility functions
├── stores/              # Zustand state management
│   ├── auth.store.ts    # Authentication state
│   ├── dataset.store.ts # Dataset state
│   └── upload.store.ts  # Upload state
└── types/               # TypeScript type definitions
    ├── auth.ts          # Authentication types
    ├── dataset.ts       # Dataset types
    ├── annotation.ts    # Annotation types
    ├── upload.ts        # Upload types
    └── index.ts         # Type exports
```

## Core Feature Implementation

### API Client Layer (lib/api.ts)
- Complete Axios configuration and interceptors
- JWT Token automatic management and refresh
- Error handling and retry mechanism
- All API endpoint implementations:
  - Authentication API (login/register/refresh)
  - Dataset API (CRUD/statistics/sharing)
  - Image API (list/details/thumbnails)
  - Annotation API (CRUD/batch operations)
  - Upload API (chunked upload/status tracking)
  - Collaboration API (session management)
  - Analysis API (statistics)

### Authentication System (lib/auth.ts)
- JWT Token parsing and validation
- Permission checking and role management
- Route protection mechanism
- Authentication state persistence

### React Query Hooks (lib/hooks.ts)
- Data caching and state management
- Optimistic updates
- Error boundary handling
- Real-time data synchronization

### State Management (stores/)
- Zustand lightweight state management
- Persistent storage
- Real-time state synchronization

### UI Component Library (components/ui/)
- Button, Input, Card and other basic components
- Modal, Loading, Badge and other composite components
- Complete TypeScript type definitions
- Consistent design system

### Type System (types/)
- Complete TypeScript interface definitions
- API response types
- State types
- Component Props types

## Page Implementations

### Home Page (app/page.tsx)
- Product introduction and feature showcase
- Technical feature display
- Responsive design

### Authentication Pages
- `/auth/login` - User login
- `/auth/register` - User registration
- Form validation and error handling

### Dashboard (app/dashboard/page.tsx)
- Data overview and statistics
- Quick action shortcuts
- Recent activity display

## Environment Configuration

The project uses `.env.local` file for environment variable configuration:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api

# Application Configuration
NEXT_PUBLIC_APP_NAME=YOLO Dataset Annotation Platform
NEXT_PUBLIC_APP_VERSION=1.0.0

# Feature Flags
NEXT_PUBLIC_ENABLE_COLLABORATION=true
NEXT_PUBLIC_ENABLE_REALTIME_SYNC=true

# Upload Configuration
NEXT_PUBLIC_UPLOAD_CHUNK_SIZE=52428800
NEXT_PUBLIC_UPLOAD_MAX_CONCURRENT=3

# Annotation Configuration
NEXT_PUBLIC_ANNOTATION_DEFAULT_TOOL=rectangle
NEXT_PUBLIC_ANNOTATION_SHOW_GRID=false
```

## Development Guide

### Start Development Server
```bash
npm run dev
```

### Build Production Version
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Code Linting
```bash
npm run lint
```

## Core Features

### Chunked Upload
- 50MB chunk size
- Concurrent upload control
- Resumable transfer support
- Progress tracking and state management

### Annotation System
- Canvas-based annotation
- Multiple annotation tools
- YOLO format support
- Real-time preview and editing

### State Management
- Client-side state: Zustand
- Server-side state: React Query
- Persistent storage
- State synchronization

### Error Handling
- Global error boundaries
- API error handling
- Network error retry
- User-friendly error messages

## Technical Highlights

1. **Type Safety**: Complete TypeScript type definitions ensuring type safety
2. **State Management**: Best practices combining Zustand and React Query
3. **Performance Optimization**: Virtual scrolling, lazy loading, caching strategies
4. **User Experience**: Smooth animations, real-time feedback, responsive design
5. **Maintainability**: Modular architecture, clear code structure, complete comments

## Development Status

✅ **Completed**:
- Project initialization and configuration
- Core type definitions
- API client layer
- Authentication system
- State management
- UI component library
- Basic page implementations
- React Query integration

🔄 **To Be Implemented**:
- Image viewer component
- Annotation Canvas component
- File upload component
- Dataset management pages
- Advanced authentication features
- Collaboration features
- Test coverage

## Contribution Guidelines

1. Follow TypeScript best practices
2. Use Tailwind CSS for styling
3. Keep components modular and reusable
4. Add proper error handling
5. Write clear documentation and comments

---
**Version**: 1.0.0  
**License**: MIT
