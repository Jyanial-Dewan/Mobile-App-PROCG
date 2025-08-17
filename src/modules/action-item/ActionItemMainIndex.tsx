import {useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import {Edge} from 'react-native-safe-area-context';
import ContainerNew from '../../common/components/Container';
import CustomHeader from '../../common/components/CustomHeader';
import CustomTextNew from '../../common/components/CustomText';
import useAsyncEffect from '../../common/packages/useAsyncEffect/useAsyncEffect';
import {useRootStore} from '../../stores/rootStore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS} from '../../common/constant/Themes';
import Column from '../../common/components/Column';
import CustomFlatList from '../../common/components/CustomFlatList';
import Row from '../../common/components/Row';
import {_todayDate, dateFormater} from '../../common/services/todayDate';
import CustomBottomSheetNew from '../../common/components/CustomBottomSheet';
import RBSheet from '../../common/packages/RBSheet/RBSheet';
import MainHeader from '../../common/components/MainHeader';
import CustomButtonNew from '../../common/components/CustomButton';
import SearchBar from '../../common/components/SearchBar';
import {convertDate} from '../../common/services/DateConverter';
import ViewDetailsModal from '../../common/components/ViewDetailsModal';
import {api} from '../../common/api/api';
import {httpRequest} from '../../common/constant/httpRequest';
import {ProcgURL2} from '../../../App';
import CustomFlatListThree from '../../common/components/CustomFlatListThree';
import RenderItems from './RenderItems';
import {ActionItemsStoreSnapshotType} from '../../stores/actionItems';
import {observer} from 'mobx-react-lite';
import SelectStatusDropDown from './SelectStatusDropDown';

const edges: Edge[] = ['right', 'bottom', 'left'];

const ActionItemMainIndex = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const {userInfo, actionItems} = useRootStore();
  const refRBSheet = useRef<RBSheet>(null);
  const [data, setData] = useState<ActionItemsStoreSnapshotType[]>([]);
  const [search, setSearch] = useState('');
  const [noResult, setNoResult] = useState(false);
  const height = useWindowDimensions().height;
  // const [viewDetailsModalVisible, setViewDetailsModalVisible] = useState({
  //   id: 0,
  //   visible: false,
  // });
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const url = ProcgURL2;
  const [hasMore, setHasMore] = useState(0);
  const [selectedItem, setSelectedItem] = useState<
    ActionItemsStoreSnapshotType | undefined
  >(undefined);
  const [selectedStatusQuery, setSelectedStatusQuery] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');

  useAsyncEffect(
    async isMounted => {
      if (!isMounted()) {
        return null;
      }
      //api call here
      setIsLoading(true);
      const api_params = {
        url: `${api.GetActionItems}/${userInfo?.user_id}/${currentPage}/${limit}?status=${selectedStatusQuery}`,
        baseURL: url,
        access_token: userInfo?.access_token,
        // isConsole: true,
        // isConsoleParams: true,
      };
      const res = await httpRequest(api_params, setIsLoading);

      if (res) {
        setHasMore(res.items.length);
        setData(res.items);
        actionItems.saveActionItems(res.items);
        actionItems.setRefreshing(false);
      }
    },
    [
      isFocused,
      currentPage,
      actionItems.refreshing,
      actionItems.actionItems,
      selectedStatusQuery,
    ],
  );

  // useEffect(() => {
  //   const searchActionItems = () => {
  //     const filteredItems = actionItems.actionItems.filter(item =>
  //       item.action_item_name.toLowerCase().includes(search.toLowerCase()),
  //     );
  //     if (filteredItems.length) {
  //       setData(filteredItems);
  //     } else {
  //       setData([]);
  //       setNoResult(true);
  //     }
  //   };
  //   if (search) {
  //     searchActionItems();
  //   } else {
  //     setData(actionItems.actionItems);
  //   }
  // }, [search]);

  const handleRefresh = () => {
    actionItems.setRefreshing(true);
    setCurrentPage(1);
  };
  const allStatus = [
    {title: 'All'},
    {title: 'New'},
    {title: 'In Progress'},
    {title: 'Completed'},
  ];
  const handleSelectedStatus = (status: string) => {
    if (status === 'All') {
      setSelectedStatusQuery('');
    } else {
      setSelectedStatusQuery(status);
    }
  };

  return (
    <ContainerNew
      edges={edges}
      isScrollView={false}
      // isFloatBottomButton
      // singleFloatBtmBtnPress={() => handleOpenSheet()}
      style={styles.container}
      backgroundColor={COLORS.lightBackground}
      header={
        <MainHeader routeName="Action Items" style={{fontWeight: '700'}} />
      }>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <SearchBar
          placeholder="Search item"
          value={search}
          onChangeText={setSearch}
          customStyle={{width: 180}}
        />
        <SelectStatusDropDown
          defaultValue="All"
          data={allStatus}
          handleSelectedStatus={handleSelectedStatus}
        />
      </View>
      <CustomFlatListThree
        data={actionItems.actionItems}
        keyExtractor={(item: ActionItemsStoreSnapshotType) =>
          item.action_item_id
        }
        RenderItems={({item}: any) => (
          <RenderItems
            item={item}
            refSheet={refRBSheet}
            setSelectedItem={setSelectedItem}
            setIsLoading={setIsLoading}
          />
        )}
        emptyItem={() => {
          return (
            <CustomTextNew
              style={{
                textAlign: 'center',
                marginTop: height / 3,
              }}
              text="No data found"
            />
          );
        }}
        isLoading={isLoading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        hasMore={hasMore}
        refreshing={actionItems.refreshing}
        onRefresh={handleRefresh}
      />

      {/* Bottom Sheet */}
      <CustomBottomSheetNew
        refRBSheet={refRBSheet}
        sheetHeight={600}
        onClose={() => setSelectedItem(undefined)}>
        {selectedItem && (
          <ScrollView style={styles.itemContainer}>
            <CustomTextNew
              text={selectedItem.action_item_name}
              style={{
                fontSize: 15,
                fontWeight: 'bold',
                color: COLORS.black,
                marginTop: 5,
              }}
            />
            <CustomTextNew
              text={convertDate(selectedItem.last_update_date as any)}
              style={{
                fontSize: 15,
                fontWeight: 'bold',
                color: COLORS.black,
                marginTop: 5,
              }}
            />
            <Column colStyle={styles.colStyle}>
              <CustomTextNew
                text={selectedItem.description}
                txtColor={COLORS.blackish}
                txtSize={14}
              />
            </Column>
          </ScrollView>
        )}
      </CustomBottomSheetNew>
    </ContainerNew>
  );
};

export default observer(ActionItemMainIndex);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
    marginHorizontal: 20,
  },
  itemContainer: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 15,
    paddingVertical: 10,
    marginBottom: 20,
    // elevation: 1,
  },
  colStyle: {
    // borderBottomColor: COLORS.borderBottom,
    // borderBottomWidth: 2,
    marginBottom: 10,
    paddingVertical: 5,
  },
});
