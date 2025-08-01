import {
  createDrawerNavigator,
  DrawerScreenProps,
} from '@react-navigation/drawer';
import {CompositeScreenProps} from '@react-navigation/native';
import React, {useContext} from 'react';
import {StyleSheet} from 'react-native';
import BottomTab from '../navigations/BottomTab';
import {RootStackScreensParms} from '~/types/navigationTs/RootStackScreenParams';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import 'react-native-gesture-handler';
import CustomDrawer from '../common/components/custom-drawer';
import ProfileScreen from '../modules/profile/ProfileScreen';
import NotificationDetails from '../modules/notification/NotificationDetails';
import NewMessage from '../modules/new-message/NewMessage';
import DraftsDetails from '../modules/drafts-details/DraftsDetailt';
import RecycleBinDetail from '../modules/notification/RecycleBinDetail';
import ReplyScreen from '../modules/reply/ReplyScree';
import ViewRequestsScreen from '../modules/view-requests/ViewRequestsScreen';
import RunARequestScreen from '../modules/run-a-request/RunARequestScreen';
import Alerts from '../modules/Alerts/Alerts';
import Login from '../auth/LoginScreen';
import Security from '../modules/security/Security';

export type DrawerScreensParams = {
  Alerts: undefined;
  Login: undefined;
  Security: undefined;
};

export type DrawerScreens = keyof DrawerScreensParams;

export type DrawerScreenProp<T extends DrawerScreens> = CompositeScreenProps<
  DrawerScreenProps<DrawerScreensParams, T>,
  NativeStackScreenProps<RootStackScreensParms>
>;

const {Navigator, Screen} = createDrawerNavigator<RootStackScreensParms>();

const Drawer = () => {
  return (
    <Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        lazy: true,
        drawerStyle: styles.drawer,
      }}>
      <Screen
        name="BottomTab"
        component={BottomTab}
        options={{title: 'Home', drawerIcon: () => 'home'}}
      />
      <Screen name="ProfileScreen" component={ProfileScreen} />
      <Screen name="NotificationDetails" component={NotificationDetails} />
      <Screen name="New_Message" component={NewMessage} />
      <Screen name="Drafts_Detail" component={DraftsDetails} />
      <Screen name="Recycle_Bin_Detail" component={RecycleBinDetail} />
      <Screen name="Reply" component={ReplyScreen} />
      <Screen name="View_Requests" component={ViewRequestsScreen} />
      <Screen name="Run_a_Request" component={RunARequestScreen} />
      <Screen name="Alerts" component={Alerts} />
      <Screen name="Login" component={Login} />
      <Screen name="Security" component={Security} />
    </Navigator>
  );
};

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
  },
});

export default Drawer;
