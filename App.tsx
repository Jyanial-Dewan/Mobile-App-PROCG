import {LinkingOptions, NavigationContainer} from '@react-navigation/native';
import axios, {AxiosError, AxiosResponse} from 'axios';
import {observer} from 'mobx-react-lite';
import React, {useCallback, useEffect, useMemo} from 'react';
import {Linking, LogBox, TextInput, Text, Alert, Platform} from 'react-native';
import {Provider as PaperProvider} from 'react-native-paper';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import {makeDecryption, makeEncryption} from './src/common/constant/encryption';
import delay from './src/common/services/delay';
import useIsDarkTheme from './src/hooks/useIsDarkTheme';
import RootStack from './src/navigations/RootStack';
import {RootStoreProvider, useRootStore} from './src/stores/rootStore';
import DarkTheme from './src/themes/darkTheme';
import DefaultTheme from './src/themes/defaultTheme';
import {withoutEncryptionApi} from './src/common/api/withoutEncrytApi';
import {ToastProvider} from './src/common/components/CustomToast';
import BootSplash from 'react-native-bootsplash';
import {
  procgURLL,
  procgURLL2,
  msgBroker,
  secretKeyy,
  secureStorageKeyy,
} from '@env';
import DeviceInfo from 'react-native-device-info';
import Geolocation from 'react-native-geolocation-service';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {PermissionsAndroid} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';
import Drawer from './src/navigations/drawer';
import {navigationRef} from './src/navigations/RootNavigation';
import {
  SocketContextProvider,
  useSocketContext,
} from './src/context/SocketContext';
import {api} from './src/common/api/api';
import {httpRequest} from './src/common/constant/httpRequest';

LogBox.ignoreLogs(['EventEmitter.removeListener', 'ViewPropTypes']);
if ((Text as any).defaultProps == null) {
  (Text as any).defaultProps = {};
  (Text as any).defaultProps.allowFontScaling = false;
}
if ((TextInput as any).defaultProps == null) {
  (TextInput as any).defaultProps = {};
  (TextInput as any).defaultProps.allowFontScaling = false;
}
export const ProcgURL = procgURLL;
export const FlaskURL = procgURLL2;
export const MsgBroker = msgBroker;
export const secretKey = secretKeyy;
export const secureStorageKey = secureStorageKeyy;

const linking: LinkingOptions<any> = {
  prefixes: [
    /* your linking prefixes */
    'PROCG://',
    'https://procg.datafluent.team/',
  ],
  config: {
    /* configuration for matching screens with paths */
    // initialRouteName: 'Loader',
    screens: {
      // Loader: {
      //   path: 'loader/:delay?/:text?',
      //   parse: {
      //     delay: ms => Number(ms),
      //     text: text => decodeURIComponent(text),
      //   },
      //   stringify: {
      //     delay: ms => String(ms),
      //     text: text => encodeURIComponent(text),
      //   },
      // },
      // Home: '',
      Notification: 'notifications/inbox',
      Menu: 'menu',
      ActionItem: 'invitation',
      ResetPassword: 'reset-password/:request_id/:user_id/:token',
    },
  },
};

// Encryption process
axios.interceptors.request.use(
  async config => {
    let url = config?.url;
    if (withoutEncryptionApi.some(element => url?.includes(element))) {
      return config;
    }
    let copyOfConfig = {...config};
    const apiPrefixes = url?.includes('?');
    if (apiPrefixes) {
      let splitUrl = url?.split('?');
      const encryptedData = await makeEncryption(splitUrl?.[1]);
      url = `${splitUrl?.[0]}?${encryptedData}`;
      copyOfConfig = {...config, url};
    }
    let payload = null;
    if (config?.data) {
      payload = await makeEncryption(JSON.stringify(config?.data));
    }

    copyOfConfig = {
      ...copyOfConfig,
      data: payload,
      headers: {
        ...copyOfConfig.headers,
        'Content-Type': 'application/json',
      },
    };

    return copyOfConfig;
  },
  error => Promise.reject(error),
);

axios.interceptors.response.use(
  async (response: AxiosResponse) => {
    if (
      withoutEncryptionApi.some(element =>
        response?.config?.url?.includes(element),
      )
    ) {
      return response;
    }
    let decryptedData = makeDecryption(response?.data);
    return {
      ...response,
      data: decryptedData,
    };
  },

  error => Promise.reject(error),
);

