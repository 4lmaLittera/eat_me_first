import React, { useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack, XStack, Text, Image, Card, Input, Circle } from 'tamagui';
import { Search, Filter, Clock } from '@tamagui/lucide-icons';
import { Colors } from '../../constants/Colors';
import { PRODUCTS, Product } from '../../constants/data';

const FILTERS = ['All', 'Fridge', 'Pantry', 'Freezer'];

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
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesTab = activeTab === 'All' || p.category === activeTab;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <YStack padding="$4" gap="$4">
        
          {/* Header */}
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$8" fontWeight="bold" color={Colors.text}>My Kitchen</Text>
            <Circle size={40} backgroundColor={Colors.surface} elevation={2}>
               <Filter size={20} color={Colors.text} />
            </Circle>
          </XStack>

          {/* Search */}
          <XStack backgroundColor={Colors.surface} padding="$3" borderRadius="$4" alignItems="center" borderWidth={1} borderColor={Colors.border}>
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

          {/* Product List */}
          <YStack gap="$3">
            {filteredProducts.map((item) => {
              const days = getDaysRemaining(item.expiryDate);
              const color = getTrafficLightColor(days);
              const bgLight = color === Colors.red ? Colors.redLight : (color === Colors.yellow ? Colors.yellowLight : Colors.greenLight);

              return (
                <Card key={item.id} backgroundColor={Colors.surface} borderRadius="$4" padding="$0" overflow="hidden" elevation={1}>
                  <XStack alignItems="center">
                    <Image 
                      source={{ uri: item.image, width: 90, height: 90 }} 
                    />
                    <YStack padding="$3" flex={1} gap="$1">
                      <XStack justifyContent="space-between" alignItems="center">
                        <Text fontSize="$4" fontWeight="bold" color={Colors.text}>{item.name}</Text>
                        <Circle size={12} backgroundColor={color} />
                      </XStack>
                      <Text color={Colors.textSecondary} fontSize="$3">{item.quantity}</Text>
                      
                      <XStack justifyContent="space-between" alignItems="center" marginTop="$1">
                         <XStack gap="$1" alignItems="center" backgroundColor={bgLight} paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2">
                            <Clock size={12} color={color} />
                            <Text color={color} fontSize="$2" fontWeight="700">{days} days left</Text>
                         </XStack>
                         <Text color={Colors.textSecondary} fontSize="$2" textTransform="uppercase" letterSpacing={1}>{item.category}</Text>
                      </XStack>
                    </YStack>
                  </XStack>
                </Card>
              );
            })}
            
            {filteredProducts.length === 0 && (
              <YStack alignItems="center" padding="$5" gap="$2">
                <Text color={Colors.textSecondary}>No items found.</Text>
              </YStack>
            )}
          </YStack>

        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}