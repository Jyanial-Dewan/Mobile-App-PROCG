import {useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import {Edge} from 'react-native-safe-area-context';
import ContainerNew from '../../common/components/Container';
import CustomTextNew from '../../common/components/CustomText';
import useAsyncEffect from '../../common/packages/useAsyncEffect/useAsyncEffect';
import {useRootStore} from '../../stores/rootStore';
import {COLORS} from '../../common/constant/Themes';
import Column from '../../common/components/Column';
import CustomFlatList from '../../common/components/CustomFlatList';
import Row from '../../common/components/Row';
import {_todayDate, dateFormater} from '../../common/services/todayDate';
import CustomBottomSheetNew from '../../common/components/CustomBottomSheet';
import RBSheet from '../../common/packages/RBSheet/RBSheet';
import MainHeader from '../../common/components/MainHeader';
import SVGController from '../../common/components/SVGController';
import CustomButtonNew from '../../common/components/CustomButton';
import SearchBar from '../../common/components/SearchBar';
import {observer} from 'mobx-react-lite';
import {convertDate} from '../../common/services/DateConverter';
import ViewDetailsModal from '../../common/components/ViewDetailsModal';
import {api} from '../../common/api/api';
import {ProcgURL} from '../../../App';
import {httpRequest} from '../../common/constant/httpRequest';
import {AlertStoreSnapshotType} from '../../stores/alertsStore';
import RenderItems from './RenderItems';
import CustomFlatListThree from '../../common/components/CustomFlatListThree';
import {getSnapshot} from 'mobx-state-tree';
import ViewDetailsBottomSheet from '../../common/components/ViewDetailsBottomSheet';

const edges: Edge[] = ['right', 'bottom', 'left'];

const Alerts = () => {
  const isFocused = useIsFocused();
  const {userInfo, selectedUrl, alertsStore} = useRootStore();
  const refRBSheet = useRef<RBSheet>(null);
  const [search, setSearch] = useState('');
  const [noResult, setNoResult] = useState(false);
  const height = useWindowDimensions().height;
  const [isLoading, setIsLoading] = useState(false);
  const url = selectedUrl || ProcgURL;
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  // const [data, setData] = useState<AlertStoreSnapshotType[]>([]);
  const [hasMore, setHasMore] = useState(0);
  const [selectedItem, setSelectedItem] = useState<
    AlertStoreSnapshotType | undefined
  >(undefined);

  // const [viewDetailsModalVisible, setViewDetailsModalVisible] = useState({
  //   id: 0,
  //   visible: false,
  // });

  useAsyncEffect(
    async isMounted => {
      if (!isMounted()) {
        return null;
      }

      const api_params = {
        url: `${api.GetAlerts}?user_id=${userInfo?.user_id}&page=${currentPage}&limit=${limit}`,
        baseURL: url,
        // isConsole: true,
        // isConsoleParams: true,
      };
      const res = await httpRequest(api_params, setIsLoading);

      if (res) {
        if (currentPage === 1) {
          alertsStore.initialAlerts(res.result ?? []);
        } else {
          alertsStore.saveAlerts(res.result ?? []);
        }
        setHasMore(res.result.length ?? 0);
        // setData(res.result ?? []);

        alertsStore.setRefreshing(false);
      }
    },
    [
      isFocused,
      currentPage,
      alertsStore.refreshing,
      alertsStore.alerts.length,
      alertsStore.notificationAlerts.length,
    ],
  );

  // useEffect(() => {
  //   const searchActionItems = () => {
  //     const filteredItems = data.filter(item =>
  //       item.alert_name.toLowerCase().includes(search.toLowerCase()),
  //     );
  //     if (filteredItems.length) {
  //       setData(filteredItems);
  //     } else {
  //       setData([]);
  //       setNoResult(true);
  //     }
  //   };
  //   if (search.length) {
  //     searchActionItems();
  //   } else {
  //     setData(alertsStore.alerts.map(alert => getSnapshot(alert)));
  //   }
  // }, [search]);

  const handleRefresh = () => {
    alertsStore.setRefreshing(true);
    setCurrentPage(1);
  };
  const EmptyListItem = () => {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <CustomTextNew text={'No alerts found'} txtColor={COLORS.black} />
      </View>
    );
  };
  return (
    <ContainerNew
      edges={edges}
      isScrollView={false}
      // isFloatBottomButton
      // singleFloatBtmBtnPress={() => handleOpenSheet()}
      style={styles.container}
      backgroundColor={COLORS.lightBackground}
      header={<MainHeader routeName="Alerts" style={{fontWeight: '700'}} />}>
      {/* <SearchBar placeholder="Search" value={search} onChangeText={setSearch} /> */}
      <CustomFlatListThree
        data={alertsStore.alerts}
        keyExtractor={(item: AlertStoreSnapshotType) => item.alert_id}
        RenderItems={({item}: any) => (
          <RenderItems
            url={url}
            item={item}
            refSheet={refRBSheet}
            setSelectedItem={setSelectedItem}
          />
        )}
        emptyItem={
          !isLoading && alertsStore.alerts.length === 0 ? EmptyListItem : null
        }
        isLoading={isLoading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        hasMore={hasMore}
        refreshing={alertsStore.refreshing}
        onRefresh={handleRefresh}
      />

      {/* Bottom Sheet View details*/}
      <ViewDetailsBottomSheet
        refRBSheetViewDetails={refRBSheet}
        title={selectedItem?.alert_name!}
        dateAndTime={selectedItem?.last_update_date}
        description={selectedItem?.description!}
        setSelectedItem={setSelectedItem}
      />
    </ContainerNew>
  );
};

export default observer(Alerts);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
    marginHorizontal: 10,
  },
});
