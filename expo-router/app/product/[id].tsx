import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack, XStack, Text, Button, Input, Label, TextArea, Sheet, Image, Spinner } from 'tamagui';
import { Camera, Calendar, ChevronDown, Check, X, Trash2, ArrowLeft, Activity } from '@tamagui/lucide-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useProductsStore } from '../../store/products';
import { getProductById, NewProduct } from '../../utils/database';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

const CATEGORIES = ['Fridge', 'Pantry', 'Freezer'] as const;

export default function EditProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const editProduct = useProductsStore((state) => state.editProduct);
  const removeProduct = useProductsStore((state) => state.removeProduct);
  const isLoading = useProductsStore((state) => state.isLoading);
  const isInitialized = useProductsStore((state) => state.isInitialized);
  
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('Fridge');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  useEffect(() => {
    if (isInitialized) {
      loadProduct();
    }
  }, [id, isInitialized]);

  const loadProduct = async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      const product = await getProductById(Number(id));
      if (product) {
        setName(product.name);
        setCategory(product.category);
        setQuantity(product.quantity);
        if (product.notes) {
          // Parse nutrition info from notes
          const nutritionRegex = /Values: ([\d?]+) kcal \| P: (\d+)g \| C: (\d+)g \| F: (\d+)g/;
          const match = product.notes.match(nutritionRegex);
          if (match) {
            setCalories(match[1] === '?' ? '' : match[1]);
            setProtein(match[2]);
            setCarbs(match[3]);
            setFat(match[4]);
            // Remove nutrition info from displayed notes to avoid duplication
            setNotes(product.notes.replace(nutritionRegex, '').replace(/\n\n$/, '').trim());
          } else {
            setNotes(product.notes);
          }
        } else {
          setNotes('');
        }
        setExpiryDate(new Date(product.expiryDate));
        setImage(product.image);
      } else {
        Alert.alert('Not Found', 'Product not found', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load product. Please try again.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setExpiryDate(selectedDate);
      Haptics.selectionAsync();
    }
  };

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to add photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const takePhoto = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const removeImage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setImage(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Missing Name', 'Please enter a product name.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const updates: Partial<NewProduct> = {
      name: name.trim(),
      image: image,
      expiryDate: expiryDate.toISOString().split('T')[0],
      category,
      quantity: quantity.trim() || '1',
      notes: notes.trim() || null,
    };

    // Re-append nutrition info
    if (calories || protein || carbs || fat) {
      const nutritionNote = `Values: ${calories || '?'} kcal | P: ${protein || 0}g | C: ${carbs || 0}g | F: ${fat || 0}g`;
      if (updates.notes) {
        updates.notes += `\n\n${nutritionNote}`;
      } else {
        updates.notes = nutritionNote;
      }
    }

    try {
      await editProduct(Number(id), updates);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Updated!',
        `${name} has been updated.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to update product. Please try again.');
    }
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeProduct(Number(id));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          }
        },
      ]
    );
  };

  const handleCategorySelect = (cat: typeof CATEGORIES[number]) => {
    Haptics.selectionAsync();
    setCategory(cat);
    setShowCategorySheet(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Spinner size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['left', 'right']}>
        <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <YStack padding="$4" gap="$3">

          {/* Image Preview or Capture Options */}
          {image ? (
            <YStack alignItems="center" gap="$3">
              <YStack position="relative">
                <Image
                  source={{ uri: image, width: 200, height: 200 }}
                  borderRadius={20}
                />
                <TouchableOpacity
                  onPress={removeImage}
                  style={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    backgroundColor: Colors.red,
                    borderRadius: 15,
                    width: 30,
                    height: 30,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={18} color="white" />
                </TouchableOpacity>
              </YStack>
              <XStack gap="$3">
                <Button
                  size="$3"
                  backgroundColor={Colors.surface}
                  onPress={takePhoto}
                  icon={<Camera size={18} color={Colors.text} />}
                >
                  <Text color={Colors.text}>Retake</Text>
                </Button>
                <Button
                  size="$3"
                  backgroundColor={Colors.surface}
                  onPress={pickImage}
                >
                  <Text color={Colors.text}>Choose Another</Text>
                </Button>
              </XStack>
            </YStack>
          ) : (
            <XStack gap="$3" justifyContent="center">
              <Button 
                height={100} 
                width={150}
                backgroundColor={Colors.surface} 
                borderRadius="$4" 
                flexDirection="column"
                gap="$2"
                elevation={2}
                onPress={takePhoto}
              >
                <Camera size={32} color={Colors.text} />
                <Text color={Colors.text} fontWeight="bold" fontSize="$3">Add Photo</Text>
              </Button>
            </XStack>
          )}

          {/* Form */}
          <YStack gap="$3">
            
            {/* Product Name */}
            <YStack gap="$1.5">
              <Label color={Colors.textSecondary} fontSize="$3" fontWeight="600">PRODUCT NAME *</Label>
              <Input 
                placeholder="e.g., Cheddar Cheese" 
                placeholderTextColor={Colors.textSecondary}
                backgroundColor={Colors.surface} 
                borderWidth={1} 
                borderColor={Colors.border}
                padding="$3"
                borderRadius="$4"
                fontSize="$4"
                value={name}
                color={Colors.text}
                onChangeText={setName}
              />
            </YStack>

            {/* Quantity */}
            <YStack gap="$1.5">
              <Label color={Colors.textSecondary} fontSize="$3" fontWeight="600">QUANTITY</Label>
              <Input 
                placeholder="e.g., 500g, 2 packs, 1L" 
                placeholderTextColor={Colors.textSecondary}
                backgroundColor={Colors.surface} 
                borderWidth={1} 
                borderColor={Colors.border}
                padding="$3"
                borderRadius="$4"
                fontSize="$4"
                value={quantity}
                color={Colors.text}
                onChangeText={setQuantity}
              />
            </YStack>

            {/* Category */}
            <YStack gap="$1.5">
               <Label color={Colors.textSecondary} fontSize="$3" fontWeight="600">CATEGORY</Label>
               <TouchableOpacity onPress={() => {
                 Haptics.selectionAsync();
                 setShowCategorySheet(true);
               }}>
                 <XStack 
                   backgroundColor={Colors.surface} 
                   borderRadius="$4" 
                   borderWidth={1} 
                   borderColor={Colors.border} 
                   padding="$3" 
                   justifyContent="space-between" 
                   alignItems="center"
                 >
                   <Text fontSize="$4" color={Colors.text}>{category}</Text>
                   <ChevronDown size={20} color={Colors.textSecondary} />
                 </XStack>
               </TouchableOpacity>
            </YStack>

            {/* Expiry Date */}
            <YStack gap="$1.5">
               <Label color={Colors.textSecondary} fontSize="$3" fontWeight="600">EXPIRY DATE</Label>
               <TouchableOpacity onPress={() => {
                 Haptics.selectionAsync();
                 setShowDatePicker(true);
               }}>
                 <XStack 
                   backgroundColor={Colors.surface} 
                   borderRadius="$4" 
                   borderWidth={1} 
                   borderColor={Colors.border} 
                   padding="$3" 
                   justifyContent="space-between" 
                   alignItems="center"
                 >
                   <Text fontSize="$4" color={Colors.text}>{formatDate(expiryDate)}</Text>
                   <Calendar size={20} color={Colors.primary} />
                 </XStack>
               </TouchableOpacity>
            </YStack>
            
            {/* Notes */}
            <YStack gap="$1.5">
              <Label color={Colors.textSecondary} fontSize="$3" fontWeight="600">NOTES (OPTIONAL)</Label>
              <TextArea 
                placeholder="Opened on..." 
                placeholderTextColor={Colors.textSecondary}
                backgroundColor={Colors.surface} 
                borderWidth={1} 
                borderColor={Colors.border}
                padding="$3"
                borderRadius="$4"
                fontSize="$4"
                value={notes}
                onChangeText={setNotes}
              />
            </YStack>

            {/* Nutrition Info Inputs */}
            <YStack gap="$1.5">
              <Label color={Colors.textSecondary} fontSize="$3" fontWeight="600">NUTRITION (OPTIONAL)</Label>
              <YStack 
                backgroundColor={Colors.surface} 
                borderRadius="$4" 
                borderWidth={1} 
                borderColor={Colors.border} 
                padding="$3"
                gap="$2"
              >
                <XStack alignItems="center" gap="$2" marginBottom="$1">
                  <Activity size={16} color={Colors.primary} />
                  <Text color={Colors.text} fontWeight="600">Nutrition Facts</Text>
                </XStack>
                <XStack gap="$3">
                  <YStack flex={1} gap="$1">
                    <Label fontSize="$2" color={Colors.textSecondary}>Calories</Label>
                    <Input 
                      placeholder="kcal" 
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="numeric"
                      backgroundColor="transparent"
                      borderWidth={1}
                      borderColor={Colors.border}
                      borderRadius="$3"
                      padding="$2"
                      fontSize="$3"
                      value={calories}
                      onChangeText={setCalories}
                      color={Colors.text}
                    />
                  </YStack>
                  <YStack flex={1} gap="$1">
                    <Label fontSize="$2" color={Colors.textSecondary}>Protein (g)</Label>
                    <Input 
                      placeholder="g" 
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="numeric"
                      backgroundColor="transparent"
                      borderWidth={1}
                      borderColor={Colors.border}
                      borderRadius="$3"
                      padding="$2"
                      fontSize="$3"
                      value={protein}
                      onChangeText={setProtein}
                      color={Colors.text}
                    />
                  </YStack>
                  <YStack flex={1} gap="$1">
                    <Label fontSize="$2" color={Colors.textSecondary}>Carbs (g)</Label>
                    <Input 
                      placeholder="g" 
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="numeric"
                      backgroundColor="transparent"
                      borderWidth={1}
                      borderColor={Colors.border}
                      borderRadius="$3"
                      padding="$2"
                      fontSize="$3"
                      value={carbs}
                      onChangeText={setCarbs}
                      color={Colors.text}
                    />
                  </YStack>
                  <YStack flex={1} gap="$1">
                    <Label fontSize="$2" color={Colors.textSecondary}>Fat (g)</Label>
                    <Input 
                      placeholder="g" 
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="numeric"
                      backgroundColor="transparent"
                      borderWidth={1}
                      borderColor={Colors.border}
                      borderRadius="$3"
                      padding="$2"
                      fontSize="$3"
                      value={fat}
                      onChangeText={setFat}
                      color={Colors.text}
                    />
                  </YStack>
                </XStack>
              </YStack>
            </YStack>

          </YStack>

          {/* Action Buttons */}
          <YStack gap="$2">
            <Button 
              backgroundColor={Colors.primary} 
              size="$5" 
              borderRadius="$6"
              pressStyle={{ opacity: 0.9 }}
              elevation={5}
              shadowColor={Colors.primary}
              shadowOpacity={0.4}
              shadowRadius={10}
              shadowOffset={{ width: 0, height: 4 }}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text color="white" fontWeight="bold" fontSize="$5">
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Text>
            </Button>

            <Button 
              backgroundColor={Colors.redLight} 
              size="$4" 
              borderRadius="$4"
              onPress={handleDelete}
              icon={<Trash2 size={20} color={Colors.red} />}
            >
              <Text color={Colors.red} fontWeight="600">Delete Item</Text>
            </Button>
          </YStack>

        </YStack>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <Sheet
            modal
            open={showDatePicker}
            onOpenChange={setShowDatePicker}
            snapPoints={[40]}
            dismissOnSnapToBottom
          >
            <Sheet.Frame padding="$4" backgroundColor={Colors.surface}>
              <Sheet.Handle />
              <YStack gap="$4" marginTop="$4">
                <Text fontSize="$5" fontWeight="bold" color={Colors.text}>Select Expiry Date</Text>
                <DateTimePicker
                  value={expiryDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                />
                <Button 
                  backgroundColor={Colors.primary} 
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text color="white" fontWeight="bold">Done</Text>
                </Button>
              </YStack>
            </Sheet.Frame>
          </Sheet>
        ) : (
          <DateTimePicker
            value={expiryDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )
      )}

      {/* Category Sheet */}
      <Sheet
        modal
        open={showCategorySheet}
        onOpenChange={setShowCategorySheet}
        snapPoints={[35]}
        dismissOnSnapToBottom
      >
        <Sheet.Frame padding="$4" backgroundColor={Colors.surface}>
          <Sheet.Handle />
          <YStack gap="$3" marginTop="$4">
            <Text fontSize="$5" fontWeight="bold" color={Colors.text}>Select Category</Text>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity 
                key={cat} 
                onPress={() => handleCategorySelect(cat)}
              >
                <XStack 
                  padding="$3" 
                  backgroundColor={category === cat ? Colors.primaryLight : Colors.background}
                  borderRadius="$3"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text 
                    fontSize="$4" 
                    color={category === cat ? Colors.primary : Colors.text}
                    fontWeight={category === cat ? 'bold' : 'normal'}
                  >
                    {cat}
                  </Text>
                  {category === cat && <Check size={20} color={Colors.primary} />}
                </XStack>
              </TouchableOpacity>
            ))}
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </SafeAreaView>
  );
}
