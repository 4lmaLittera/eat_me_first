import { create } from 'zustand';
import {
  Product,
  NewProduct,
  getProducts,
  insertProduct,
  updateProduct,
  deleteProduct,
  markAsConsumed,
  getExpiringProducts,
  getStats,
  initDatabase,
  updateExpiredProducts,
  markAsExpired,
} from '../utils/database';

interface ProductsState {
  products: Product[];
  expiringSoon: Product[];
  stats: {
    totalActive: number;
    expiringSoon: number;
    consumed: number;
    expired: number;
  };
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  loadProducts: () => Promise<void>;
  addProduct: (product: NewProduct) => Promise<number>;
  editProduct: (id: number, updates: Partial<NewProduct>) => Promise<void>;
  removeProduct: (id: number) => Promise<void>;
  wasteProduct: (id: number) => Promise<void>;
  consumeProduct: (id: number) => Promise<void>;
  refreshStats: () => Promise<void>;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  expiringSoon: [],
  stats: {
    totalActive: 0,
    expiringSoon: 0,
    consumed: 0,
    expired: 0,
  },
  isLoading: false,
  isInitialized: false,
  error: null,
  
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      await initDatabase();
      await updateExpiredProducts();
      await get().loadProducts();
      await get().refreshStats();
      set({ isInitialized: true, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to initialize database',
        isLoading: false 
      });
    }
  },
  
  loadProducts: async () => {
    try {
      set({ isLoading: true, error: null });
      // Ensure we process any expired items before loading
      await updateExpiredProducts();
      
      const [products, expiringSoon] = await Promise.all([
        getProducts(),
        getExpiringProducts(3),
      ]);
      set({ products, expiringSoon, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load products',
        isLoading: false 
      });
    }
  },
  
  addProduct: async (product: NewProduct) => {
    try {
      set({ isLoading: true, error: null });
      const id = await insertProduct(product);
      await get().loadProducts(); // This will trigger updateExpiredProducts
      await get().refreshStats();
      return id;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add product',
        isLoading: false 
      });
      throw error;
    }
  },
  
  editProduct: async (id: number, updates: Partial<NewProduct>) => {
    try {
      set({ isLoading: true, error: null });
      await updateProduct(id, updates);
      await get().loadProducts();
      await get().refreshStats();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update product',
        isLoading: false 
      });
      throw error;
    }
  },

  removeProduct: async (id: number) => {
    try {
      set({ isLoading: true, error: null });
      await deleteProduct(id);
      await get().loadProducts();
      await get().refreshStats();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete product',
        isLoading: false 
      });
      throw error;
    }
  },

  wasteProduct: async (id: number) => {
    try {
      set({ isLoading: true, error: null });
      await markAsExpired(id); // Mark as expired (wasted)
      await get().loadProducts();
      await get().refreshStats();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to mark as wasted',
        isLoading: false 
      });
      throw error;
    }
  },
  
  consumeProduct: async (id: number) => {
    try {
      set({ isLoading: true, error: null });
      await markAsConsumed(id);
      await get().loadProducts();
      await get().refreshStats();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to mark as consumed',
        isLoading: false 
      });
      throw error;
    }
  },
  
  refreshStats: async () => {
    try {
      const stats = await getStats();
      set({ stats });
    } catch (error) {
      // Silent fail for stats
    }
  },
}));

// Helper hooks
export const useProducts = () => useProductsStore((state) => state.products);
export const useExpiringSoon = () => useProductsStore((state) => state.expiringSoon);
export const useStats = () => useProductsStore((state) => state.stats);
export const useIsLoading = () => useProductsStore((state) => state.isLoading);
export const useIsInitialized = () => useProductsStore((state) => state.isInitialized);
