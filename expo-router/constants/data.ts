import { Colors } from './Colors';

export interface Product {
  id: string;
  name: string;
  image: string;
  expiryDate: string; // ISO date string
  category: 'Fridge' | 'Pantry' | 'Freezer';
  quantity: string;
}

export interface Recipe {
  id: string;
  title: string;
  image: string;
  usedIngredients: string[];
  missingIngredients: number;
}

const getFutureDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Fresh Milk',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    expiryDate: getFutureDate(1), // Expires in 1 day (Red)
    category: 'Fridge',
    quantity: '1L',
  },
  {
    id: '2',
    name: 'Avocados',
    image: 'https://images.unsplash.com/photo-1523049673856-42848c51a7d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    expiryDate: getFutureDate(2), // Expires in 2 days (Red)
    category: 'Pantry',
    quantity: '3 pcs',
  },
  {
    id: '3',
    name: 'Greek Yogurt',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    expiryDate: getFutureDate(5), // Expires in 5 days (Yellow)
    category: 'Fridge',
    quantity: '500g',
  },
  {
    id: '4',
    name: 'Chicken Breast',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    expiryDate: getFutureDate(6), // Expires in 6 days (Yellow)
    category: 'Fridge',
    quantity: '2 packs',
  },
  {
    id: '5',
    name: 'Pasta',
    image: 'https://images.unsplash.com/photo-1551462147-37885acc36f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    expiryDate: getFutureDate(365), // Safe (Green)
    category: 'Pantry',
    quantity: '2 boxes',
  },
  {
    id: '6',
    name: 'Frozen Peas',
    image: 'https://images.unsplash.com/photo-1516684732162-7988587c6777?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    expiryDate: getFutureDate(180), // Safe (Green)
    category: 'Freezer',
    quantity: '1 bag',
  },
  {
    id: '7',
    name: 'Spinach',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    expiryDate: getFutureDate(2), // Red
    category: 'Fridge',
    quantity: '1 bag',
  }
];

export const RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Avocado & Spinach Smoothie',
    image: 'https://images.unsplash.com/photo-1623126867623-1d02c6381016?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    usedIngredients: ['Avocados', 'Spinach', 'Fresh Milk'],
    missingIngredients: 0,
  },
  {
    id: '2',
    title: 'Creamy Chicken Pasta',
    image: 'https://images.unsplash.com/photo-1579631542720-3a87824fff86?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    usedIngredients: ['Chicken Breast', 'Pasta'],
    missingIngredients: 2, // e.g. Cream, Garlic
  },
  {
    id: '3',
    title: 'Yogurt Parfait',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    usedIngredients: ['Greek Yogurt'],
    missingIngredients: 1, // Berries
  }
];
