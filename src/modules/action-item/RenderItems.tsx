import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
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
import StatusUpdateButton from '../../common/components/StatusUpdateButton';
import {useToast} from '../../common/components/CustomToast';
interface Props {
  item: ActionItemsStoreSnapshotType;
  refSheet: any;
  setSelectedItem: (item: ActionItemsStoreSnapshotType) => void;
  setIsLoading: (isLoading: boolean) => void;
}
const RenderItems = ({
  item,
  refSheet,
  setSelectedItem,
  setIsLoading,
}: Props) => {
  const url = ProcgURL2;
  const {userInfo, actionItems} = useRootStore();
  const toaster = useToast();
  const handleStatusUpdate = async (action_item_id: number, status: string) => {
    try {
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
    } catch (error) {
      if (error instanceof Error) {
        toaster.show({message: error.message, type: 'error'});
      }
    }
  };

  const onOpenSheet = (item: ActionItemsStoreSnapshotType) => {
    refSheet.current?.open();
    setSelectedItem(item);
  };

  const bgColor =
    item.status.toLowerCase() === 'completed'
      ? '#dcfce7'
      : item.status.toLowerCase() === 'in progress'
        ? '#fef9c3'
        : '#ffedd5';

  return (
    <View style={styles.itemContainer}>
      <Row justify="space-between" align="center">
        <Row rowWidth="90%" align="center" rowStyle={{marginBottom: 5, gap: 5}}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: bgColor,
              },
            ]}>
            <SVGController
              name={
                item.status === 'Completed'
                  ? 'Circle-Check-Big'
                  : item.status === 'In Progress'
                    ? 'Circle-Check'
                    : 'Circle'
              }
              color={COLORS.black}
            />
          </View>

          <Column>
            <CustomTextNew
              text={item.action_item_name}
              // txtColor={COLORS.black}
              style={{fontSize: 15, fontWeight: 'bold', color: COLORS.black}}
            />
            <Row align="center" justify="space-between">
              <View style={{flexDirection: 'row'}}>
                <View
                  style={{
                    backgroundColor: bgColor,
                    paddingHorizontal: 3,
                    borderRadius: 5,
                    alignItems: 'center',
                  }}>
                  <CustomTextNew
                    text={item.status
                      .toLowerCase()
                      .split(' ')
                      .map(
                        (word: string) =>
                          word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(' ')}
                    txtColor={COLORS.black}
                  />
                </View>
              </View>
              <CustomTextNew
                text={convertDate(item.last_update_date as any)}
                style={{color: COLORS.textNewBold}}
              />
            </Row>
          </Column>
        </Row>
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
              onOpenSheet(item);
            }}>
            <CustomTextNew
              text="View Details"
              style={{fontWeight: 'bold', color: COLORS.primary}}
            />
          </TouchableOpacity>
        )}
      </Column>
      {/* View Details Modal */}
      {/* <ViewDetailsModal
        data={item.description}
        isVisible={
          viewDetailsModalVisible.id === item.id &&
          viewDetailsModalVisible.visible
        }
        setIsVisible={setViewDetailsModalVisible}
      /> */}
      {/* End View Details Modal */}
      {/* Button here */}
      <Row justify="space-between">
        <CustomButtonNew
          disabled={false}
          btnText={'Item 1'}
          // isLoading={false}
          // onBtnPress={handleOpenSheet}
          btnstyle={styles.btn}
        />
        <StatusUpdateButton
          disabled={false}
          actionItem={item}
          btnText={'Update Status'}
          handleStatusUpdate={handleStatusUpdate}
          btnstyle={styles.btn}
        />
      </Row>
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
    backgroundColor: COLORS.primary,
    padding: 5,
    borderRadius: 50,
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
