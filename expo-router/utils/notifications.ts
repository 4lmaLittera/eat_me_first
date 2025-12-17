import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getExpiringProducts } from './database';

// Store notification module reference after loading
type NotificationsModule = typeof import('expo-notifications');
let notificationsModule: NotificationsModule | null = null;
let loadAttempted = false;

async function getNotifications(): Promise<NotificationsModule | null> {
  if (notificationsModule) return notificationsModule;
  if (loadAttempted) return null;
  
  loadAttempted = true;
  try {
    notificationsModule = await import('expo-notifications');
    return notificationsModule;
  } catch {
    return null;
  }
}

export async function registerForPushNotifications(): Promise<string | null> {
  // Check if physical device first
  if (!Device.isDevice) {
    return null;
  }

  const Notifications = await getNotifications();
  if (!Notifications) return null;

  try {
    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    // Set notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('expiry-reminders', {
        name: 'Expiry Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981',
        sound: 'default',
      });
    }

    // Configure how notifications appear when app is in foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    return 'notifications-enabled';
  } catch {
    return null;
  }
}

export async function scheduleExpiryNotifications(): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  try {
    // Cancel all existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Get products expiring in the next 3 days
    const expiringProducts = await getExpiringProducts(3);

    if (expiringProducts.length === 0) {
      return;
    }

    // Group by days remaining
    const today = new Date();
    const expiring: { [key: string]: string[] } = {
      today: [],
      tomorrow: [],
      soon: [],
    };

    expiringProducts.forEach((product) => {
      const expiryDate = new Date(product.expiryDate);
      const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 0) {
        expiring.today.push(product.name);
      } else if (diffDays === 1) {
        expiring.tomorrow.push(product.name);
      } else {
        expiring.soon.push(product.name);
      }
    });

    // Build notification content
    let title = '🍎 Food Expiry Alert';
    let body = '';

    if (expiring.today.length > 0) {
      title = '⚠️ Food Expiring Today!';
      body = `${expiring.today.slice(0, 3).join(', ')}${expiring.today.length > 3 ? ` and ${expiring.today.length - 3} more` : ''} expire today!`;
    } else if (expiring.tomorrow.length > 0) {
      body = `${expiring.tomorrow.slice(0, 3).join(', ')}${expiring.tomorrow.length > 3 ? ` and ${expiring.tomorrow.length - 3} more` : ''} expire tomorrow.`;
    } else if (expiring.soon.length > 0) {
      body = `${expiring.soon.length} item${expiring.soon.length > 1 ? 's' : ''} expiring soon. Check your kitchen!`;
    }

    if (body) {
      // Schedule daily notification at 9 AM
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'expiry-reminder' },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 9,
          minute: 0,
        },
      });
    }
  } catch {
    // Silently fail
  }
}

export async function sendImmediateNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: null,
    });
  } catch {
    // Silently fail
  }
}

export async function cancelAllNotifications(): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Silently fail
  }
}
