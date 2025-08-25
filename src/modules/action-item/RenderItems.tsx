import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, {useRef, useState} from 'react';
import Row from '../../common/components/Row';
import SVGController from '../../common/components/SVGController';
import {COLORS} from '../../common/constant/Themes';
import Column from '../../common/components/Column';
import CustomTextNew from '../../common/components/CustomText';
import CustomButtonNew from '../../common/components/CustomButton';
import {convertDate} from '../../common/services/DateConverter';
import {ActionItemsStoreSnapshotType} from '../../stores/actionItems';
import {api} from '../../common/api/api';
import {ProcgURL2} from '../../../App';
import {useRootStore} from '../../stores/rootStore';
import {httpRequest} from '../../common/constant/httpRequest';
import {useToast} from '../../common/components/CustomToast';
import {toTitleCase} from '../../common/utility/general';
import CustomBottomSheetNew from '../../common/components/CustomBottomSheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RBSheet from '../../common/packages/RBSheet/RBSheet';

interface Props {
  item: ActionItemsStoreSnapshotType;
  selectedItem: ActionItemsStoreSnapshotType | undefined;
  setSelectedItem: (item: ActionItemsStoreSnapshotType | undefined) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  allStatus: {id: number; title: string; value: string}[];
}
const RenderItems = ({
  item,
  selectedItem,
  setSelectedItem,
  isLoading,
  setIsLoading,
  allStatus,
}: Props) => {
  const url = ProcgURL2;
  const {userInfo, actionItems} = useRootStore();
  const toaster = useToast();
  const refRBSheetViewDetails = useRef<RBSheet>(null);
  const refRBSheetUpdateStaus = useRef<RBSheet>(null);
  const [selectedStatusForUpdate, setSelectedStatusForUpdate] = useState('');
  const handleStatusUpdate = async (action_item_id: number, status: string) => {
    try {
      // setIsLoading(true);
      const api_params = {
        url: `${api.UpdateActionItemAssignment}/${userInfo?.user_id}/${action_item_id}`,
        baseURL: url,
        method: 'put',
        data: {status},
        access_token: userInfo?.access_token,
        // isConsole: true,
        // isConsoleParams: true,
      };
      await httpRequest(api_params, setIsLoading);
      actionItems.updateActionItem(action_item_id, status);
      toaster.show({message: `Status updated.`, type: 'success'});
    } catch (error) {
      if (error instanceof Error) {
        toaster.show({message: error.message, type: 'error'});
      }
    } finally {
      refRBSheetUpdateStaus.current?.close();
      setSelectedStatusForUpdate('');
    }
  };

  const onOpenViewDetailsSheet = (item: ActionItemsStoreSnapshotType) => {
    refRBSheetViewDetails.current?.open();
    setSelectedItem(item);
  };
  const onOpenUpdateStatusSheet = () => {
    refRBSheetUpdateStaus.current?.open();
  };

  const bgColor =
    item.status.toLowerCase() === 'completed'
      ? '#dcfce7'
      : item.status.toLowerCase() === 'in progress'
        ? '#fef9c3'
        : '#ffedd5';
  const iconName =
    item.status.toLowerCase() === 'completed'
      ? 'Circle-Check-Big'
      : item.status.toLowerCase() === 'in progress'
        ? 'Circle-Check'
        : 'Circle';

  const handleUpdateStatusRef = () => {
    refRBSheetUpdateStaus.current?.open();
  };

  return (
    <View style={styles.itemContainer}>
      <Row justify="space-between" align="center">
        <Row justify="space-between" rowStyle={{gap: 10}}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: bgColor,
              },
            ]}>
            <SVGController name={iconName} color={COLORS.black} />
          </View>
          {/* item */}
          <Column colWidth="100%">
            <Column colWidth="90%">
              <CustomTextNew
                text={item.action_item_name}
                // txtColor={COLORS.black}
                style={{fontSize: 15, fontWeight: 'bold', color: COLORS.black}}
              />
              <CustomTextNew
                text={convertDate(item.last_update_date as any)}
                style={{color: COLORS.textNewBold}}
              />
              <Row>
                <View
                  style={{
                    backgroundColor: bgColor,
                    paddingHorizontal: 3,
                    borderRadius: 5,
                    alignItems: 'center',
                  }}>
                  <CustomTextNew
                    text={toTitleCase(item.status)}
                    txtColor={COLORS.black}
                  />
                </View>
              </Row>
              <Column colStyle={styles.colStyle}>
                <CustomTextNew
                  text={`${item.description.slice(0, 180)} ${item.description.length > 180 ? '...' : ''}`}
                  txtColor={COLORS.blackish}
                  txtSize={14}
                />
                {item.description.length > 180 && (
                  <TouchableOpacity
                    onPress={() => {
                      onOpenViewDetailsSheet(item);
                    }}>
                    <CustomTextNew
                      text="View Details"
                      style={{fontWeight: 'bold', color: COLORS.primary}}
                    />
                  </TouchableOpacity>
                )}
              </Column>
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
                  btnText={'Update Status'}
                  // isLoading={false}
                  onBtnPress={onOpenUpdateStatusSheet}
                  btnstyle={styles.btn}
                />
                {/* <StatusUpdateButton
                  disabled={false}
                  actionItem={item}
                  btnText={'Update Status'}
                  handleStatusUpdate={handleStatusUpdate}
                  btnstyle={styles.btn}
                /> */}
              </Row>
            </Column>
          </Column>
        </Row>
      </Row>

      {/* Button here */}
      {/* <StatusUpdateButtonTwo
        item={item}
        refRBSheetStatusUpdate={refSheetStatusUpdate}
        handleStatusUpdate={handleStatusUpdate}
      /> */}
      {/* Bottom Sheet View details*/}
      <CustomBottomSheetNew
        refRBSheet={refRBSheetViewDetails}
        sheetHeight={600}
        onClose={() => setSelectedItem(undefined)}>
        {selectedItem && (
          <TouchableWithoutFeedback>
            <View>
              <ScrollView
                style={[styles.itemContainer]}
                contentContainerStyle={{flexGrow: 1}}>
                <TouchableOpacity activeOpacity={1}>
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
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        )}
      </CustomBottomSheetNew>
      {/* bottom sheet Update status*/}
      <CustomBottomSheetNew
        refRBSheet={refRBSheetUpdateStaus}
        sheetHeight={330}
        onClose={() => setSelectedStatusForUpdate('')}>
        <View style={{padding: 10, gap: 10}}>
          {/* action item name */}
          <CustomTextNew
            text={'Update Status'}
            txtColor={COLORS.black}
            txtStyle={{fontSize: 20, fontWeight: 'bold'}}
          />
          {/* status items */}
          <View>
            {allStatus.slice(1).map((statusItem: any, index: number) => (
              <TouchableOpacity
                key={index}
                onPress={() =>
                  setSelectedStatusForUpdate(prev => {
                    if (prev === statusItem.value) {
                      return '';
                    } else {
                      return statusItem.value;
                    }
                  })
                }
                style={[
                  item.status.toLowerCase() === 'completed' ||
                  statusItem.value.toLowerCase() === 'new' ||
                  statusItem.value.toLowerCase() === item.status.toLowerCase()
                    ? {borderColor: COLORS.green}
                    : {borderColor: '#767676ff'},
                  statusItem.value.toLowerCase() ===
                    selectedStatusForUpdate.toLowerCase() && {
                    backgroundColor: COLORS.grayBgColor,
                  },
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    borderWidth: 1,
                    padding: 10,
                    borderRadius: 5,
                    marginBottom: 5,
                  },
                ]}>
                {item.status.toLowerCase() === 'completed' ||
                statusItem.value.toLowerCase() === 'new' ||
                statusItem.value.toLowerCase() === item.status.toLowerCase() ? (
                  <Icon name="check" color={COLORS.green} size={20} />
                ) : (
                  <>
                    {statusItem.value.toLowerCase() ===
                    selectedStatusForUpdate.toLowerCase() ? (
                      <Icon name="check" color={COLORS.green} size={20} />
                    ) : (
                      <>
                        {item.status.toLowerCase() === 'new' &&
                        selectedStatusForUpdate.toLowerCase() ===
                          'completed' ? (
                          <Icon name="check" color={COLORS.green} size={20} />
                        ) : (
                          <View style={{width: 20}} />
                        )}
                      </>
                    )}
                  </>
                )}
                <CustomTextNew
                  text={statusItem.title}
                  txtColor={COLORS.black}
                  txtSize={20}
                />
              </TouchableOpacity>
            ))}
          </View>
          {/* button here */}
          <View
            style={{
              marginTop: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <CustomButtonNew
              disabled={false}
              btnText={'Cancel'}
              // isLoading={false}
              onBtnPress={() => refRBSheetUpdateStaus.current?.close()}
              btnstyle={styles.btn}
            />
            <CustomButtonNew
              disabled={
                selectedStatusForUpdate === '' ||
                isLoading ||
                item.status.toLowerCase() ===
                  selectedStatusForUpdate.toLowerCase()
              }
              btnText={'Update'}
              isLoading={isLoading}
              onBtnPress={() =>
                handleStatusUpdate(item.action_item_id, selectedStatusForUpdate)
              }
              btnstyle={[
                styles.btn,
                {
                  backgroundColor:
                    selectedStatusForUpdate !== ''
                      ? item.status.toLowerCase() ===
                        selectedStatusForUpdate.toLowerCase()
                        ? COLORS.lightGray
                        : COLORS.primary
                      : COLORS.lightGray,
                },
              ]}
            />
          </View>
        </View>
      </CustomBottomSheetNew>
    </View>
  );
};

export default RenderItems;

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    // elevation: 1,
  },
  iconContainer: {
    padding: 5,
    borderRadius: 50,
    alignSelf: 'flex-start',
  },
  colStyle: {
    // borderBottomColor: COLORS.borderBottom,
    // borderBottomWidth: 2,
    marginBottom: 10,
    paddingVertical: 5,
  },
  btn: {
    width: '45%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.newGray,
  },
});
