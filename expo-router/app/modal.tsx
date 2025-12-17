import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { YStack, Text, Button } from 'tamagui';
import { Colors } from '../constants/Colors';
import { useRouter } from 'expo-router';

export default function ModalScreen() {
  const router = useRouter();
  return (
    <YStack flex={1} backgroundColor={Colors.background} alignItems="center" justifyContent="center" padding="$4">
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      <Text color={Colors.text} fontSize="$8" fontWeight="bold" marginBottom="$2">Notifications</Text>
      <Text color={Colors.textSecondary} fontSize="$4" textAlign="center" marginBottom="$4">
        You're all caught up! No food is wasted today.
      </Text>
      <Button onPress={() => router.back()} backgroundColor={Colors.primary} color="white">
        Close
      </Button>
    </YStack>
  );
}