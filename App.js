import { StatusBar } from 'expo-status-bar';
import * as Device from 'expo-device';
import { StyleSheet, Button, View, Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowAlert: true,
    };
  },
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');

  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
    } else {
      Alert.alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    console.log(token);
    return token;
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
    const subscription1 = Notifications.addNotificationReceivedListener(
      notification => {
        // console.log('NOTIFICATION RECEIVED', notification);
        // console.log(notification.request.content.data.userName);
      }
    );

    const subscription2 = Notifications.addNotificationResponseReceivedListener(
      response => {
        // console.log('NOTIFICATION RESPONSE');
        // console.log(response.notification.request.content.data.userName);
      }
    );

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }, []);

  const scheduleNotificationsHandler = () => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'My first notification',
        body: 'This is my first notification',
        data: { userName: 'Matheus' },
      },
      trigger: {
        seconds: 5,
      },
    });
  };

  const pushNotificationsHandler = async () => {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: 'Original Title',
      body: 'And here is the body!',
      data: { someData: 'goes here' },
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  };

  return (
    <View style={styles.container}>
      <Button
        title="Schedule Notification"
        onPress={scheduleNotificationsHandler}
      />
      <Button title="Push Notification" onPress={pushNotificationsHandler} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
