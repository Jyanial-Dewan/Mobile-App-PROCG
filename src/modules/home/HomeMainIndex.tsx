import {
  NavigationProp,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import {observer} from 'mobx-react-lite';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  PermissionsAndroid,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import {Edge} from 'react-native-safe-area-context';
import ContainerNew from '../../common/components/Container';
import {COLORS} from '../../common/constant/Index';
import {httpRequest} from '../../common/constant/httpRequest';
import useAsyncEffect from '../../common/packages/useAsyncEffect/useAsyncEffect';
import {secureStorage, useRootStore} from '../../stores/rootStore';
import {api} from '../../common/api/api';
import {ProcgURL} from '../../../App';
import messaging from '@react-native-firebase/messaging';
import SVGController from '../../common/components/SVGController';
// import Image from 'react-native-image-fallback';
import FastImage from 'react-native-fast-image';
import {useSocketContext} from '../../context/SocketContext';
// import {Profile} from '../../common/components/custom-drawer';
import {useDrawerStatus} from '@react-navigation/drawer';
import axios from 'axios';
import {RootStackScreensParms} from '~/types/navigationTs/RootStackScreenParams';
import {Badge} from 'react-native-paper';
import CustomTextNew from '~/common/components/CustomText';
import {DrawerNavigationHelpers} from '@react-navigation/drawer/lib/typescript/src/types';

const edges: Edge[] = ['right', 'left'];
const wait = (timeout: any) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

const HomeMainIndex = () => {
  const {
    userInfo,
    hydrate,
    usersStore,
    deviceInfoData,
    logout,
    fcmTokenSave,
    fcmToken,
    selectedUrl,
    menuStore,
    devicesStore,
    pushNotificaton,
  } = useRootStore();
  const navigation = useNavigation<NavigationProp<any>>();
  const drawerNav = useNavigation<DrawerNavigationHelpers>();
  const drawerStatus = useDrawerStatus();
  const {socket} = useSocketContext();
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(false);
  const resPushNotificaton = secureStorage.getItem('pushNotificaton');
  const url = selectedUrl || ProcgURL;
  const [profilePhoto, setProfilePhoto] = useState(
    `${url}/${userInfo?.profile_picture.original}`,
  );
  const [imageError, setImageError] = useState(false);

  const fallbacks = require('../../assets/prifileImages/profile.jpg');

  // fetch unique user
  useAsyncEffect(
    async isMounted => {
      if (!isMounted()) {
        return null;
      }
      const api_params = {
        url: api.Users + `/` + Number(userInfo?.user_id),
        baseURL: url,
        // isConsole: true,
        // isConsoleParams: true,
      };
      const res = await httpRequest(api_params, setIsLoading);
      // console.log(res);
      setProfilePhoto(`${url}/${res.profile_picture.original}`);
    },

    [isFocused, drawerStatus],
  );

  //Fetch Users
  useAsyncEffect(
    async isMounted => {
      if (!isMounted()) {
        return null;
      }
      const api_params = {
        url: api.Users,
        baseURL: url,
        headers: {Authorization: `Bearer ${userInfo?.access_token}`},
        // isConsole: true,
        // isConsoleParams: true,
      };
      const res = await httpRequest(api_params, setIsLoading);
      usersStore.saveUsers(res);
    },
    [isFocused],
  );

  //Fetch Menu
  useAsyncEffect(
    async isMounted => {
      if (!isMounted()) {
        return null;
      }
      const api_params = {
        url: api.GetMenu,
        baseURL: url,
        headers: {Authorization: `Bearer ${userInfo?.access_token}`},
        // isConsole: true,
        // isConsoleParams: true,
      };
      const res = await httpRequest(api_params, setIsLoading);
      menuStore?.saveMobileMenu(res[0].menu_structure);
    },
    [isFocused],
  );

  //Fetch Devices
  useAsyncEffect(
    async isMounted => {
      if (!isMounted()) {
        return null;
      }
      const api_params = {
        url: `${api.getDevices}/${userInfo?.user_id}`,
        baseURL: url,
        headers: {Authorization: `Bearer ${userInfo?.access_token}`},
        // isConsole: true,
        // isConsoleParams: true,
      };
      const res = await httpRequest(api_params, setIsLoading);

      const formattedWithUsername = res.map((item: any) => {
        return {
          ...item,
          user: userInfo?.user_name,
        };
      });

      devicesStore.setDevices(formattedWithUsername);
    },
    [isFocused],
  );

  //Inactive Device via Socket
  useEffect(() => {
    socket?.on('inactiveDevice', data => {
      console.log(data, 'inactiveDevice');
      socket.disconnect();
      if (deviceInfoData && deviceInfoData.id === data.id) {
        logout();
        // navigation.navigate('Login');
      }
    });

    return () => {
      socket?.off('inactiveDevice');
    };
  }, [socket]);

  //Post_Notification Permission
  useEffect(() => {
    const showAlert = () =>
      Alert.alert(
        'Push Notifications',
        'Allow PRO-CG to send you notifications?',
        [
          {
            text: 'Ask me later',
            onPress: () => {
              // console.log('Ask me later pressed');
              pushNotificaton('askMeLater');
            },
          },
          {
            text: 'Cancel',
            onPress: () => {
              // console.log('Cancel Pressed');
              pushNotificaton('cancel');
            },
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: () => {
              // console.log('OK Pressed');
              allowPushNotification();
              pushNotificaton('ok');
            },
          },
        ],
      );

    const allowPushNotification = async () => {
      const token = await messaging().getToken();
      fcmTokenSave({fcmToken: token});

      const tokenPayload = {
        token: token,
        username: userInfo?.user_name,
      };
      const tokenParams = {
        url: api.RegisterToken,
        data: tokenPayload,
        method: 'post',
        baseURL: url,
      };
      await httpRequest(tokenParams, setIsLoading);
    };
    const requestPermissionAndroid = async () => {
      //console.log('render time home-------------------');
      if (Platform.OS === 'android') {
        // Handle for Android 8.1 or lower
        if (Platform.Version < 28) {
          // For Android 8.1 or lower, permission is automatically granted (no need for POST_NOTIFICATIONS)
          if (!resPushNotificaton || resPushNotificaton === 'askMeLater')
            showAlert();
        } else {
          // For Android 9 and above, request POST_NOTIFICATIONS permission
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            allowPushNotification();
          } else {
            Alert.alert('Permission Denied');
          }
        }
      }
    };

    requestPermissionAndroid();
  }, []);

  return (
    <ContainerNew style={styles.container}>
      <View style={styles.topContainer}>
        <TouchableOpacity
          onPress={drawerNav.toggleDrawer}
          style={{flexDirection: 'row', gap: 4, alignItems: 'center'}}>
          {/* <Image
            style={styles.profileImage}
            source={{uri: profilePhoto}}
            fallback={fallbacks}
          /> */}
          {imageError ? (
            <Image source={fallbacks} style={styles.profileImage} />
          ) : (
            <FastImage
              source={{
                uri: profilePhoto,
                headers: {
                  Authorization: `Bearer ${userInfo?.access_token}`,
                },
                priority: FastImage.priority.normal,
              }}
              style={styles.profileImage}
              onError={() => setImageError(true)}
            />
          )}

          <View>
            <Text
              style={{color: COLORS.black, fontWeight: '600', fontSize: 14}}>
              Welcome!
            </Text>
            <Text style={{color: COLORS.darkGray, fontSize: 14}}>
              {userInfo?.user_name}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Alerts')}>
          <View>
            <SVGController name="Bell" />

            {/* {messageStore.notificationMessages.length > 0 && ( */}
            <Badge
              visible={true}
              size={25}
              style={{
                position: 'absolute',
                top: -15,
                right: -12,
                fontWeight: '700',
                backgroundColor: COLORS.iconBGREDColor,
                color: COLORS.white,
              }}>
              3{/* {messageStore.notificationMessages?.length} */}
            </Badge>
            {/* )} */}
          </View>
        </TouchableOpacity>
      </View>
    </ContainerNew>
  );
};

export default observer(HomeMainIndex);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
  },
  topContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 99,
    borderWidth: 0.5,
    borderColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
