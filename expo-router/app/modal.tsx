import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { YStack, XStack, Text, Button, Card, Circle } from 'tamagui';
import { Colors } from '../constants/Colors';
import { useRouter } from 'expo-router';
import { useStats, useProducts, useProductsStore } from '../store/products';
import { TrendingUp, Leaf, AlertTriangle, CheckCircle, XCircle } from '@tamagui/lucide-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { useEffect } from 'react';
import Svg, { Circle as SvgCircle, G } from 'react-native-svg';

export default function StatsScreen() {
  const router = useRouter();
  const stats = useStats();
  const products = useProducts();
  const refreshStats = useProductsStore(state => state.refreshStats);

  useEffect(() => {
    refreshStats();
  }, []);

  // Calculate metrics
  const totalProcessed = stats.consumed + stats.expired;
  const saveRate = totalProcessed > 0 ? Math.round((stats.consumed / totalProcessed) * 100) : 100;
  
  // Estimate money saved (assume average item value of $5)
  const estimatedSavings = stats.consumed * 5;
  
  // Estimate weight saved (assume average item weight of 0.3kg)
  const weightSaved = (stats.consumed * 0.3).toFixed(1);

  // Chart config
  const size = 140;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (saveRate / 100) * circumference;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']}>
      <StatusBar style={'dark'} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack padding="$4" gap="$5">

          <Card
            backgroundColor={Colors.primary}
            borderRadius="$6"
            padding="$5"
            elevation={10}
            shadowColor={Colors.primary}
            shadowOpacity={0.4}
            shadowRadius={10}
          >
            <YStack alignItems="center" gap="$4">
              <Text color="white" fontSize="$4" opacity={0.9}>Food Saved Rate</Text>
              
              {/* SVG Circular Progress */}
              <YStack alignItems="center" justifyContent="center" width={size} height={size}>
                <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
                  {/* Background Circle */}
                  <SvgCircle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  {/* Progress Circle Exception: only show if rate > 0 */}
                  {saveRate > 0 && (
                    <SvgCircle
                      cx={center}
                      cy={center}
                      r={radius}
                      stroke="white"
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={progressOffset}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  )}
                </Svg>
                
                {/* Text Overlay */}
                <YStack position="absolute" alignItems="center" justifyContent="center">
                  <Text color="white" fontSize="$9" fontWeight="800">{saveRate}%</Text>
                  <Text color="white" fontSize="$3" opacity={0.8}>saved</Text>
                </YStack>
              </YStack>

              <XStack gap="$6" marginTop="$2">
                <YStack alignItems="center">
                  <Text color="white" fontSize="$7" fontWeight="bold">{weightSaved}</Text>
                  <Text color="white" opacity={0.8} fontSize="$3">kg saved</Text>
                </YStack>
                <YStack alignItems="center">
                  <Text color="white" fontSize="$7" fontWeight="bold">${estimatedSavings}</Text>
                  <Text color="white" opacity={0.8} fontSize="$3">estimated</Text>
                </YStack>
              </XStack>
            </YStack>
          </Card>

          {/* Quick Stats Grid */}
          <XStack gap="$3" flexWrap="wrap">
            <Card flex={1} minWidth="45%" backgroundColor={Colors.surface} borderRadius="$4" padding="$4" elevation={2}>
              <XStack alignItems="center" gap="$3">
                <Circle size={44} backgroundColor={Colors.greenLight}>
                  <CheckCircle size={22} color={Colors.green} />
                </Circle>
                <YStack>
                  <Text fontSize="$7" fontWeight="bold" color={Colors.text}>{stats.consumed}</Text>
                  <Text fontSize="$2" color={Colors.textSecondary}>Consumed</Text>
                </YStack>
              </XStack>
            </Card>

            <Card flex={1} minWidth="45%" backgroundColor={Colors.surface} borderRadius="$4" padding="$4" elevation={2}>
              <XStack alignItems="center" gap="$3">
                <Circle size={44} backgroundColor={Colors.redLight}>
                  <XCircle size={22} color={Colors.red} />
                </Circle>
                <YStack>
                  <Text fontSize="$7" fontWeight="bold" color={Colors.text}>{stats.expired}</Text>
                  <Text fontSize="$2" color={Colors.textSecondary}>Expired</Text>
                </YStack>
              </XStack>
            </Card>

            <Card flex={1} minWidth="45%" backgroundColor={Colors.surface} borderRadius="$4" padding="$4" elevation={2}>
              <XStack alignItems="center" gap="$3">
                <Circle size={44} backgroundColor={Colors.primaryLight}>
                  <Leaf size={22} color={Colors.primary} />
                </Circle>
                <YStack>
                  <Text fontSize="$7" fontWeight="bold" color={Colors.text}>{stats.totalActive}</Text>
                  <Text fontSize="$2" color={Colors.textSecondary}>In Kitchen</Text>
                </YStack>
              </XStack>
            </Card>

            <Card flex={1} minWidth="45%" backgroundColor={Colors.surface} borderRadius="$4" padding="$4" elevation={2}>
              <XStack alignItems="center" gap="$3">
                <Circle size={44} backgroundColor={Colors.yellowLight}>
                  <AlertTriangle size={22} color={Colors.yellow} />
                </Circle>
                <YStack>
                  <Text fontSize="$7" fontWeight="bold" color={Colors.text}>{stats.expiringSoon}</Text>
                  <Text fontSize="$2" color={Colors.textSecondary}>Expiring Soon</Text>
                </YStack>
              </XStack>
            </Card>
          </XStack>

          {/* Tips Card */}
          <Card backgroundColor={Colors.surface} borderRadius="$5" padding="$4" elevation={2}>
            <YStack gap="$3">
              <XStack alignItems="center" gap="$2">
                <TrendingUp size={20} color={Colors.green} />
                <Text fontSize="$4" fontWeight="bold" color={Colors.text}>Tips to Reduce Waste</Text>
              </XStack>
              <YStack gap="$2">
                <Text fontSize="$3" color={Colors.textSecondary}>• Check "Eat Me First" section daily</Text>
                <Text fontSize="$3" color={Colors.textSecondary}>• Plan meals around expiring items</Text>
                <Text fontSize="$3" color={Colors.textSecondary}>• Freeze items before they expire</Text>
                <Text fontSize="$3" color={Colors.textSecondary}>• Buy smaller quantities more often</Text>
              </YStack>
            </YStack>
          </Card>

          {/* Back Button */}
          <Button 
            backgroundColor={Colors.primary} 
            size="$5" 
            borderRadius="$6"
            onPress={() => router.back()}
          >
            <Text color="white" fontWeight="bold" fontSize="$4">Back to Home</Text>
          </Button>

        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}