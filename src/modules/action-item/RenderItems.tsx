import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Row from '../../common/components/Row';
import SVGController from '../../common/components/SVGController';
import {COLORS} from '../../common/constant/Themes';
import Column from '../../common/components/Column';
import CustomTextNew from '../../common/components/CustomText';
import CustomButtonNew from '../../common/components/CustomButton';
import {convertDate} from '../../common/services/DateConverter';
import {ActionItemsStoreSnapshotType} from '../../stores/actionItems';
interface Props {
  item: ActionItemsStoreSnapshotType;
  refSheet: any;
  setSelectedItem: (item: ActionItemsStoreSnapshotType) => void;
}
const RenderItems = ({item, refSheet, setSelectedItem}: any) => {
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
                  <CustomTextNew text={item.status} txtColor={COLORS.black} />
                </View>
              </View>
              <CustomTextNew
                text={convertDate(item.last_update_date)}
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
        <TouchableOpacity
          onPress={() => {
            onOpenSheet(item);
            // setViewDetailsModalVisible({id: item.id, visible: true});
          }}>
          <CustomTextNew
            text="View Details"
            style={{fontWeight: 'bold', color: COLORS.primary}}
          />
        </TouchableOpacity>
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
