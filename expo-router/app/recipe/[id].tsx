
import React, { useEffect, useState } from 'react';
import { ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack, XStack, Text, Image, Button, Spinner, Separator } from 'tamagui';
import { ArrowLeft, Clock, Users, PlayCircle, ExternalLink, Check } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { getRecipeById, AppRecipe } from '../../utils/mealdb';
import { useProducts } from '../../store/products';

export default function RecipeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const products = useProducts();
  const [recipe, setRecipe] = useState<AppRecipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipe();
  }, [id]);

  const loadRecipe = async () => {
    if (!id) return;
    try {
      const data = await getRecipeById(id);
      setRecipe(data);
    } catch (error) {
      console.error('Failed to load recipe', error);
    } finally {
      setLoading(false);
    }
  };

  const isIngredientInPantry = (ingredient: string) => {
    // Simple check: does any pantry item name include the ingredient name (or vice versa)
    // partial matching
    const search = ingredient.toLowerCase();
    return products.some(p => 
      p.name.toLowerCase().includes(search) || search.includes(p.name.toLowerCase())
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Spinner size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text color={Colors.text}>Recipe not found.</Text>
        <Button onPress={() => router.back()} marginTop="$4">Go Back</Button>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          
          {/* Header Image */}
          <YStack position="relative">
            <Image 
              source={{ uri: recipe.image, width: '100%', height: 300 }} 
            />
            <Button 
              position="absolute" 
              top={10} 
              left={10} 
              circular 
              size="$3" 
              icon={<ArrowLeft size={20} color={Colors.text} />} 
              backgroundColor="rgba(255,255,255,0.8)"
              onPress={() => router.back()}
            />
          </YStack>

          <YStack padding="$4" gap="$5" marginTop={-20} backgroundColor={Colors.background} borderTopLeftRadius={25} borderTopRightRadius={25}>
            
            {/* Title & Stats */}
            <YStack gap="$2">
              <Text fontSize="$8" fontWeight="bold" color={Colors.text}>{recipe.title}</Text>
              <XStack gap="$4">
                <XStack alignItems="center" gap="$1">
                  <Clock size={16} color={Colors.textSecondary} />
                  <Text color={Colors.textSecondary}>~30 min</Text>
                </XStack>
                {/* Could add servings here if API provided it */}
              </XStack>
            </YStack>

            <Separator borderColor={Colors.border} />

            {/* Ingredients */}
            <YStack gap="$3">
              <Text fontSize="$6" fontWeight="bold" color={Colors.text}>Ingredients</Text>
              <YStack gap="$2">
                {recipe.ingredients.map((ing, i) => {
                  const hasItem = isIngredientInPantry(ing);
                  return (
                    <XStack key={i} justifyContent="space-between" alignItems="center" paddingVertical="$2" borderBottomWidth={1} borderBottomColor={Colors.border}>
                      <XStack alignItems="center" gap="$3" flex={1}>
                        <Text fontSize="$4" color={hasItem ? Colors.primary : Colors.text} fontWeight={hasItem ? "bold" : "normal"}>
                          • {ing}
                        </Text>
                        {hasItem && (
                          <XStack backgroundColor={Colors.greenLight} paddingHorizontal="$2" paddingVertical={2} borderRadius="$2">
                            <Text fontSize={10} color={Colors.green} fontWeight="bold">IN PANTRY</Text>
                          </XStack>
                        )}
                      </XStack>
                      <Text color={Colors.textSecondary}>{recipe.measures[i]}</Text>
                    </XStack>
                  );
                })}
              </YStack>
            </YStack>

            <Separator borderColor={Colors.border} />

            {/* Instructions */}
            <YStack gap="$3">
              <Text fontSize="$6" fontWeight="bold" color={Colors.text}>Instructions</Text>
              <Text color={Colors.text} lineHeight={24} fontSize="$4">
                {recipe.instructions}
              </Text>
            </YStack>

            {/* Actions */}
            <YStack gap="$3" marginTop="$4">
              {recipe.youtubeUrl && (
                <Button 
                  backgroundColor={Colors.red} 
                  icon={<PlayCircle size={20} color="white" />}
                  onPress={() => Linking.openURL(recipe.youtubeUrl!)}
                >
                  <Text color="white" fontWeight="bold">Watch on YouTube</Text>
                </Button>
              )}
              {recipe.sourceUrl && (
                <Button 
                  backgroundColor={Colors.surface} 
                  borderWidth={1}
                  borderColor={Colors.border}
                  icon={<ExternalLink size={20} color={Colors.text} />}
                  onPress={() => Linking.openURL(recipe.sourceUrl!)}
                >
                  <Text color={Colors.text} fontWeight="bold">View Original Source</Text>
                </Button>
              )}
            </YStack>

          </YStack>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
