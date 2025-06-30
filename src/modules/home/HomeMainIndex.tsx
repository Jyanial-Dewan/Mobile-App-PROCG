import {useIsFocused, useNavigation} from '@react-navigation/native';
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
} from 'react-native';
import {Edge} from 'react-native-safe-area-context';
import ContainerNew from '../../common/components/Container';
import {COLORS} from '../../common/constant/Index';
import {httpRequest} from '../../common/constant/httpRequest';
import useAsyncEffect from '../../common/packages/useAsyncEffect/useAsyncEffect';
import {useRootStore} from '../../stores/rootStore';
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
  } = useRootStore();
  const navigation = useNavigation();
  const drawerStatus = useDrawerStatus();
  const {socket} = useSocketContext();
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(false);
  // const url = selectedUrl || ProcgURL;
  // const [profilePhoto, setProfilePhoto] = useState<Profile>({
  //   uri: `${url}/${userInfo?.profile_picture.original}`,
  // });
  // console.log(url + '/' + userInfo?.profile_picture.original, 'original');

  const url = selectedUrl || ProcgURL;
  const [profilePhoto, setProfilePhoto] = useState(
    `${url}/${userInfo?.profile_picture.original}`,
  );
  const [imageError, setImageError] = useState(false);
  console.log(imageError, '57');

  console.log(profilePhoto, 'home');

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
        isConsole: true,
        isConsoleParams: true,
      };
      const res = await httpRequest(api_params, setIsLoading);
      console.log(res);
      setProfilePhoto(`${url}/${res.profile_picture.original}`);
    },

    [isFocused, drawerStatus],
  );

  //Post_Notification Permission
  useEffect(() => {
    const requenstPermissionAndroid = async () => {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const token = await messaging().getToken();
        fcmTokenSave({fcmToken: token});
        // console.log('FCM Token:', token);
        // getFCMToken();

        const tokenPayload = {
          token: token,
          username: userInfo?.user_name,
        };
        const tokenParams = {
          url: api.RegisterToken,
          data: tokenPayload,
          method: 'post',
          baseURL: url,
          // isConsole: true,
          // isConsoleParams: true,
        };
        await httpRequest(tokenParams, setIsLoading);
      } else {
        Alert.alert('Permission Denied');
      }
    };
    requenstPermissionAndroid();
  }, []);

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

  //Socket Connection
  useEffect(() => {
    socket?.on('inactiveDevice', data => {
      socket.disconnect();
      if (deviceInfoData && deviceInfoData.id === data.id) {
        logout();
        navigation.navigate('Login');
      }
    });

    return () => {
      socket?.off('inactiveDevice');
    };
  }, [socket]);

  return (
    <ContainerNew style={styles.container}>
      <View style={styles.topContainer}>
        <TouchableOpacity
          onPress={navigation.toggleDrawer}
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
        <TouchableOpacity>
          <SVGController name="Bell" />
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
