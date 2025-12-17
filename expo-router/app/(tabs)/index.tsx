import React from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack, XStack, Text, Card, Button, Image, Circle } from "tamagui";
import {
  Bell,
  Scan,
  Plus,
  ArrowRight,
  Clock,
  ChevronRight,
  BarChart3,
} from "@tamagui/lucide-icons";
import { Link, useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { useExpiringSoon, useStats } from "../../store/products";
import * as Haptics from "expo-haptics";

import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { useProductsStore } from '../../store/products';
import { useEffect } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const expiringSoon = useExpiringSoon();
  const stats = useStats();
  const refreshStats = useProductsStore(state => state.refreshStats);

  useEffect(() => {
    refreshStats();
  }, []);

  // Calculate saved percentage (consumed vs total)
  const totalItems = stats.consumed + stats.expired;
  const savedPercentage = totalItems > 0 
    ? Math.round((stats.consumed / totalItems) * 100) 
    : 100;

  // Chart Config
  const size = 80;
  const strokeWidth = 6;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (savedPercentage / 100) * circumference;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.background }}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <YStack padding="$4" gap="$5">
          {/* Summary Widget */}
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/modal");
            }}
          >
            <Card
              backgroundColor={Colors.primary}
              borderRadius="$6"
              padding="$4"
              elevation={10}
              shadowColor={Colors.primary}
              shadowOpacity={0.4}
              shadowRadius={10}
              shadowOffset={{ width: 0, height: 10 }}
            >
              <XStack justifyContent="space-between" alignItems="center">
                <YStack gap="$2">
                  <Text color="white" fontSize="$4" opacity={0.9}>
                    Waste Saved This Month
                  </Text>
                  <Text color="white" fontSize="$9" fontWeight="800">
                    {(stats.consumed * 0.3).toFixed(1)} kg
                  </Text>
                  <XStack alignItems="center" gap="$2">
                    <Text color="white" fontSize="$3" opacity={0.9}>
                      That's ~ ${stats.consumed * 5} saved! 💰
                    </Text>
                  </XStack>
                  <XStack alignItems="center" gap="$1" marginTop="$1">
                    <Text color="white" fontSize="$2" opacity={0.8}>Tap for details</Text>
                    <ArrowRight size={12} color="white" opacity={0.8} />
                  </XStack>
                </YStack>
                
                {/* SVG Circular Progress */}
                <YStack alignItems="center" justifyContent="center" width={size} height={size}>
                  <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
                    {/* Background Circle */}
                    <SvgCircle
                      cx={center}
                      cy={center}
                      r={radius}
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                    />
                    {/* Progress Circle */}
                    {savedPercentage > 0 && (
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
                  <YStack position="absolute" alignItems="center" justifyContent="center">
                    <Text color="white" fontWeight="bold">
                      {savedPercentage}%
                    </Text>
                  </YStack>
                </YStack>
              </XStack>
            </Card>
          </TouchableOpacity>

          {/* Quick Actions */}
          <YStack gap="$3">
            <Text color={Colors.text} fontSize="$5" fontWeight="600">
              Quick Actions
            </Text>
            <XStack gap="$3" width="100%" alignItems="center" justifyContent="center" >
              <Button
                borderColor={Colors.primary}
                backgroundColor={Colors.surface}
                height={100}
                flexGrow={1}
                borderRadius="$5"
                flexDirection="column"
                gap="$2"
                pressStyle={{ opacity: 0.8 }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/scanner");
                }}
              >
                <Circle size={40} backgroundColor={Colors.greenLight}>
                  <Scan size={20} color={Colors.primary} />
                </Circle>
                <Text color={Colors.text} fontSize="$3" fontWeight="600">
                  Scan
                </Text>
              </Button>

              <Button
                borderColor={Colors.yellow}
                backgroundColor={Colors.surface}
                height={100}
                flexGrow={1}
                borderRadius="$5"
                flexDirection="column"
                gap="$2"
                pressStyle={{ opacity: 0.8 }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/add");
                }}
              >
                <Circle size={40} backgroundColor={Colors.yellowLight}>
                  <Plus size={20} color={Colors.yellow} />
                </Circle>
                <Text color={Colors.text} fontSize="$3" fontWeight="600">
                  Add Item
                </Text>
              </Button>

              <Button
                borderColor={Colors.red}
                backgroundColor={Colors.surface}
                height={100}
                flexGrow={1}
                borderRadius="$5"
                flexDirection="column"
                gap="$2"
                pressStyle={{ opacity: 0.8 }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/inventory");
                }}
              >
                <Circle size={40} backgroundColor={Colors.redLight}>
                  <ArrowRight size={20} color={Colors.red} />
                </Circle>
                <Text color={Colors.text} fontSize="$3" fontWeight="600">
                  See All
                </Text>
              </Button>
            </XStack>
          </YStack>

          {/* Eat Me First Section */}
          <YStack gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <Text color={Colors.text} fontSize="$5" fontWeight="600">
                Eat Me First 🚨
              </Text>
              <Link href="/inventory" asChild>
                <Text color={Colors.primary} fontWeight="600">
                  View All
                </Text>
              </Link>
            </XStack>

            <YStack gap="$3">
              {expiringSoon.map((item) => (
                <Card
                  key={item.id}
                  backgroundColor={Colors.surface}
                  borderRadius="$4"
                  padding="$0"
                  bordered
                  borderColor={Colors.border}
                  elevation={2}
                >
                  <XStack>
                    {item.image ? (
                      <Image
                        source={{ uri: item.image, width: 100, height: 100 }}
                        style={{
                          borderTopLeftRadius: 10,
                          borderBottomLeftRadius: 10,
                        }}
                      />
                    ) : (
                      <YStack 
                        width={100} 
                        height={100} 
                        backgroundColor={Colors.border} 
                        alignItems="center" 
                        justifyContent="center"
                        borderTopLeftRadius={10}
                        borderBottomLeftRadius={10}
                      >
                        <Text fontSize="$6">🥫</Text>
                      </YStack>
                    )}
                    <YStack
                      padding="$3"
                      flex={1}
                      justifyContent="space-between"
                    >
                      <XStack justifyContent="space-between">
                        <Text
                          color={Colors.text}
                          fontSize="$4"
                          fontWeight="bold"
                        >
                          {item.name}
                        </Text>
                        <Circle size={10} backgroundColor={Colors.red} />
                      </XStack>
                      <Text color={Colors.textSecondary} fontSize="$3">
                        {item.quantity} • {item.category}
                      </Text>
                      <XStack
                        alignItems="center"
                        gap="$1"
                        backgroundColor={Colors.redLight}
                        alignSelf="flex-start"
                        paddingHorizontal="$2"
                        paddingVertical="$1"
                        borderRadius="$2"
                      >
                        <Clock size={12} color={Colors.red} />
                        <Text color={Colors.red} fontSize="$2" fontWeight="600">
                          Expires{" "}
                          {new Date(item.expiryDate).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" }
                          )}
                        </Text>
                      </XStack>
                    </YStack>
                  </XStack>
                </Card>
              ))}
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
