import {useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useRef, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
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
import {_todayDate} from '../../common/services/todayDate';
import CustomBottomSheetNew from '../../common/components/CustomBottomSheet';
import RBSheet from '../../common/packages/RBSheet/RBSheet';
import MainHeader from '../../common/components/MainHeader';
import SearchBar from '../../common/components/SearchBar';
import {convertDate} from '../../common/services/DateConverter';
import {api} from '../../common/api/api';
import {httpRequest} from '../../common/constant/httpRequest';
import {ProcgURL2} from '../../../App';
import CustomFlatListThree from '../../common/components/CustomFlatListThree';
import RenderItems from './RenderItems';
import {ActionItemsStoreSnapshotType} from '../../stores/actionItems';
import {observer} from 'mobx-react-lite';
import SelectStatusDropDown from '../../common/components/SelectStatusDropDown';

const edges: Edge[] = ['right', 'bottom', 'left'];

const ActionItemMainIndex = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const {userInfo, actionItems} = useRootStore();
  const [data, setData] = useState<ActionItemsStoreSnapshotType[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const height = useWindowDimensions().height;

  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const url = ProcgURL2;
  const [hasMore, setHasMore] = useState(0);
  const [selectedItem, setSelectedItem] = useState<
    ActionItemsStoreSnapshotType | undefined
  >(undefined);
  const [selectedStatusQuery, setSelectedStatusQuery] = useState('');

  const searchActionItems = async () => {
    setIsLoading(true);
    const api_params = {
      url: `${api.GetActionItems}/${userInfo?.user_id}/${currentPage}/${limit}?status=${selectedStatusQuery}&action_item_name=${searchQuery}`,
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
  };

  useAsyncEffect(
    async isMounted => {
      if (!isMounted()) {
        return null;
      }
      if (!searchQuery) {
        searchActionItems();
      } else {
        // Debounce only when query changes
        const delayDebounce = setTimeout(async () => {
          searchActionItems();
        }, 1000);

        return () => clearTimeout(delayDebounce);
      }
    },
    [
      isFocused,
      currentPage,
      actionItems.refreshing,
      actionItems.actionItems,
      selectedStatusQuery,
      searchQuery,
    ],
  );

  const handleRefresh = () => {
    actionItems.setRefreshing(true);
    setCurrentPage(1);
  };
  const allStatus = [
    {id: 0, title: 'All', value: 'All'},
    {id: 1, title: 'New', value: 'NEW'},
    {id: 2, title: 'In Progress', value: 'IN PROGRESS'},
    {id: 3, title: 'Completed', value: 'COMPLETED'},
  ];
  const handleSelectedStatus = (status: string) => {
    if (status.toLowerCase() === 'all') {
      setSelectedStatusQuery('');
    } else {
      setSelectedStatusQuery(status);
    }
  };

  const EmptyListItem = () => {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <CustomTextNew text={'No action items found'} txtColor={COLORS.black} />
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
      header={
        <MainHeader routeName="Action Items" style={{fontWeight: '700'}} />
      }>
      {/* searchbar and dropdown selection start */}
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <SearchBar
          placeholder="Search item"
          value={searchQuery}
          onChangeText={setSearchQuery}
          customStyle={{width: 180}}
        />
        <SelectStatusDropDown
          width={150}
          height={50}
          border={false}
          defaultValue={allStatus[0].title}
          data={allStatus}
          handleSelectedStatus={handleSelectedStatus}
        />
      </View>
      {/* items rendering start */}
      <CustomFlatListThree
        data={actionItems.actionItems}
        keyExtractor={(item: ActionItemsStoreSnapshotType) =>
          item.action_item_id
        }
        RenderItems={({item}: any) => (
          <RenderItems
            item={item}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            allStatus={allStatus}
          />
        )}
        emptyItem={
          !isLoading && actionItems.actionItems.length === 0
            ? EmptyListItem
            : null
        }
        isLoading={isLoading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        hasMore={hasMore}
        refreshing={actionItems.refreshing}
        onRefresh={handleRefresh}
      />
    </ContainerNew>
  );
};

export default observer(ActionItemMainIndex);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
    marginHorizontal: 10,
  },
  itemContainer: {
    backgroundColor: COLORS.white,
    // padding: 15,
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
