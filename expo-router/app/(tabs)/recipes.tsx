import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack, XStack, Text, Image, Card, Button } from 'tamagui';
import { ChefHat, Flame, Clock, ArrowRight } from '@tamagui/lucide-icons';
import { Colors } from '../../constants/Colors';
import { RECIPES } from '../../constants/data';

export default function RecipesScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <YStack padding="$4" gap="$5">
          
          <YStack>
            <Text fontSize="$8" fontWeight="bold" color={Colors.text}>Inspiration</Text>
            <Text fontSize="$4" color={Colors.textSecondary}>Meals based on your kitchen</Text>
          </YStack>

          <XStack backgroundColor={Colors.yellowLight} padding="$3" borderRadius="$4" alignItems="center" gap="$3">
            <Flame size={24} color={Colors.yellow} />
            <Text color={Colors.text} flex={1} fontSize="$3">
              You have <Text fontWeight="bold" color={Colors.red}>3 items</Text> expiring soon. Here are some ideas to use them up!
            </Text>
          </XStack>

          <YStack gap="$4">
            {RECIPES.map((recipe) => (
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
                  source={{ uri: recipe.image, width: '100%', height: 200 }} 
                />
                
                {/* Overlay Gradient/Badge could go here */}
                
                <YStack padding="$4" gap="$2">
                  <XStack justifyContent="space-between" alignItems="flex-start">
                    <Text fontSize="$6" fontWeight="bold" color={Colors.text} flex={1}>{recipe.title}</Text>
                    <XStack backgroundColor={Colors.background} paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2" alignItems="center" gap="$1">
                      <Clock size={12} color={Colors.textSecondary} />
                      <Text fontSize="$2" color={Colors.textSecondary}>30m</Text>
                    </XStack>
                  </XStack>

                  <XStack flexWrap="wrap" gap="$2" marginTop="$2">
                    {recipe.usedIngredients.map((ing, i) => (
                      <XStack key={i} backgroundColor={Colors.greenLight} paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2" alignItems="center">
                        <Text fontSize="$2" color={Colors.green} fontWeight="600">✓ Uses {ing}</Text>
                      </XStack>
                    ))}
                    {recipe.missingIngredients > 0 && (
                      <XStack backgroundColor={Colors.background} paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2" alignItems="center">
                        <Text fontSize="$2" color={Colors.textSecondary}>+ {recipe.missingIngredients} more</Text>
                      </XStack>
                    )}
                  </XStack>
                  
                  <Button 
                    backgroundColor="transparent" 
                    padding="0" 
                    marginTop="$2" 
                    alignSelf="flex-end"
                    iconAfter={<ArrowRight size={16} color={Colors.primary} />}
                  >
                    <Text color={Colors.primary} fontWeight="bold">View Recipe</Text>
                  </Button>
                </YStack>
              </Card>
            ))}
          </YStack>

        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}