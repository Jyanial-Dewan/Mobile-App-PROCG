import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import ContainerNew from '../../common/components/Container';
import MainHeader from '../../common/components/MainHeader';
import {Edge} from 'react-native-safe-area-context';
import useAsyncEffect from '../../common/packages/useAsyncEffect/useAsyncEffect';
import {api} from '../../common/api/api';
import {ProcgURL} from '../../../App';
import {useRootStore} from '../../stores/rootStore';
import {httpRequest} from '../../common/constant/httpRequest';
import {DeviceInfoStoreType} from '../../stores/deviceInfo';
import {COLORS} from '../../common/constant/Index';
import CustomFlatList from '../../common/components/CustomFlatList';

const Security = () => {
  const edges: Edge[] = ['right', 'bottom', 'left'];
  // const {userInfo, deviceInfoData} = useRootStore();
  // const [linkedDevices, setLinkedDevices] = useState<DeviceInfoStoreType[]>([]);
  // const [isLoading, setIsLoading] = useState(false);
  // console.log(deviceInfoData, 'deviceInfoData in Security');
  // useAsyncEffect(
  //   async isMounted => {
  //     if (!isMounted()) {
  //       return null;
  //     }
  //     const api_devices = {
  //       url: api.getDevices + `/${userInfo?.user_id}`,
  //       baseURL: ProcgURL,
  //       isConsole: true,
  //       isConsoleParams: true,
  //     };
  //     const response = await httpRequest(api_devices, setIsLoading);
  //     if (response) {
  //       setLinkedDevices(response);
  //     }
  //   },
  //   [userInfo?.user_id],
  // );
  // console.log(JSON.stringify(linkedDevices), 'linkedDevices');
  // const renderItem = ({item}: {item: DeviceInfoStoreType}) => {
  //   return (
  //     <View style={{gap: 8, marginBottom: 16}}>
  //       <Text style={{color: COLORS.darkGray}}>
  //         Ip: {item.ip_address || 'Unknown'}
  //       </Text>
  //       <Text style={{color: COLORS.darkGray}}>
  //         Device Type: {item.device_type || 'Unknown'}
  //       </Text>
  //       <Text style={{color: COLORS.darkGray}}>
  //         Location: {item.location || 'Unknown'}
  //       </Text>
  //       <Text style={{color: COLORS.darkGray}}>
  //         Browser: {item.browser_name || 'Unknown'}
  //       </Text>
  //       <Switch
  //         trackColor={{false: '#ffffffff', true: '#000000ff'}}
  //         // thumbColor={item.is_active === 1 ? '#f5dd4b' : '#f4f3f4'}
  //         ios_backgroundColor="#3e3e3e"
  //         // onValueChange={toggleSwitch}
  //         value={item.is_active === 1}
  //       />
  //       <CustomFlatList
  //         data={item.signon_audit || []}
  //         RenderItems={({item}: any) => (
  //           <View style={styles.row}>
  //             <Text style={{color: COLORS.darkGray}}>
  //               Login: {item.login.toLocaleString()}:
  //             </Text>
  //             <Text style={{color: COLORS.darkGray}}>
  //               Logout: {item.logout.toLocaleString() || 'Null'}
  //             </Text>
  //           </View>
  //         )}
  //       />
  //     </View>
  //   );
  // };
  return (
    <ContainerNew
      edges={edges}
      header={<MainHeader routeName="Security" style={{fontWeight: '700'}} />}
      style={styles.container}>
      <ScrollView
      // contentContainerStyle={ }
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: COLORS.darkGray,
            marginBottom: 16,
          }}>
          Security Screen
        </Text>
        {/* <CustomFlatList
          key={linkedDevices.length}
          data={linkedDevices}
          RenderItems={renderItem}
        /> */}
      </ScrollView>
    </ContainerNew>
  );
};

export default Security;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    padding: 16,
  },
  row: {
    padding: 8,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    gap: 8,
    marginVertical: 5,
  },
});
