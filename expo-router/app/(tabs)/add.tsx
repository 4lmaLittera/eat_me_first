import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack, XStack, Text, Button, Input, Label, TextArea } from 'tamagui';
import { Scan, Camera, Calendar, ChevronDown } from '@tamagui/lucide-icons';
import { Colors } from '../../constants/Colors';

export default function AddProductScreen() {
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <YStack padding="$4" gap="$5">
          
          <Text fontSize="$8" fontWeight="bold" color={Colors.text}>Add Item</Text>

          {/* Quick Input Methods */}
          <XStack gap="$3">
            <Button 
              flex={1} 
              height={120} 
              backgroundColor={Colors.primaryLight} 
              borderRadius="$4" 
              flexDirection="column"
              gap="$2"
              chromeless
              borderWidth={2}
              borderColor={Colors.primary}
              borderStyle="dashed"
            >
              <Scan size={32} color={Colors.primary} />
              <Text color={Colors.primary} fontWeight="bold" fontSize="$4">Scan Barcode</Text>
            </Button>
            
            <Button 
              flex={1} 
              height={120} 
              backgroundColor={Colors.surface} 
              borderRadius="$4" 
              flexDirection="column"
              gap="$2"
              elevation={2}
            >
              <Camera size={32} color={Colors.text} />
              <Text color={Colors.text} fontWeight="bold" fontSize="$4">Take Photo</Text>
            </Button>
          </XStack>

          <Text textAlign="center" color={Colors.textSecondary} fontWeight="600">- OR ENTER MANUALLY -</Text>

          {/* Form */}
          <YStack gap="$4">
            
            <YStack gap="$2">
              <Label color={Colors.textSecondary} fontSize="$3" fontWeight="600">PRODUCT NAME</Label>
              <Input 
                placeholder="e.g., Cheddar Cheese" 
                backgroundColor={Colors.surface} 
                borderWidth={1} 
                borderColor={Colors.border}
                padding="$3"
                borderRadius="$4"
                fontSize="$4"
                value={name}
                onChangeText={setName}
              />
            </YStack>

            <YStack gap="$2">
               <Label color={Colors.textSecondary} fontSize="$3" fontWeight="600">CATEGORY</Label>
               <XStack backgroundColor={Colors.surface} borderRadius="$4" borderWidth={1} borderColor={Colors.border} padding="$3" justifyContent="space-between" alignItems="center">
                 <Text fontSize="$4" color={Colors.text}>Fridge</Text>
                 <ChevronDown size={20} color={Colors.textSecondary} />
               </XStack>
            </YStack>

            <YStack gap="$2">
               <Label color={Colors.textSecondary} fontSize="$3" fontWeight="600">EXPIRY DATE</Label>
               <XStack backgroundColor={Colors.surface} borderRadius="$4" borderWidth={1} borderColor={Colors.border} padding="$3" justifyContent="space-between" alignItems="center">
                 <Text fontSize="$4" color={Colors.text}>{date}</Text>
                 <Calendar size={20} color={Colors.primary} />
               </XStack>
            </YStack>
            
            <YStack gap="$2">
              <Label color={Colors.textSecondary} fontSize="$3" fontWeight="600">NOTES (OPTIONAL)</Label>
              <TextArea 
                placeholder="Opened on..." 
                backgroundColor={Colors.surface} 
                borderWidth={1} 
                borderColor={Colors.border}
                padding="$3"
                borderRadius="$4"
                fontSize="$4"
              />
            </YStack>

          </YStack>

          <Button 
            backgroundColor={Colors.primary} 
            size="$5" 
            borderRadius="$6" 
            marginTop="$2"
            pressStyle={{ opacity: 0.9 }}
            elevation={5}
            shadowColor={Colors.primary}
            shadowOpacity={0.4}
            shadowRadius={10}
            shadowOffset={{ width: 0, height: 4 }}
          >
            <Text color="white" fontWeight="bold" fontSize="$5">Save Item</Text>
          </Button>

        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}