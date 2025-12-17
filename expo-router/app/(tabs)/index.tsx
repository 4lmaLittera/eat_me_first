import React from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack, XStack, Text, Card, Button, Image, Circle } from "tamagui";
import {
  Bell,
  Scan,
  Plus,
  ArrowRight,
  Clock,
  ChevronRight,
} from "@tamagui/lucide-icons";
import { Link, useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { PRODUCTS } from "../../constants/data";

export default function HomeScreen() {
  const router = useRouter();
  const expiringSoon = PRODUCTS.sort((a, b) =>
    a.expiryDate.localeCompare(b.expiryDate)
  ).slice(0, 3);
  const todayCount = PRODUCTS.filter((p) => {
    const today = new Date().toISOString().split("T")[0];
    return p.expiryDate === today;
  }).length;

  // Fake calculation for "Food Waste Saved"
  const savedPercentage = 85;

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
                  2.4 kg
                </Text>
                <XStack alignItems="center" gap="$2">
                  <Text color="white" fontSize="$3" opacity={0.9}>
                    That's ~ $45 saved! 💰
                  </Text>
                </XStack>
              </YStack>
              {/* Simple Ring Visualization using Border */}
              <Circle
                size={80}
                borderWidth={6}
                borderColor="rgba(255,255,255,0.3)"
                justifyContent="center"
                alignItems="center"
              >
                <Circle
                  size={80}
                  borderWidth={6}
                  borderColor="white"
                  borderTopColor="transparent"
                  borderRightColor="transparent"
                  position="absolute"
                  style={{ transform: [{ rotate: "45deg" }] }}
                />
                <Text color="white" fontWeight="bold">
                  {savedPercentage}%
                </Text>
              </Circle>
            </XStack>
          </Card>

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
                onPress={() => router.push("/add")}
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
                onPress={() => router.push("/add")}
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
                onPress={() => router.push("/inventory")}
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
                    <Image
                      source={{ uri: item.image, width: 100, height: 100 }}
                      style={{
                        borderTopLeftRadius: 10,
                        borderBottomLeftRadius: 10,
                      }}
                    />
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
