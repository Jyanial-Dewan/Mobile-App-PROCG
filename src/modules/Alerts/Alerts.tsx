import {useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
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
    title: 'Error Alert',
    time: '2025-07-04 10:05:13.657526',
    subject: 'lorem ipsum dolor',
    description:
      'An error alert is shown when something goes wrong in the application, usually due to incorrect user input, failed network requests, or unexpected server errors. It’s essential that error alerts are clear, concise, and specific about what went wrong, providing helpful information for the user to resolve the issue, such as which field is invalid or what action they can take next.',
    icon: 'Alert-Low',
    status: 'High',
  },
  {
    id: 2,
    title: 'Success Alert',
    time: '2025-03-24 04:46:01.327',
    subject: 'lorem ipsum dolor',
    description:
      'A success alert indicates that an operation was completed successfully. This is often used after a user has completed a task, such as saving changes, submitting a form, or successfully processing a payment. Success alerts should be positive, reassuring, and can often include a summary of what was accomplished (e.g., "Your profile has been updated").',
    icon: 'Alert-Low',
    status: 'Normal',
  },
  {
    id: 3,
    title: 'Warning Alert',
    time: '2025-07-16 04:43:06.245',
    subject: 'lorem ipsum dolor',
    description:
      'A warning alert is used to inform users about a potential issue or action that they should be cautious about. It does not necessarily indicate that something has failed, but rather that the user should be aware of a condition that may require attention or could cause problems if ignored. Warning alerts typically use neutral or amber colors (like yellow or orange) to convey the need for awareness.',
    icon: 'Alert-Low',
    status: 'Low',
  },
];

/*************  ✨ Windsurf Command 🌟  *************/
const Alerts = () => {
  const isFocused = useIsFocused();
  const {userInfo} = useRootStore();
  const navigation = useNavigation();
  const refRBSheet = useRef<RBSheet>(null);
  const [data, setData] = useState<ActionItemsType[]>([]);
  const [search, setSearch] = useState('');
  const [noResult, setNoResult] = useState(false);
  const height = useWindowDimensions().height;
  const [viewDetailsModalVisible, setViewDetailsModalVisible] = useState({
    id: 0,
    visible: false,
  });
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

  const renderItem = ({item}: any) => (
    <View style={styles.itemContainer}>
      <Row justify="space-between" rowStyle={{gap: 10}}>
        <View
          style={{
            padding: 5,
            borderRadius: 50,
            backgroundColor: COLORS.iconBGREDColor,
            alignSelf: 'flex-start',
          }}>
          <SVGController name={item.icon} color={COLORS.white} />
        </View>
        <Column colWidth="90%">
          <Row justify="space-between" align="center">
            <Row align="center" justify="space-between">
              <CustomTextNew
                text={item.title}
                style={{
                  fontSize: 15,
                  fontWeight: 'bold',
                  color: COLORS.black,
                  marginTop: 5,
                }}
              />
              <CustomTextNew
                text={convertDate(item.time)}
                txtColor={COLORS.textNewBold}
              />
            </Row>
          </Row>
          <Column colStyle={styles.colStyle}>
            <CustomTextNew
              text={`${item.description.slice(0, 180)} ${item.description.length > 180 ? '...' : ''}`}
              txtColor={COLORS.blackish}
              txtSize={14}
            />
            <TouchableOpacity
              onPress={() => {
                setViewDetailsModalVisible({id: item.id, visible: true});
              }}>
              <CustomTextNew
                text="View Details"
                txtSize={12}
                style={[styles.linkText, {marginTop: 5}]}
              />
            </TouchableOpacity>
          </Column>
          {/* View Details Modal */}
          <ViewDetailsModal
            data={item.description}
            isVisible={
              viewDetailsModalVisible.id === item.id &&
              viewDetailsModalVisible.visible
            }
            setIsVisible={setViewDetailsModalVisible}
          />
          {/* End View Details Modal */}
          {/* Button here */}
          <Row justify="flex-start">
            <CustomButtonNew
              disabled={false}
              btnText={'Button'}
              // isLoading={false}
              // onBtnPress={handleOpenSheet}
              btnstyle={styles.btn}
            />
          </Row>
        </Column>
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
      header={<MainHeader routeName="Alerts" style={{fontWeight: '700'}} />}>
      <SearchBar placeholder="Search" value={search} onChangeText={setSearch} />
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
        // emptyItem={() => {
        //   return (
        //     <View>
        //       <Text>No Result Found.</Text>
        //     </View>
        //   );
        // }}
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

export default observer(Alerts);

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
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.4,
    // shadowRadius: 3.84,
    // elevation: 1,
  },
  iconContainer: {
    backgroundColor: COLORS.primary,
    padding: 5,
    borderRadius: 50,
  },
  colStyle: {
    // borderBottomColor: COLORS.borderBottom,
    // borderBottomWidth: 2,
    marginBottom: 5,
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
  linkText: {
    color: COLORS.iconBGREDColor,
    fontSize: 15,
    fontWeight: 'bold',
  },
  cardSubTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: COLORS.textNewColor,
    paddingVertical: 2,
  },
  btn: {
    width: '35%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.newGray,
  },
});
