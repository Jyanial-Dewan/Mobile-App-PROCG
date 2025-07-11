import {
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import ContainerNew from '../../common/components/Container';
import {ProcgURL} from '../../../App';
import MainHeader from '../../common/components/MainHeader';
import {COLORS} from '../../common/constant/Themes';
import CustomTextNew from '../../common/components/CustomText';
import Row from '../../common/components/Row';
import {useRootStore} from '../../stores/rootStore';
import {observer} from 'mobx-react-lite';
import CustomFlatListTwo from '../../common/components/CustomFlatListTwo';
import {TextInput} from 'react-native-paper';
import SVGController from '../../common/components/SVGController';
import CustomBottomSheetNew from '../../common/components/CustomBottomSheet';
import RBSheet from '../../common/packages/RBSheet/RBSheet';
import {useIsFocused} from '@react-navigation/native';
import useAsyncEffect from '../../common/packages/useAsyncEffect/useAsyncEffect';
import {api} from '../../common/api/api';
import {httpRequest} from '../../common/constant/httpRequest';
import axios from 'axios';
import {convertDate} from '../../common/services/DateConverter';
import Column from '../../common/components/Column';

interface IViewRequest {
  request_id: number;
  parameters: any;
  result: any;
}

const RenderViewRequestItem = ({
  item,
  setSelectedItem,
  refSheet,
  isSelected,
}: any) => {
  const timeString = item.timestamp;
  const date = new Date(timeString);
  // Open Bottom Sheet
  const onOpenSheet = (item: any) => {
    refSheet.current?.open();
    setSelectedItem(item);
  };

  return (
    <TouchableOpacity
      onPress={() => onOpenSheet(item)}
      activeOpacity={1}
      style={[
        styles.container,
        {
          backgroundColor: isSelected ? COLORS.grayBgColor : COLORS.white,
        },
      ]}>
      {/* Text Section */}
      <Row justify="space-between" align="center">
        <CustomTextNew
          txtStyle={styles.requestIdText}
          text={`Request ID - ${item.request_id}`}
        />
        {item.status === 'SUCCESS' ? (
          <CustomTextNew txtStyle={styles.successText} text={item.status} />
        ) : (
          <CustomTextNew txtStyle={styles.unsuccessText} text={item.status} />
        )}
      </Row>
      <View
        style={[
          styles.itemListWrapper,
          {borderColor: isSelected ? COLORS.white : '#E4E9F2'},
        ]}
      />
      <Row>
        <CustomTextNew
          txtColor={COLORS.inputTextColor}
          txtSize={14}
          txtWeight={400}
          text={'User Task Name'}
        />
        <CustomTextNew padLeft={5} text={'-'} />
        <CustomTextNew
          txtColor={COLORS.inputTextColor}
          txtSize={14}
          txtWeight={300}
          padLeft={5}
          text={item.user_task_name}
        />
      </Row>
      <Row>
        <CustomTextNew
          txtColor={COLORS.inputTextColor}
          txtSize={14}
          txtWeight={400}
          text={'User schedule Name'}
        />
        <CustomTextNew padLeft={5} text={'-'} />
        <CustomTextNew
          txtStyle={{
            flex: 1,
            flexWrap: 'wrap',
            color: COLORS.inputTextColor,
            fontSize: 14,
            fontWeight: '300',
            paddingLeft: 5,
          }}
          text={item.user_schedule_name}
        />
      </Row>
      <Row>
        <CustomTextNew
          txtColor={COLORS.inputTextColor}
          txtSize={14}
          txtWeight={400}
          text={'Timestamp'}
        />
        <CustomTextNew padLeft={5} text={'-'} />
        <CustomTextNew
          txtColor={COLORS.inputTextColor}
          txtSize={14}
          txtWeight={300}
          padLeft={5}
          text={`${date.toDateString()}, ${date.toLocaleTimeString()}`}
        />
      </Row>
    </TouchableOpacity>
  );
};

const ViewRequestsScreen = observer(() => {
  const {viewRequestStore, selectedUrl, userInfo} = useRootStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<IViewRequest>();
  const [isRefrshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isFocused = useIsFocused();
  const limit = 20;

  axios.defaults.headers.common['Authorization'] =
    `Bearer ${userInfo?.access_token}`;

  const url = selectedUrl || ProcgURL;

  const refSheet = useRef<RBSheet>(null);

  const [text, setText] = useState('');

  useEffect(() => {
    if (isFocused) {
      viewRequestStore.getRequests(currentPage, limit, url);
    }
  }, [isFocused, currentPage]);

  const onRefresh = useCallback(async () => {
    setCurrentPage(1);
    setIsRefreshing(true);
    await viewRequestStore.getRequests(currentPage, limit, url);
    setIsRefreshing(false);
  }, []);

  const renderViewRequestItem = useCallback(
    ({item}: any) => (
      <RenderViewRequestItem
        item={item}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        refSheet={refSheet}
        isSelected={selectedItem?.request_id === item.request_id}
      />
    ),
    [selectedItem],
  );

  console.log(JSON.stringify(selectedItem), 'selectedItem');

  return (
    <ContainerNew
      isScrollView={false}
      backgroundColor={COLORS.lightBackground}
      header={<MainHeader routeName="View_Requests" />}>
      {/* <View style={{position: 'relative', marginHorizontal: 20}}>
        <TextInput
          style={styles.searchInput}
          outlineStyle={{borderWidth: 0}}
          mode="outlined"
          textColor={COLORS.black}
          placeholder="Search by User Task"
          placeholderTextColor="#9CA3AF"
          value={text}
          onChangeText={text => setText(text)}
        />
        <View style={{position: 'absolute', top: 15, left: 16}}>
          <SVGController name="SEARCH" />
        </View>
      </View> */}

      <CustomFlatListTwo
        data={viewRequestStore.requests}
        isLoading={viewRequestStore.loading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        RenderItems={renderViewRequestItem}
        onRefresh={
          <RefreshControl refreshing={isRefrshing} onRefresh={onRefresh} />
        }
      />
      {/* Bottom Sheet */}
      <CustomBottomSheetNew
        refRBSheet={refSheet}
        sheetHeight={300}
        onClose={() => setSelectedItem(undefined)}>
        <Row justify="center">
          <CustomTextNew
            text={'Request ID -'}
            txtColor={COLORS.textNewColor}
            txtSize={16}
            txtWeight={700}
            padBottom={10}
          />
          <CustomTextNew
            text={selectedItem?.request_id}
            txtColor={COLORS.textNewColor}
            txtSize={16}
            txtWeight={700}
            padBottom={10}
            padLeft={5}
          />
        </Row>

        <Row>
          <CustomTextNew
            text="Parameters"
            txtColor={COLORS.primary}
            txtSize={12}
            txtWeight={400}
          />
        </Row>

        {selectedItem?.parameters?.size > 0 ? (
          [...selectedItem?.parameters?.entries()]?.map(
            ([key, value], index) => (
              <View key={index} style={{marginTop: 10}}>
                <Row
                  rowStyle={{
                    gap: 5,
                    alignItems: 'center',
                    // backgroundColor: COLORS.black40,
                  }}>
                  <CustomTextNew
                    text={`${key}: `}
                    txtColor={COLORS.black}
                    txtSize={14}
                    txtWeight={500}
                  />
                  <CustomTextNew
                    key={index}
                    text={
                      key === 'Flag' && typeof value === 'boolean'
                        ? value === true
                          ? 'Yes'
                          : 'No'
                        : key === 'Date-Time'
                          ? convertDate(new Date(value))
                          : key === 'get_id'
                            ? Number(value)
                            : key === 'EMPLOYEE_ID'
                              ? Number(value)
                              : value
                    }
                    txtColor={COLORS.inputTextColor}
                    txtSize={14}
                    txtWeight={400}
                  />
                </Row>
                <Row></Row>
              </View>
            ),
          )
        ) : (
          <CustomTextNew
            text="null"
            txtColor={COLORS.inputTextColor}
            txtSize={13}
            txtWeight={400}
            padTop={10}
          />
        )}
        <View style={[styles.itemListWrapper, {borderColor: '#E4E9F2'}]} />
        <Row>
          <CustomTextNew
            text="Result"
            txtColor={COLORS.primary}
            txtSize={12}
            txtWeight={400}
          />
        </Row>
        <Column>
          {selectedItem?.result ? (
            [...Object.entries(selectedItem?.result)]?.map(
              ([key, value], index) => (
                <View
                  key={index}
                  style={{
                    marginTop: 10,
                  }}>
                  <Row
                    rowStyle={{
                      gap: 5,
                      alignItems: 'center',
                    }}>
                    <CustomTextNew
                      text={`${key}: `}
                      txtColor={COLORS.black}
                      txtSize={14}
                      txtWeight={500}
                      txtStyle={{
                        textTransform: 'capitalize',
                      }}
                    />
                    <CustomTextNew
                      text={value as string}
                      txtColor={COLORS.inputTextColor}
                      txtSize={14}
                      txtWeight={400}
                    />
                  </Row>
                </View>
              ),
            )
          ) : (
            <CustomTextNew
              text="null"
              txtColor={COLORS.inputTextColor}
              txtSize={13}
              txtWeight={400}
              padTop={10}
            />
          )}
        </Column>
        <View style={[styles.itemListWrapper, {borderColor: '#E4E9F2'}]} />
      </CustomBottomSheetNew>
    </ContainerNew>
  );
});

export default ViewRequestsScreen;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 10,
    borderRadius: 14,
  },

  requestIdText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    color: COLORS.textNewColor,
  },
  successText: {
    backgroundColor: COLORS.successColor,
    borderRadius: 3,
    padding: 10,
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '500',
  },
  unsuccessText: {
    backgroundColor: COLORS.primary,
    borderRadius: 3,
    padding: 10,
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '500',
  },
  itemListWrapper: {
    borderTopWidth: 1,

    marginVertical: 12,
  },
  searchInput: {
    backgroundColor: COLORS.white,
    borderWidth: 0,
    borderRadius: 8,
    paddingLeft: 35,
  },
});
