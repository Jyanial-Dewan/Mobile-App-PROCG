import React, {useEffect, useState} from 'react';
import {
  Button,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ContainerNew from '../common/components/Container';
import MainHeader from '../common/components/MainHeader';
import CustomInputNew from '../common/components/CustomInput';
import {useForm} from 'react-hook-form';
import CustomButtonNew from '../common/components/CustomButton';
import {httpRequest} from '../common/constant/httpRequest';
import {api} from '../common/api/api';
import {ProcgURL, ProcgURL2} from '../../App';
import {useRootStore} from '../stores/rootStore';
import {useToast} from '../common/components/CustomToast';
import {clearAllStorage} from '../common/services/clearStorage';
import CustomInvalidModal from '../common/components/CustomInvalidModal';
import {v4 as uuidv4} from 'uuid';
import {useNavigation} from '@react-navigation/native';
import {observer} from 'mobx-react-lite';
import {RootStackScreenProps} from '~/navigations/RootStack';
import RoundedButton from '../common/components/RoundedButton';
import SVGController from '../common/components/SVGController';
interface ILoginResponse {
  access_token: string;
  refresh_token: string;
  user_id: number;
  isLoggedIn: boolean;
  message: string;
}

const MFALoginScreen = ({navigation}: RootStackScreenProps<'MFALogin'>) => {
  const signon_id = uuidv4();
  const {
    mfaStore,
    userInfoSave,
    deviceInfoData,
    deviceInfoSave,
    selectedUrl,
    fcmTokenSave,
  } = useRootStore();
  const toaster = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalShow, setIsModalShow] = useState(false);

  const {control, handleSubmit, setValue, reset, getValues} = useForm({
    defaultValues: {mfa_code: ''},
  });

  const handleSetTokenData = async (res: ILoginResponse) => {
    if (res.access_token) {
      const combined_user = {
        url: `${api.Users}?user_id=${res.user_id}`,
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

      const response = await httpRequest(deviceInfoApi_params, setIsLoading);
      if (response.id) {
        // response is - id , user_id, device_type, browser_name, browser_version, os, user_agent, added_at, is_active , ip_address,  location, user_name, signon_audit, signon_id,
        deviceInfoSave(response);
        userInfoSave({...res, ...userResponse.result});
        toaster.show({message: 'Login Successfully', type: 'success'});
      }
    } else if (
      res === undefined ||
      (typeof res === 'object' && 'status' in res && res.status === 401)
    ) {
      setIsModalShow(true);
      toaster.show({message: (res as any)?.message, type: 'warning'});
      return;
    } else {
      reset();
      await clearAllStorage();
      toaster.show({message: (res as any)?.message, type: 'warning'});
    }
  };

  const onSubmit = async (data: any) => {
    const response = await httpRequest(
      {
        url: `${api.AuthAppsLogin}/verify-mfa-login`,
        method: 'POST',
        data: {
          otp: Number(data.mfa_code),
          mfa_id: mfaStore?.mfaResponse?.mfa_methods[0].mfa_id,
          mfa_token: mfaStore?.mfaResponse?.mfa_token,
        },
        baseURL: ProcgURL,
        // isConsole: true,
        // isConsoleParams: true,
      },
      setIsLoading,
    );

    if (response.access_token) {
      handleSetTokenData(response);
    } else {
      toaster.show({
        message:
          response?.message || 'MFA verification failed. Please try again.',
        type: 'warning',
      });
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('MFA screen mounted - 5 minutes passed');
      navigation.navigate('Login'); // navigate back to login after timeout
    }, 500000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);
  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    }
    Keyboard.dismiss();
  };
  return (
    <ContainerNew
      edges={['top', 'left', 'right']}
      style={styles.container}
      isScrollView={false}
      // header={<MainHeader routeName="MFA Verification" />}
    >
      <View style={styles.content}>
        <View style={{position: 'absolute', top: 10, left: 10, zIndex: 1}}>
          <RoundedButton
            onPress={goBack}
            child={<SVGController name="Arrow-Left" color="#41596B" />}
          />
        </View>
        <Text style={styles.title}>MFA Verification</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code from your authenticator app
        </Text>
        <View style={styles.codeInputContainer}>
          <CustomInputNew
            setValue={setValue}
            control={control}
            name="mfa_code"
            label="Enter 6-digit MFA code"
            rules={{
              required: 'MFA code is required',
              minLength: {
                value: 6,
                message: 'MFA code must be exactly 6 digits',
              },
              maxLength: {
                value: 6,
                message: 'MFA code must be exactly 6 digits',
              },
            }}
          />

          <View style={{marginTop: 10, alignItems: 'flex-end'}}>
            <Text
              style={{
                color: '#666',
                fontSize: 14,
                textDecorationLine: 'underline',
              }}>
              Try another way
            </Text>
          </View>

          <CustomButtonNew
            disabled={isLoading}
            btnText="Verify"
            isLoading={isLoading}
            onBtnPress={handleSubmit(onSubmit)}
            btnstyle={styles.btn}
            btnTextStyle={styles.btnTxt}
          />
        </View>
      </View>
      <CustomInvalidModal
        isModalShow={isModalShow}
        setIsModalShow={setIsModalShow}
        showText="Unable to Login"
        invalidText="Something Went Wrong. Please try again"
      />
    </ContainerNew>
  );
};

export default observer(MFALoginScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  content: {
    // width: '80%',
    paddingVertical: 30,
    paddingHorizontal: 25,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'white',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    color: 'black',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'black',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  codeInputContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  btn: {
    borderRadius: 100,
    justifyContent: 'center',
    paddingVertical: 9,
  },
  btnTxt: {
    fontSize: 14,
    fontWeight: '500',
    alignSelf: 'center',
  },
});
