import {useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
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
import SVGController from '../../common/components/SVGController';
import CustomButtonNew from '../../common/components/CustomButton';
import SearchBar from '../../common/components/SearchBar';
import {convertDate} from '../../common/services/DateConverter';

const edges: Edge[] = ['right', 'bottom', 'left'];
interface ActionItemsType {
  id: number;
  title: string;
  time: string;
  subject: string;
  description: string;
}
const actionItemsData = [
  {
    id: 1,
    title: 'Action Item Title 1',
    time: '2025-07-16 04:43:06.245',
    subject: 'lorem ipsum dolor',
    description:
      'lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    icon: 'Circle-Check-Big',
    status: 'Completed',
  },
  {
    id: 2,
    title: 'Action Item Title 2',
    time: '2025-03-24 04:46:01.327',
    subject: 'lorem ipsum dolor',
    description:
      'lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    icon: 'Circle-Check',
    status: 'In Progress',
  },
  {
    id: 3,
    title: 'Action Item Title 3',
    time: '2025-07-04 10:05:13.657526',
    subject: 'lorem ipsum dolor',
    description:
      'lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    icon: 'Circle',
    status: 'New',
  },
];
const ActionItemMainIndex = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const {userInfo} = useRootStore();
  const refRBSheet = useRef<RBSheet>(null);
  const [data, setData] = useState<ActionItemsType[]>([]);
  const [search, setSearch] = useState('');
  const [noResult, setNoResult] = useState(false);
  const height = useWindowDimensions().height;
  useAsyncEffect(
    async isMounted => {
      if (!isMounted()) {
        return null;
      }
      //api call here
      setData(actionItemsData);
      console.log(userInfo);
    },
    [isFocused],
  );
  const handleProfilePress = () => {
    navigation.navigate('ProfileScreen');
  };

  const handleOpenSheet = () => {
    refRBSheet.current?.open();
  };

  const renderItem = ({item}: any) => (
    <View style={styles.itemContainer}>
      <Row justify="space-between" align="center">
        <Row rowWidth="90%" align="center" rowStyle={{marginBottom: 5, gap: 5}}>
          <View style={styles.iconContainer}>
            <SVGController name={item.icon} color={COLORS.white} />
          </View>

          <Column>
            <Row align="center" justify="space-between">
              <CustomTextNew
                text={item.title}
                // txtColor={COLORS.black}
                style={{fontSize: 15, fontWeight: 'bold', color: COLORS.black}}
              />
              <View
                style={{
                  backgroundColor:
                    item.status === 'Completed'
                      ? COLORS.badgeGreen
                      : item.status === 'In Progress'
                        ? COLORS.badgeYellow
                        : COLORS.badgeBlue,
                  padding: 5,
                  borderRadius: 5,
                  width: 90,
                  alignItems: 'center',
                }}>
                <CustomTextNew text={item.status} txtColor={COLORS.white} />
              </View>
            </Row>
            <CustomTextNew
              text={convertDate(item.time)}
              style={{color: COLORS.textNewBold}}
            />
          </Column>
        </Row>
      </Row>
      <Column colStyle={styles.colStyle}>
        <CustomTextNew
          text={`${item.description.slice(0, 180)} ${item.description.length > 100 ? '...' : ''}`}
          txtColor={COLORS.textColor}
          txtSize={12}
        />
      </Column>
      {/* Button here */}
      <Row justify="space-between">
        <CustomButtonNew
          disabled={false}
          btnText={'Item 1'}
          // isLoading={false}
          // onBtnPress={handleOpenSheet}
          btnstyle={styles.btn}
        />
        <CustomButtonNew
          disabled={false}
          btnText={'Item 2'}
          // isLoading={false}
          // onBtnPress={handleOpenSheet}
          btnstyle={styles.btn}
        />
      </Row>
    </View>
  );

  useEffect(() => {
    const searchActionItems = () => {
      const filteredItems = data.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()),
      );
      if (filteredItems.length) {
        setData(filteredItems);
      } else {
        setData([]);
        setNoResult(true);
      }
    };
    if (search) {
      searchActionItems();
    } else {
      setData(actionItemsData);
    }
  }, [search]);

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
      <SearchBar
        placeholder="Search item"
        value={search}
        onChangeText={setSearch}
      />
      <CustomFlatList
        data={data}
        RenderItems={renderItem}
        // isLoading={isLoading}
        // currentPage={currentPage}
        // setCurrentPage={setCurrentPage}
        // hasMore={hasMore}
        // contentContainerStyle={
        //   messageStore.sentMessages.length === 0 ? styles.flexGrow : null
        // }
        emptyItem={() => {
          return (
            <View>
              <Text>No Result Found.</Text>
            </View>
          );
        }}
        // refreshing={messageStore.refreshing}
        // onRefresh={handleRefresh}
      />

      {/* Bottom Sheet */}
      {/* <CustomBottomSheetNew refRBSheet={refRBSheet} sheetHeight={400}>
        <CustomFlatList
          contentContainerStyle={{
            paddingBottom: 150,
          }}
          data={[1, 2, 3]}
          RenderItems={renderItem}
        />
      </CustomBottomSheetNew> */}
    </ContainerNew>
  );
};

export default ActionItemMainIndex;

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
    marginBottom: 10,
    // elevation: 1,
  },
  iconContainer: {
    backgroundColor: COLORS.primary,
    padding: 5,
    borderRadius: 50,
  },
  colStyle: {
    borderBottomColor: COLORS.borderBottom,
    borderBottomWidth: 2,
    marginBottom: 10,
    paddingVertical: 5,
  },
  headText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: COLORS.textNewColor,
  },
  cardTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: COLORS.textNewColor,
    paddingVertical: 2,
  },
  stsTxt: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16,
    color: COLORS.green,
  },
  cardSubTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: COLORS.textNewColor,
    paddingVertical: 2,
  },
  btn: {
    width: '45%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.newGray,
  },
});
