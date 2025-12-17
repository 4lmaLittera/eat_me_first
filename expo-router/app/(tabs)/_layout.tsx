import { Tabs, useRouter } from 'expo-router';
import { Home, Package, Plus, ChefHat } from '@tamagui/lucide-icons';
import { Colors } from '../../constants/Colors';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function TabLayout() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarStyle: {
            position: 'absolute',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Colors.surface,
            borderTopWidth: 0,
            elevation: 5,
            borderRadius: 30,
            marginLeft: '5%',
            marginRight: '25%',
            height: 56,
            bottom: 25,
            paddingBottom: 0,
          },
          tabBarShowLabel: false,
          tabBarItemStyle: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          },
          tabBarIconStyle: {
            marginTop: 0,
            marginBottom: 0,
          },
        }}
      >
        <Tabs.Screen
          name="inventory"
          options={{
            tabBarIcon: ({ color }) => <Package color={color} size={24} />,
            tabBarButton: ({ onPress, style, children }) => (
              <Pressable
                style={style}
                onPress={(e) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onPress?.(e);
                }}
              >
                {children}
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color }) => <Home color={color} size={24} />,
            tabBarButton: ({ onPress, style, children }) => (
              <Pressable
                style={style}
                onPress={(e) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onPress?.(e);
                }}
              >
                {children}
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="recipes"
          options={{
            tabBarIcon: ({ color }) => <ChefHat color={color} size={24} />,
            tabBarButton: ({ onPress, style, children }) => (
              <Pressable
                style={style}
                onPress={(e) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onPress?.(e);
                }}
              >
                {children}
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            href: null,
          }}
        />
      </Tabs>

      {/* Plus Button - Right side */}
      <Pressable
        style={({ pressed }) => [
          styles.plusButton,
          pressed && styles.plusButtonPressed,
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push({
            pathname: '/(tabs)/add',
            params: { resetKey: Date.now().toString() },
          });
        }}
      >
        <Plus color="#FFFFFF" size={26} strokeWidth={2.5}/>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  plusButton: {
    position: 'absolute',
    right: 20,
    bottom: 25,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: Colors.primary,
  },
  plusButtonPressed: {
    backgroundColor: '#059669',
    transform: [{ scale: 0.95 }],
  },
});