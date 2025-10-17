import {StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {observer} from 'mobx-react-lite';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import MainHeader from '../../common/components/MainHeader';
import {RootStackScreensParms} from '../../types/navigationTs/RootStackScreenParams';
import {UserInfoStoreType} from '../../stores/userInfo';
import {useRootStore} from '../../stores/rootStore';
import {Buffer} from 'buffer';
import {api} from '../..//common/api/api';
import {ProcgURL, ProcgURL2} from '../../../App';
import {httpRequest} from '../../common/constant/httpRequest';
import axios from 'axios';
import ContainerNew from '../../common/components/Container';
import {COLORS} from '../../common/constant/Themes';
import {useToast} from '../../common/components/CustomToast';
import CustomInvalidModal from '../../common/components/CustomInvalidModal';
import {clearAllStorage} from '../../common/services/clearStorage';
import {v4 as uuidv4} from 'uuid';

const ScanLoginQrCode = observer(() => {
  const signon_id = uuidv4();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isModalShow, setIsModalShow] = useState(false);
  const {userInfoSave, deviceInfoData, deviceInfoSave, selectedUrl} =
    useRootStore();
  const toaster = useToast();
  const url = selectedUrl || ProcgURL;

  const signOut = async () => {
    clearAllStorage();
  };

  const decode = async (token: string) => {
    console.log(token, 'scan login token');
    let cleanedToken = token.replace(/^"|"$/g, '');

    if (cleanedToken) {
      const verifyTokenPayload = {
        token: cleanedToken,
      };

      const verifyTokenParams = {
        url: api.VerifyToken,
        data: verifyTokenPayload,
        method: 'post',
        baseURL: url,
        isConsole: true,
        isConsoleParams: true,
      };

      const res = await httpRequest(verifyTokenParams, setIsVerifying);
      console.log(res, 'login');
      if (res.access_token) {
        const combined_user = {
          url: `${api.Users}/${res.user_id}`,
          baseURL: ProcgURL2,
          access_token: res.access_token,
          // isConsole: true,
          // isConsoleParams: true,
        };
        const userResponse = await httpRequest(combined_user, setIsLoading);
        const deviceInfoPayload = {
          user_id: res.user_id,
          deviceInfo: {
            id: 0,
            device_type: deviceInfoData?.device_type,
            browser_name: 'App',
            browser_version: '1.0',
            os: deviceInfoData?.os,
            user_agent: deviceInfoData?.user_agent,
            is_active: 1,
            ip_address: deviceInfoData?.ip_address,
            location: deviceInfoData?.location || 'Unknown (Location off)',
          },
          signon_audit: {
            signon_id,
            login: new Date(),
            logout: '',
            session_log: [],
          },
        };
        const deviceInfoApi_params = {
          url: api.AddDeviceInfo,
          data: deviceInfoPayload,
          method: 'post',
          baseURL: ProcgURL,
          // isConsole: true,
          // isConsoleParams: true,
        };
        // axios.defaults.baseURL = selectedUrl || ProcgURL;
        // axios.defaults.headers.common['Authorization'] =
        //   `Bearer ${res.access_token}`;
        userInfoSave({...res, ...userResponse});
        // navigation.replace('HomeScreen');
        const response = await httpRequest(deviceInfoApi_params, setIsLoading);
        if (response) {
          deviceInfoSave({
            id: response.id,
            user_id: response.user_id,
            device_type: response.device_type,
            browser_name: response.browser_name,
            browser_version: response.browser_version,
            os: response.os,
            user_agent: response.user_agent,
            added_at: response.added_at,
            is_active: response.is_active,
            ip_address: response.ip_address,
            location: response.location,
            user: userResponse.user.user_name,
            signon_audit: response.signon_audit,
            signon_id,
          });
          // navigation.reset({index: 0, routes: [{name: 'Drawer'}]});
          // navigation.reset({index: 0, routes: [{name: 'Drawer'}]});
          toaster.show({message: 'Login Successfully', type: 'success'});
        }
      } else if (res === undefined || res === 401) {
        setIsModalShow(true);
        toaster.show({message: 'Something Went Wrong!', type: 'warning'});
        return;
      } else {
        signOut();
        toaster.show({message: 'Something Went Wrong!', type: 'warning'});
      }
    }
  };

  const CustomMarker = () => (
    <View style={styles.customMarkerContainer}>
      <View style={styles.borderTopLeft} />
      <View style={styles.borderTopRight} />
      <View style={styles.borderBottomLeft} />
      <View style={styles.borderBottomRight} />
    </View>
  );

  return (
    <ContainerNew
      header={
        <MainHeader style={{color: 'red'}} routeName="Scan_QR_for_Connection" />
      }>
      <QRCodeScanner
        containerStyle={styles.container}
        cameraStyle={styles.camera}
        onRead={({data}) => decode(data)}
        reactivate={true}
        reactivateTimeout={3000}
        showMarker={true}
        customMarker={<CustomMarker />}
        bottomContent={
          isVerifying ? <Text>Verifying Token .....</Text> : <Text></Text>
        }
      />
      <CustomInvalidModal
        isModalShow={isModalShow}
        setIsModalShow={setIsModalShow}
        showText="Unable to Login"
        invalidText="Something Went Wrong. Please try again"
      />
    </ContainerNew>
  );
});

export default ScanLoginQrCode;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  camera: {
    height: 785,
  },
  btn: {
    height: 54,
    paddingVertical: 0,
    justifyContent: 'center',
    backgroundColor: '#F8D8D9',
  },
  btnTxt: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 20,
    alignSelf: 'center',
    color: 'red',
  },

  customMarkerContainer: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    borderColor: '#0C5F20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  borderTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderColor: COLORS.primary,
  },
  borderTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderColor: COLORS.primary,
  },
  borderBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderColor: COLORS.primary,
  },
  borderBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderColor: COLORS.primary,
  },
});
