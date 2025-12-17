
export interface MealDBRecipe {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions?: string;
  strYoutube?: string;
  strSource?: string;
  [key: string]: string | undefined; // For dynamic ingredients/measures
}

export interface AppRecipe {
  id: string;
  title: string;
  image: string;
  instructions: string;
  ingredients: string[];
  measures: string[];
  youtubeUrl?: string;
  sourceUrl?: string;
}

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export async function filterByIngredient(ingredient: string): Promise<AppRecipe[]> {
  try {
    const response = await fetch(`${BASE_URL}/filter.php?i=${ingredient}`);
    const data = await response.json();
    
    if (!data.meals) return [];

    // The filter endpoint only returns id, title, and image.
    // We map them to our AppRecipe format with partial data.
    return data.meals.map((meal: MealDBRecipe) => ({
      id: meal.idMeal,
      title: meal.strMeal,
      image: meal.strMealThumb,
      instructions: '',
      ingredients: [],
      measures: [],
    }));
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }
}

export async function getRecipeById(id: string): Promise<AppRecipe | null> {
  try {
    const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
    const data = await response.json();
    
    if (!data.meals || data.meals.length === 0) return null;

    const meal = data.meals[0];
    const ingredients: string[] = [];
    const measures: string[] = [];

    // Extract ingredients and measures (strIngredient1, strMeasure1, etc.)
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        
        if (ingredient && ingredient.trim()) {
            ingredients.push(ingredient.trim());
            measures.push(measure ? measure.trim() : '');
        }
    }

    return {
      id: meal.idMeal,
      title: meal.strMeal,
      image: meal.strMealThumb,
      instructions: meal.strInstructions || '',
      ingredients,
      measures,
      youtubeUrl: meal.strYoutube,
      sourceUrl: meal.strSource,
    };
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    return null;
  }
}
