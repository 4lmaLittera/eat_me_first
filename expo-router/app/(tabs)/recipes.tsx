import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack, XStack, Text, Image, Card, Button, Spinner, Sheet, Checkbox } from 'tamagui';
import { ChefHat, Flame, Clock, ArrowRight, RefreshCw, Filter, Check } from '@tamagui/lucide-icons';
import { Colors } from '../../constants/Colors';
import { useProducts, useExpiringSoon } from '../../store/products';
import { filterByIngredient, getRecipeById, AppRecipe } from '../../utils/mealdb';
import * as Haptics from 'expo-haptics';

import { useRouter } from 'expo-router';

export default function RecipesScreen() {
  const router = useRouter();
  const products = useProducts();
  const expiringSoon = useExpiringSoon();
  const [recipes, setRecipes] = useState<AppRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Multi-select state
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // Initial load: Select one expiring item or random item
  useEffect(() => {
    if (selectedIngredients.length === 0) {
      if (expiringSoon.length > 0) {
        setSelectedIngredients([expiringSoon[0].name]);
      } else if (products.length > 0) {
        const random = products[Math.floor(Math.random() * products.length)];
        setSelectedIngredients([random.name]);
      } else {
         // Default fallback
         setSelectedIngredients(['Chicken']);
      }
    }
  }, [products]);

  const fetchRecipes = async () => {
    if (selectedIngredients.length === 0) return;

    setLoading(true);
    
    try {
      // 1. Fetch recipes for ALL selected ingredients in parallel
      // We clean the names first (remove emojis)
      const queries = selectedIngredients.map(ing => ing.split(' ').pop() || ing);
      
      const resultsArray = await Promise.all(
        queries.map(q => filterByIngredient(q))
      );

      // 2. Count occurrences of each recipe ID
      const recipeCounts = new Map<string, { count: number, recipe: AppRecipe }>();
      
      resultsArray.forEach((list, index) => {
        list.forEach(recipe => {
          const current = recipeCounts.get(recipe.id) || { count: 0, recipe };
          // Boost score if it matches multiple lists
          recipeCounts.set(recipe.id, { count: current.count + 1, recipe });
        });
      });

      // 3. Convert to array and sort by match count (descending)
      let sortedRecipes = Array.from(recipeCounts.values())
        .map(item => item.recipe)
        .sort((a, b) => {
           const countA = recipeCounts.get(a.id)?.count || 0;
           const countB = recipeCounts.get(b.id)?.count || 0;
           return countB - countA;
        });

      // 4. Take top 10 matches
      const topMatches = sortedRecipes.slice(0, 10);
      
      // 5. Fetch full details for these top matches to get actual ingredients list
      // This allows us to confirm intersection and show "Uses X, Y" badges correctly
      const detailedRecipes = await Promise.all(
        topMatches.map(r => getRecipeById(r.id))
      );

      // Filter out any nulls
      const validRecipes = detailedRecipes.filter((r): r is AppRecipe => r !== null);
      
      setRecipes(validRecipes);

    } catch (error) {
      console.error('Failed to fetch recipes', error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [selectedIngredients]);

  const onRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchRecipes();
  };

  const toggleIngredient = (name: string) => {
    Haptics.selectionAsync();
    setSelectedIngredients(prev => {
      if (prev.includes(name)) {
        return prev.filter(i => i !== name);
      } else {
        return [...prev, name];
      }
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top', 'left', 'right']}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        <YStack padding="$4" gap="$5">
          
          <XStack justifyContent="space-between" alignItems="center">
            <YStack>
              <Text fontSize="$8" fontWeight="bold" color={Colors.text}>Inspiration</Text>
              <Text fontSize="$4" color={Colors.textSecondary}>Meals based on your kitchen</Text>
            </YStack>
            <Button 
              size="$3" 
              circular 
              icon={<Filter size={20} />} 
              onPress={() => setShowFilterSheet(true)}
              backgroundColor={selectedIngredients.length > 1 ? Colors.primary : Colors.surface}
              color={selectedIngredients.length > 1 ? 'white' : Colors.text}
            />
          </XStack>

          {/* Active Filters Display */}
          {selectedIngredients.length > 0 && (
             <XStack flexWrap="wrap" gap="$2">
               {selectedIngredients.map(ing => (
                 <XStack key={ing} backgroundColor={Colors.primaryLight} paddingHorizontal="$2" paddingVertical="$1" borderRadius="$4" alignItems="center" gap="$1">
                   {ing === selectedIngredients[0] && <Flame size={20} color={Colors.primary} />}
                   <Text fontSize="$4" color={Colors.primary} fontWeight="600">{ing} </Text>
                   <TouchableOpacity onPress={() => toggleIngredient(ing)}>
                     <Text fontSize="$6" color={Colors.primary} opacity={0.8}>×</Text>
                   </TouchableOpacity>
                 </XStack>
               ))}
             </XStack>
          )}

          {loading ? (
             <YStack height={200} alignItems="center" justifyContent="center">
               <Spinner size="large" color={Colors.primary} />
               <Text marginTop="$4" color={Colors.textSecondary}>Finding matching recipes...</Text>
             </YStack>
          ) : recipes.length > 0 ? (
            <YStack gap="$4">
              {recipes.map((recipe) => (
                <Card 
                  key={recipe.id} 
                  backgroundColor={Colors.surface} 
                  borderRadius="$6" 
                  overflow="hidden" 
                  elevation={3}
                  shadowColor="black"
                  shadowOpacity={0.1}
                  shadowRadius={10}
                >
                  <Image 
                    source={{ uri: recipe.image, width: 300, height: 200 }} 
                  />
                  
                  <YStack padding="$4" gap="$2">
                    <Text fontSize="$6" fontWeight="bold" color={Colors.text}>{recipe.title}</Text>
                    
                    <XStack flexWrap="wrap" gap="$2" marginTop="$2">
                      {/* Show badges for ALL selected ingredients that are in this recipe */}
                      {selectedIngredients.map(ing => {
                        // Check if ingredient exists in recipe.ingredients (partial match)
                        const search = ing.split(' ').pop()?.toLowerCase() || ing.toLowerCase();
                        const isUsed = recipe.ingredients.some(i => i.toLowerCase().includes(search));
                        
                        if (isUsed) {
                           return (
                              <XStack key={ing} backgroundColor={Colors.greenLight} paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2" alignItems="center">
                                <Text fontSize="$2" color={Colors.green} fontWeight="600">✓ Uses {ing}</Text>
                              </XStack>
                           );
                        }
                        return null;
                      })}
                    </XStack>
                    
                    <Button 
                      backgroundColor="transparent" 
                      padding="0" 
                      marginTop="$2" 
                      alignSelf="flex-end"
                      iconAfter={<ArrowRight size={16} color={Colors.primary} />}
                      onPress={() => {
                        Haptics.selectionAsync();
                        router.push(`/recipe/${recipe.id}`);
                      }}
                    >
                      <Text color={Colors.primary} fontWeight="bold">View Recipe</Text>
                    </Button>
                  </YStack>
                </Card>
              ))}
            </YStack>
          ) : (
             <YStack alignItems="center" padding="$5" gap="$3">
               <Text fontSize="$4" color={Colors.textSecondary} textAlign="center">
                 No recipes found. Try changing your filters.
               </Text>
             </YStack>
          )}

        </YStack>
      </ScrollView>

      {/* Pantry Filter Sheet */}
      <Sheet
        modal
        open={showFilterSheet}
        onOpenChange={setShowFilterSheet}
        snapPoints={[80]}
        dismissOnSnapToBottom
        zIndex={100_000}
      >
        <Sheet.Overlay />
        <Sheet.Frame padding="$4" backgroundColor={Colors.surface}>
          <Sheet.Handle />
          <YStack gap="$4" flex={1}>
            <XStack justifyContent="space-between" alignItems="center">
               <Text fontSize="$6" fontWeight="bold" color={Colors.text}>Select Ingredients</Text>
               <Button size="$3" chromeless onPress={() => setShowFilterSheet(false)}>Done</Button>
            </XStack>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <YStack gap="$2" paddingBottom="$8">
                {products.length === 0 && (
                   <Text color={Colors.textSecondary} textAlign="center">Your pantry is empty.</Text>
                )}
                {products.map(item => (
                  <TouchableOpacity key={item.id} onPress={() => toggleIngredient(item.name)}>
                    <XStack 
                      padding="$3" 
                      backgroundColor={selectedIngredients.includes(item.name) ? Colors.primaryLight : Colors.background}
                      borderRadius="$3"
                      alignItems="center"
                      justifyContent="space-between"
                      borderWidth={1}
                      borderColor={selectedIngredients.includes(item.name) ? Colors.primary : Colors.border}
                    >
                      <XStack gap="$3" alignItems="center">
                        <Text fontSize="$6">{selectedIngredients.includes(item.name) ? '🍳' : '⚪️'}</Text>
                        <YStack>
                           <Text fontSize="$4" color={Colors.text} fontWeight="600">{item.name}</Text>
                           <Text fontSize="$2" color={Colors.textSecondary}>{item.category}</Text>
                        </YStack>
                      </XStack>
                      {selectedIngredients.includes(item.name) && <Check size={20} color={Colors.primary} />}
                    </XStack>
                  </TouchableOpacity>
                ))}
              </YStack>
            </ScrollView>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </SafeAreaView>
  );
}