import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import React from 'react';
import Loader from '../auth/Loader';
import {RootStackScreensParms} from '../types/navigationTs/RootStackScreenParams';
import ScanLoginQrCode from '../modules/scan-login-qr-code/ScanLoginQrCode';
import ChooseConnection from '../modules/connection/ChooseConnection';
import AddConnection from '../modules/connection/AddConnection';
import ScanQrConnection from '../modules/connection/ScanQrConnection';
import ScanProfiles from '../modules/scan-profiles/ScanProfiles';
import SelectProfile from '../modules/select-profile/SelectProfile';
import SettingsScreen from '../modules/settings/SettingsScreen';
import Drawer from './drawer';
import Login from '../auth/LoginScreen';
import ForgotPassword from '../modules/forgot-password/ForgotPassword';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackScreensParms {}
  }
}
export type RootStackScreens = keyof RootStackScreensParms;

export type RootStackScreenProps<T extends RootStackScreens> =
  NativeStackScreenProps<RootStackScreensParms, T>;

const {Navigator, Screen} = createNativeStackNavigator<RootStackScreensParms>();

const RootStack = () => {
  return (
    <Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Screen name="Loader" component={Loader} initialParams={{delay: 15}} />
      <Screen name="Drawer" component={Drawer} />
      <Screen name="Login" component={Login} />
      <Screen name="ScanLoginQrCode" component={ScanLoginQrCode} />
      <Screen name="ChooseConnection" component={ChooseConnection} />
      <Screen name="AddConnection" component={AddConnection} />
      <Screen name="ScanQrConnection" component={ScanQrConnection} />
      <Screen name="ScanProfiles" component={ScanProfiles} />
      <Screen name="Profiles" component={SelectProfile} />
      <Screen name="Settings" component={SettingsScreen} />
      <Screen name="ForgotPassword" component={ForgotPassword} />
    </Navigator>
  );
};

export default RootStack;
