import { create } from 'zustand';
import { Dataset, DatasetQueryParams, CreateDatasetRequest, UpdateDatasetRequest } from '../types';
import { datasetApi } from '../lib/api';

interface DatasetState {
  datasets: Dataset[];
  currentDataset: Dataset | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  filters: DatasetQueryParams;
  selectedDatasets: string[];

  // Actions
  fetchDatasets: (params?: DatasetQueryParams) => Promise<void>;
  fetchDataset: (id: string) => Promise<void>;
  createDataset: (data: CreateDatasetRequest) => Promise<Dataset>;
  updateDataset: (id: string, data: UpdateDatasetRequest) => Promise<void>;
  deleteDataset: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  shareDataset: (id: string, userIds: string[], role: string) => Promise<void>;
  setCurrentDataset: (dataset: Dataset | null) => void;
  setFilters: (filters: Partial<DatasetQueryParams>) => void;
  clearFilters: () => void;
  selectDataset: (id: string) => void;
  selectMultipleDatasets: (ids: string[]) => void;
  clearSelection: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

const defaultFilters: DatasetQueryParams = {
  page: 1,
  limit: 20,
  sort_by: 'created_at',
  sort_order: 'desc'
};

export const useDatasetStore = create<DatasetState>((set, get) => ({
  datasets: [],
  currentDataset: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    has_next: false,
    has_prev: false
  },
  filters: defaultFilters,
  selectedDatasets: [],

  fetchDatasets: async (params?: DatasetQueryParams) => {
    set({ isLoading: true, error: null });
    
    try {
      const currentFilters = get().filters;
      const searchParams = { ...currentFilters, ...params };
      
      const response = await datasetApi.getDatasets(searchParams);
      
      // getDatasets 返回 PaginatedResponse<Dataset>，直接包含 data 和 pagination
      set({
        datasets: response.data || [],
        pagination: response.pagination,
        filters: searchParams,
        isLoading: false
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '获取数据集列表失败';
      set({
        error: errorMessage,
        isLoading: false
      });
      throw error;
    }
  },

  fetchDataset: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // getDataset 直接返回 Dataset
      const dataset = await datasetApi.getDataset(id);
      
      set({
        currentDataset: dataset,
        isLoading: false
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '获取数据集详情失败';
      set({
        error: errorMessage,
        isLoading: false
      });
      throw error;
    }
  },

  createDataset: async (data: CreateDatasetRequest): Promise<Dataset> => {
    set({ isLoading: true, error: null });
    
    try {
      // createDataset 直接返回 Dataset
      const newDataset = await datasetApi.createDataset(data as Omit<Dataset, 'id' | 'owner_id' | 'created_at' | 'updated_at'>);
      
      set(state => ({
        datasets: [newDataset, ...state.datasets],
        isLoading: false
      }));
      
      return newDataset;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '创建数据集失败';
      set({
        error: errorMessage,
        isLoading: false
      });
      throw error;
    }
  },

  updateDataset: async (id: string, data: UpdateDatasetRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      // updateDataset 直接返回 Dataset
      const updatedDataset = await datasetApi.updateDataset(id, data as Partial<Dataset>);
      
      set(state => ({
        datasets: state.datasets.map(d => 
          d.dataset_id === id ? updatedDataset : d
        ),
        currentDataset: state.currentDataset?.dataset_id === id 
          ? updatedDataset 
          : state.currentDataset,
        isLoading: false
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '更新数据集失败';
      set({
        error: errorMessage,
        isLoading: false
      });
      throw error;
    }
  },

  deleteDataset: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // deleteDataset 返回 void
      await datasetApi.deleteDataset(id);
      
      set(state => ({
        datasets: state.datasets.filter(d => d.dataset_id !== id),
        currentDataset: state.currentDataset?.dataset_id === id 
          ? null 
          : state.currentDataset,
        selectedDatasets: state.selectedDatasets.filter(datasetId => datasetId !== id),
        isLoading: false
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '删除数据集失败';
      set({
        error: errorMessage,
        isLoading: false
      });
      throw error;
    }
  },

  toggleFavorite: async (id: string) => {
    const { datasets } = get();
    const dataset = datasets.find(d => d.dataset_id === id);
    
    if (!dataset) {
      throw new Error('数据集不存在');
    }
    
    try {
      await get().updateDataset(id, { 
        is_favorite: !dataset.is_favorite 
      });
    } catch (error) {
      // 乐观更新，失败时恢复
      console.error('Toggle favorite failed:', error);
      throw error;
    }
  },

  shareDataset: async (id: string, userIds: string[], role: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // shareDataset 的参数是 (id: string, emails: string[], permission: 'viewer' | 'editor' | 'annotator')
      await datasetApi.shareDataset(id, userIds, role as 'viewer' | 'editor' | 'annotator');
      
      // 重新获取数据集详情以更新协作者列表
      await get().fetchDataset(id);
      set({ isLoading: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '共享数据集失败';
      set({
        error: errorMessage,
        isLoading: false
      });
      throw error;
    }
  },

  setCurrentDataset: (dataset: Dataset | null) => {
    set({ currentDataset: dataset });
  },

  setFilters: (newFilters: Partial<DatasetQueryParams>) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  clearFilters: () => {
    set({ filters: defaultFilters });
  },

  selectDataset: (id: string) => {
    set(state => ({
      selectedDatasets: state.selectedDatasets.includes(id)
        ? state.selectedDatasets.filter(datasetId => datasetId !== id)
        : [...state.selectedDatasets, id]
    }));
  },

  selectMultipleDatasets: (ids: string[]) => {
    set({ selectedDatasets: ids });
  },

  clearSelection: () => {
    set({ selectedDatasets: [] });
  },

  clearError: () => set({ error: null }),

  setLoading: (loading: boolean) => set({ isLoading: loading })
}));

// 选择器的派生状态
export const useDatasetSelectors = () => {
  const { datasets, selectedDatasets, currentDataset } = useDatasetStore();
  
  return {
    // 选中的数据集
    selectedDatasetsData: datasets.filter(d => selectedDatasets.includes(d.dataset_id)),
    
    // 当前数据集的索引
    currentDatasetIndex: currentDataset 
      ? datasets.findIndex(d => d.dataset_id === currentDataset.dataset_id)
      : -1,
    
    // 是否有选中项
    hasSelection: selectedDatasets.length > 0,
    
    // 是否全部选中
    isAllSelected: datasets.length > 0 && selectedDatasets.length === datasets.length,
    
    // 选中的数据集数量
    selectedCount: selectedDatasets.length,
    
    // 总数据集数量
    totalCount: datasets.length
  };
};

// 批量操作的 Hook
export const useBatchDatasetOperations = () => {
  const { selectedDatasets, clearSelection } = useDatasetStore();
  
  const batchDelete = async () => {
    if (selectedDatasets.length === 0) return;
    
    const confirmDelete = window.confirm(
      `确定要删除选中的 ${selectedDatasets.length} 个数据集吗？此操作不可撤销。`
    );
    
    if (!confirmDelete) return;
    
    const { deleteDataset } = useDatasetStore.getState();
    
    // 并行删除所有选中的数据集
    await Promise.allSettled(
      selectedDatasets.map(id => deleteDataset(id))
    );
    
    clearSelection();
  };
  
  const batchToggleFavorite = async () => {
    if (selectedDatasets.length === 0) return;
    
    const { toggleFavorite } = useDatasetStore.getState();
    
    // 批量切换收藏状态
    await Promise.allSettled(
      selectedDatasets.map(id => toggleFavorite(id))
    );
    
    clearSelection();
  };
  
  const batchExport = async (format: string) => {
    if (selectedDatasets.length === 0) return;
    
    // 这里可以实现批量导出逻辑
    console.log('Exporting datasets:', selectedDatasets, 'in format:', format);
    
    clearSelection();
  };
  
  return {
    batchDelete,
    batchToggleFavorite,
    batchExport,
    selectedCount: selectedDatasets.length
  };
};
