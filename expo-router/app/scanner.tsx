import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack, XStack, Text, Button, Spinner } from 'tamagui';
import { X, Flashlight, RefreshCw } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import * as Haptics from 'expo-haptics';

interface OpenFoodFactsProduct {
  product_name?: string;
  image_url?: string;
  brands?: string;
  quantity?: string;
  categories?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    'energy-kcal_serving'?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
  };
}

export default function ScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [torch, setTorch] = useState(false);
  const [productData, setProductData] = useState<OpenFoodFactsProduct | null>(null);

  const handleBarcodeScanned = async ({ data, type }: BarcodeScanningResult) => {
    if (scanned || loading) return;
    
    setScanned(true);
    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      // Fetch product data from Open Food Facts API
      const response = await fetch(`https://lt.openfoodfacts.org/api/v0/product/${data}.json`);
      const json = await response.json();

      if (json.status === 1 && json.product) {
        const product = json.product as OpenFoodFactsProduct;
        setProductData(product);
        
        // Extract nutrition info
        const nutrition = {
          calories: product.nutriments?.['energy-kcal_100g'] || product.nutriments?.['energy-kcal_serving'],
          protein: product.nutriments?.proteins_100g,
          carbs: product.nutriments?.carbohydrates_100g,
          fat: product.nutriments?.fat_100g,
        };

        // Navigate to add screen with pre-filled data
        router.replace({
          pathname: '/(tabs)/add',
          params: {
            prefillName: product.product_name || '',
            prefillImage: product.image_url || '',
            prefillQuantity: product.quantity || '',
            prefillCategory: 'Fridge',
            prefillNutrition: JSON.stringify(nutrition),
            fromScanner: 'true',
          },
        });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          'Product Not Found',
          `Barcode: ${data}\n\nThis product is not in our database. Would you like to add it manually?`,
          [
            { text: 'Cancel', onPress: () => setScanned(false) },
            { 
              text: 'Add Manually', 
              onPress: () => router.replace('/(tabs)/add')
            },
          ]
        );
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to look up product. Please try again or add manually.');
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleTorch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTorch(!torch);
  };

  const resetScanner = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setScanned(false);
    setProductData(null);
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <Spinner size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$5" gap="$4">
          <Text fontSize="$6" fontWeight="bold" color={Colors.text} textAlign="center">
            Camera Permission Required
          </Text>
          <Text fontSize="$4" color={Colors.textSecondary} textAlign="center">
            We need camera access to scan barcodes on your food products.
          </Text>
          <Button
            backgroundColor={Colors.primary}
            size="$5"
            borderRadius="$4"
            onPress={requestPermission}
          >
            <Text color="white" fontWeight="bold">Grant Permission</Text>
          </Button>
          <Button
            backgroundColor={Colors.surface}
            size="$4"
            borderRadius="$4"
            onPress={() => router.back()}
          >
            <Text color={Colors.text}>Go Back</Text>
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <YStack flex={1} backgroundColor="black">
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Overlay */}
      <YStack flex={1} justifyContent="space-between">
        {/* Top Bar */}
        <SafeAreaView edges={['top']}>
          <XStack padding="$4" justifyContent="space-between" alignItems="center">
            <Button
              circular
              size="$4"
              backgroundColor="rgba(0,0,0,0.5)"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
            >
              <X size={24} color="white" />
            </Button>
            
            <Text color="white" fontSize="$5" fontWeight="bold">
              Scan Barcode
            </Text>
            
            <Button
              circular
              size="$4"
              backgroundColor={torch ? Colors.primary : "rgba(0,0,0,0.5)"}
              onPress={toggleTorch}
            >
              <Flashlight size={24} color="white" />
            </Button>
          </XStack>
        </SafeAreaView>

        {/* Scanning Frame */}
        <YStack alignItems="center" justifyContent="center" flex={1}>
          <YStack
            width={280}
            height={280}
            borderWidth={3}
            borderColor="white"
            borderRadius={20}
            opacity={0.8}
          />
          <Text color="white" fontSize="$3" marginTop="$4" opacity={0.8}>
            Position barcode within the frame
          </Text>
        </YStack>

        {/* Bottom Controls */}
        <SafeAreaView edges={['bottom']}>
          <YStack padding="$5" alignItems="center" gap="$3">
            {loading && (
              <XStack alignItems="center" gap="$2" backgroundColor="rgba(0,0,0,0.7)" padding="$3" borderRadius="$4">
                <Spinner size="small" color="white" />
                <Text color="white">Looking up product...</Text>
              </XStack>
            )}
            
            {scanned && !loading && (
              <Button
                backgroundColor={Colors.primary}
                size="$4"
                borderRadius="$4"
                onPress={resetScanner}
                icon={<RefreshCw size={20} color="white" />}
              >
                <Text color="white" fontWeight="bold">Scan Again</Text>
              </Button>
            )}

            <Button
              backgroundColor="rgba(255,255,255,0.2)"
              size="$4"
              borderRadius="$4"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.replace('/(tabs)/add');
              }}
            >
              <Text color="white">Enter Manually</Text>
            </Button>
          </YStack>
        </SafeAreaView>
      </YStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
