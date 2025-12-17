import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack, XStack, Text, Image, Card, Input, Circle, Spinner } from 'tamagui';
import { Search, Filter, Clock, Trash2, Check } from '@tamagui/lucide-icons';
import { Colors } from '../../constants/Colors';
import { useProducts, useProductsStore, useIsLoading } from '../../store/products';
import { Product } from '../../utils/database';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

const FILTERS = ['All', 'Fridge', 'Pantry', 'Freezer'] as const;

const getTrafficLightColor = (daysRemaining: number) => {
  if (daysRemaining <= 3) return Colors.red;
  if (daysRemaining <= 7) return Colors.yellow;
  return Colors.green;
};

const getDaysRemaining = (expiryDate: string) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function InventoryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<typeof FILTERS[number]>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const products = useProducts();
  const isLoading = useIsLoading();
  const wasteProduct = useProductsStore((state) => state.wasteProduct);
  const consumeProduct = useProductsStore((state) => state.consumeProduct);

  const filteredProducts = products.filter(p => {
    const matchesTab = activeTab === 'All' || p.category === activeTab;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleDelete = (id: number, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Mark as Wasted',
      `Move "${name}" to expired items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Wasted', 
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            wasteProduct(id);
          }
        },
      ]
    );
  };

  const handleConsume = (id: number, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Mark as Consumed',
      `Mark "${name}" as consumed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Consumed', 
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            consumeProduct(id);
          }
        },
      ]
    );
  };

  const renderRightActions = (item: Product) => (
    <XStack>
      <TouchableOpacity 
        onPress={() => handleConsume(item.id, item.name)}
        style={{ 
          backgroundColor: Colors.green, 
          justifyContent: 'center', 
          alignItems: 'center',
          width: 70,
        }}
      >
        <Check size={24} color="white" />
        <Text color="white" fontSize="$2" marginTop="$1">Used</Text>
      </TouchableOpacity>
      <TouchableOpacity 
          onPress={() => handleDelete(item.id, item.name)}
        style={{ 
          backgroundColor: Colors.red, 
          justifyContent: 'center', 
          alignItems: 'center',
          width: 70,
          borderTopRightRadius: 10,
          borderBottomRightRadius: 10,
        }}
      >
        <Trash2 size={24} color="white" />
        <Text color="white" fontSize="$2" marginTop="$1">Wasted</Text>
      </TouchableOpacity>
    </XStack>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <YStack padding="$4" gap="$4">
        
          {/* Header */}
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$8" fontWeight="bold" color={Colors.text}>My Kitchen</Text>
          </XStack>

          {/* Search */}
          <XStack backgroundColor={Colors.surface} padding="$1" borderRadius="$4" alignItems="center" borderWidth={1} borderColor={Colors.border}>
            <Search size={20} color={Colors.textSecondary} />
            <Input 
              flex={1} 
              placeholder="Search items..." 
              backgroundColor="transparent" 
              borderWidth={0} 
              color={Colors.text}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </XStack>

          {/* Filter Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {FILTERS.map((tab) => (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
                <XStack 
                  backgroundColor={activeTab === tab ? Colors.primary : Colors.surface} 
                  paddingHorizontal="$4" 
                  paddingVertical="$2.5" 
                  borderRadius="$4"
                  borderWidth={1}
                  borderColor={activeTab === tab ? Colors.primary : Colors.border}
                >
                  <Text 
                    color={activeTab === tab ? 'white' : Colors.textSecondary} 
                    fontWeight="600"
                  >
                    {tab}
                  </Text>
                </XStack>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Loading State */}
          {isLoading && (
            <YStack alignItems="center" padding="$5">
              <Spinner size="large" color={Colors.primary} />
            </YStack>
          )}

          {/* Product List */}
          <YStack gap="$3">
            {filteredProducts.map((item) => {
              const days = getDaysRemaining(item.expiryDate);
              const color = getTrafficLightColor(days);
              const bgLight = color === Colors.red ? Colors.redLight : (color === Colors.yellow ? Colors.yellowLight : Colors.greenLight);

              return (
                <Swipeable
                  key={item.id}
                  renderRightActions={() => renderRightActions(item)}
                  overshootRight={false}
                  onSwipeableWillOpen={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push(`/product/${item.id}`);
                    }}
                  >
                    <Card backgroundColor={Colors.surface} borderRadius="$4" padding="$0" overflow="hidden" elevation={1}>
                      <XStack alignItems="center">
                        {item.image ? (
                          <Image 
                            source={{ uri: item.image, width: 90, height: 90 }} 
                          />
                        ) : (
                          <YStack 
                            width={90} 
                            height={90} 
                            backgroundColor={Colors.border} 
                            alignItems="center" 
                            justifyContent="center"
                          >
                            <Text fontSize="$6">🥫</Text>
                          </YStack>
                        )}
                        <YStack padding="$3" flex={1} gap="$1">
                          <XStack justifyContent="space-between" alignItems="center">
                            <Text fontSize="$4" fontWeight="bold" color={Colors.text}>{item.name}</Text>
                            <Circle size={12} backgroundColor={color} />
                          </XStack>
                          <Text color={Colors.textSecondary} fontSize="$3">{item.quantity}</Text>
                          
                          <XStack justifyContent="space-between" alignItems="center" marginTop="$1">
                             <XStack gap="$1" alignItems="center" backgroundColor={bgLight} paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2">
                                <Clock size={12} color={color} />
                                <Text color={color} fontSize="$2" fontWeight="700">
                                  {days <= 0 ? 'Expired!' : `${days} days left`}
                                </Text>
                             </XStack>
                             <Text color={Colors.textSecondary} fontSize="$2" textTransform="uppercase" letterSpacing={1}>{item.category}</Text>
                          </XStack>
                        </YStack>
                      </XStack>
                    </Card>
                  </TouchableOpacity>
                </Swipeable>
              );
            })}
            
            {!isLoading && filteredProducts.length === 0 && (
              <YStack alignItems="center" padding="$5" gap="$2">
                <Text fontSize="$6">🍽️</Text>
                <Text color={Colors.textSecondary} fontSize="$4">No items in your kitchen</Text>
                <Text color={Colors.textSecondary} fontSize="$3">Tap the + button to add items</Text>
              </YStack>
            )}
          </YStack>

        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}