const Main = observer(() => {
  const {
    hydrate,
    deviceInfoData,
    deviceInfoSave,
    userInfo,
    logout,
    messageStore,
    alertsStore,
    selectedUrl,
  } = useRootStore();
  const rootStore = useRootStore();
  const {socket, setUserId, addDevice} = useSocketContext();
  const [isDark] = useIsDarkTheme();
  const limit = 50;

  // Handle background messages
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Received background message:', remoteMessage);
    handleNotificationPayload(remoteMessage);
  });

  // Handle notifications pressed while the app is in background
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification opened from background state:', remoteMessage);
    handleNotificationPress(remoteMessage);
  });

  // Handle notification that opened the app from a quit state (FCM)
  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage,
          );
          handleNotificationPress(remoteMessage);
        }
      });
  }, []);

  // Handle notification that opened the app from a quit state (notifee)
  useEffect(() => {
    notifee.getInitialNotification().then(notificationEvent => {
      if (notificationEvent?.notification) {
        console.log(
          'Notifee notification caused app to open from quit state:',
          notificationEvent.notification,
        );
        handleNotificationPress(notificationEvent.notification);
      }
    });
  }, []);

  // Handle notifee notification presses (foreground)
  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(({type, detail}) => {
      if (type === EventType.PRESS) {
        console.log('User pressed notification:', detail.notification);
        handleNotificationPress(detail.notification);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    setUserId(userInfo?.user_id);
  }, [userInfo?.user_id]);

  const theme = useMemo(() => {
    if (isDark) {
      return DarkTheme;
    }
    return DefaultTheme;
  }, [isDark]);

  // Process the notification payload and store it locally
  const handleNotificationPayload = useCallback(
    async (remoteMessage: any) => {
      try {
        const data =
          remoteMessage?.data?.payload &&
          JSON.parse(remoteMessage.data.payload);
        console.log(data);
        if (!data) {
          return;
        }
        if (data.type === 'read') {
          const id =
            data.notification_id ?? data.parent_id ?? data.notificationID;
          console.log(id);
          if (id) {
            // remove from in-app stores too
            messageStore.removeReceivedMessage(id);
            // messageStore.removeNotificationMessage(id);
            // remove from the notification bar
            await notifee.cancelNotification(id);
          }
          return;
        }
        if (data.type === 'alert') {
          const fallbackId = data.alert_id ?? Date.now();
          const formattedAlert = {
            user_id:
              data.user_id ?? userInfo?.user_id ?? data.recipients?.[0] ?? 0,
            user_name: data.user_name ?? '',
            notification_id:
              data.notification_id ?? data.notificationID ?? String(fallbackId),
            alert_id: Number(fallbackId),
            alert_name: data.alert_name ?? '',
            description: data.description ?? '',
            acknowledge: data.acknowledge ?? false,
            notification_status: data.notification_status ?? 'unread',
            created_by: data.created_by ?? data.sender ?? 0,
            creation_date: data.creation_date || data.date || Date.now(),
            last_updated_by: data.last_updated_by ?? data.sender ?? 0,
            last_update_date: data.last_update_date || data.date || Date.now(),
          };
          alertsStore.addAlert(formattedAlert);
          return;
        }
        if (data?.notification_id) {
          const formattedData = {
            ...data,
            creation_date: new Date(
              data.creation_date || data.date || Date.now(),
            ),
            last_update_date: new Date(
              data.last_update_date || data.date || Date.now(),
            ),
          };
          messageStore.addReceivedMessage(formattedData);
          messageStore.addNotificationMessage(formattedData);
        }
      } catch (error) {
        console.error('Error processing notification payload:', error);
      }
    },
    [messageStore, alertsStore, userInfo],
  );

  // Redirect to the notification screen or a specific notification on press
  const redirectToNotification = useCallback(
    (notificationId?: string) => {
      let attempts = 0;
      const tryNavigate = () => {
        if (!navigationRef.isReady() || !rootStore.userInfo?.isLoggedIn) {
          if (attempts < 120) {
            attempts++;
            setTimeout(tryNavigate, 500);
          }
          return;
        }
        console.log('Redirecting to notification:', notificationId);
        if (notificationId) {
          navigationRef.navigate('NotificationDetails', {_id: notificationId});
        } else {
          navigationRef.navigate('BottomTab', {screen: 'Notification'});
        }
      };
      tryNavigate();
    },
    [rootStore],
  );

  // Redirect to the alerts screen when an alert push is pressed
  const redirectToAlerts = useCallback(() => {
    let attempts = 0;
    const tryNavigate = () => {
      if (!navigationRef.isReady() || !rootStore.userInfo?.isLoggedIn) {
        if (attempts < 120) {
          attempts++;
          setTimeout(tryNavigate, 500);
        }
        return;
      }
      console.log('Redirecting to alerts');
      navigationRef.navigate('Alerts');
    };
    tryNavigate();
  }, [rootStore]);

  // Extract the notification id and redirect when a push is pressed
  const handleNotificationPress = useCallback(
    (remoteMessage: any) => {
      console.log(remoteMessage, '272');
      handleNotificationPayload(remoteMessage);
      try {
        const data =
          remoteMessage?.data?.payload &&
          JSON.parse(remoteMessage.data.payload);
        if (data?.type === 'alert') {
          redirectToAlerts();
          return;
        }
        let notificationId: string | undefined;
        notificationId =
          data?.parentId ||
          data?.notificationID ||
          data?.parent_notification_id;
        redirectToNotification(notificationId);
      } catch (error) {
        console.error('Error parsing notification payload:', error);
        redirectToNotification();
      }
    },
    [handleNotificationPayload, redirectToNotification, redirectToAlerts],
  );

  const onReady = useCallback(async () => {
    try {
      const uri = await Linking.getInitialURL();
      if (uri) {
        await delay(200);
        await hydrate();
        await BootSplash.hide({fade: true});
      }
    } catch (error) {
      console.error(JSON.stringify(error, null, 2));
    }
  }, [hydrate]);

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission denied');
          return;
        }
      }
      fetchLocation();
    };

    const fetchLocation = () => {
      Geolocation.getCurrentPosition(
        async position => {
          const {latitude, longitude} = position.coords;
          const loc = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          const jsonLoc = await loc.json();
          const locString = `${jsonLoc.address.city}, ${
            jsonLoc.address.country
          }, ${jsonLoc.address.country_code.toUpperCase()}`;
          deviceInfoSave({...deviceInfoData, location: locString});
        },
        error => {
          console.error(error);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    };

    requestPermission();
  }, []);

  useEffect(() => {
    const getDeviceInfo = async () => {
      const operatingSystem = DeviceInfo.getSystemName();
      const deviceType = DeviceInfo.getDeviceType();
      const userAgent = await DeviceInfo.getUserAgent();
      const ipAddress = await DeviceInfo.getIpAddress();
      const dateString = new Date().toLocaleString();

      deviceInfoSave({
        ...deviceInfoData,
        os: operatingSystem,
        device_type: deviceType,
        user_agent: userAgent,
        ip_address: ipAddress,
        is_active: 1,
        added_at: dateString,
      });
    };

    getDeviceInfo();
  }, [userInfo?.isLoggedIn, deviceInfoData.is_active]);

  //Add Device via Socket
  useEffect(() => {
    if (!userInfo?.user_id || !deviceInfoData.id || !deviceInfoData.user_id)
      return;
    addDevice(deviceInfoData);
  }, [socket, userInfo?.user_id, deviceInfoData.id]);

  //Inactive Device via Socket
  useEffect(() => {
    socket?.on('inactiveDevice', data => {
      // console.log(data, 'inactiveDevice ---------------------------');
      if (deviceInfoData && deviceInfoData.id === data.id) {
        logout();
        socket.disconnect();
      }
    });

    return () => {
      socket?.off('inactiveDevice');
    };
  }, [socket]);

  // For realtime sync messages
  useEffect(() => {
    (async () => {
      const currentPage = 1;
      const url = selectedUrl || ProcgURL;
      if (!userInfo?.user_id) return;
      const api_params = {
        url: `${api.RecycleBinMessages}?user_id=${userInfo?.user_id}&page=${currentPage}&limit=${limit}`,
        baseURL: url,
        // isConsole: true,
        // isConsoleParams: true,
      };
      const res = await httpRequest(api_params, () => {});
      if (res) {
        messageStore.saveBinMessages(res.result);
      }
    })();
  }, [userInfo?.isLoggedIn]);

  //console.log('check reder App...............................');
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <PaperProvider theme={theme}>
        <ToastProvider>
          <NavigationContainer
            linking={linking}
            ref={navigationRef}
            theme={theme}
            onReady={onReady}>
            {userInfo?.isLoggedIn ? <Drawer /> : <RootStack />}
          </NavigationContainer>
        </ToastProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
});

const App = () => {
  return (
    <RootStoreProvider>
      <SocketContextProvider>
        <GestureHandlerRootView>
          <Main />
        </GestureHandlerRootView>
      </SocketContextProvider>
    </RootStoreProvider>
  );
};

export default App;
