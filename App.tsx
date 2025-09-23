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
import Drawer from './src/navigations/drawer';
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
export const ProcgURL2 = procgURLL2;
export const MsgBroker = msgBroker;
export const secretKey = secretKeyy;
export const secureStorageKey = secureStorageKeyy;

const linking: LinkingOptions<any> = {
  prefixes: [
    /* your linking prefixes */
    'PROCG://',
    'https://procg.datafluent.team',
  ],
  config: {
    /* configuration for matching screens with paths */
    initialRouteName: 'Loader',
    screens: {
      Loader: {
        path: 'loader/:delay?/:text?',
        parse: {
          delay: ms => Number(ms),
          text: text => decodeURIComponent(text),
        },
        stringify: {
          delay: ms => String(ms),
          text: text => encodeURIComponent(text),
        },
      },
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
  async error => {
    // console.log('error', JSON.stringify(error, null, 2));
    let decryptedData = await makeDecryption(error?.response?.data);
    let newError = {response: {data: decryptedData || ''}};
    return Promise.reject(newError);
  },
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

  async (error: AxiosError) => {
    if (error?.response?.status === 401) {
      return Promise.reject({response: {data: 401}});
    } else if (error?.response?.status === 406) {
      return Promise.reject({response: {data: 406}});
    } else {
      let decryptedError = makeDecryption(error?.response?.data);
      let modifiedError = {response: {data: decryptedError || ''}};
      if (
        modifiedError?.response?.data?.message ===
        'No authenticationScheme was specified, and there was no DefaultChallengeScheme found. The default schemes can be set using either AddAuthentication(string defaultScheme) or AddAuthentication(Action<AuthenticationOptions> configureOptions).'
      ) {
      } else {
        return Promise.reject(modifiedError);
      }
    }
  },
);

const Main = observer(() => {
  const {
    hydrate,
    deviceInfoData,
    deviceInfoSave,
    userInfo,
    logout,
    messageStore,
    selectedUrl,
  } = useRootStore();
  const rootStore = useRootStore();
  const {socket, setUserId, addDevice} = useSocketContext();
  const [isDark] = useIsDarkTheme();
  const limit = 50;

  // Handle background messages
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Received background message:', remoteMessage);

    // Check if data is available
    if (remoteMessage.data?.payload) {
      const data = JSON.parse(remoteMessage.data.payload);
      const formattedData = {...data, date: new Date(data.date)};
      messageStore.addReceivedMessage(formattedData);
      messageStore.addNotificationMessage(formattedData);
      messageStore.addTotalReceived();
      // onDisplayNotification(remoteMessage);
    } else {
      console.error('No payload in background message');
    }
  });

  // Handle notifications when the app is in quit mode
  messaging().onNotificationOpenedApp(async remoteMessage => {
    console.log('Notification opened from quit state:', remoteMessage);

    // Check if data is available
    if (remoteMessage.data?.payload) {
      const data = JSON.parse(remoteMessage.data.payload);
      const formattedData = {...data, date: new Date(data.date)};
      messageStore.addReceivedMessage(formattedData);
      messageStore.addNotificationMessage(formattedData);
      messageStore.addTotalReceived();
      // onDisplayNotification(remoteMessage);
    } else {
      console.error('No payload in notification');
    }
  });

  useEffect(() => {
    setUserId(userInfo?.user_id);
  }, [userInfo?.user_id]);

  const theme = useMemo(() => {
    if (isDark) {
      return DarkTheme;
    }
    return DefaultTheme;
  }, [isDark]);

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
        url:
          api.RecycleBinMessages +
          userInfo?.user_id +
          `/${currentPage}` +
          `/${limit}`,
        baseURL: url,
        // isConsole: true,
        // isConsoleParams: true,
      };
      const res = await httpRequest(api_params, () => {});
      if (res) {
        const formattedRes = res.map((msg: any) => ({
          ...msg,
          creation_date: new Date(msg.creation_date),
        }));
        messageStore.saveBinMessages(formattedRes);
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
