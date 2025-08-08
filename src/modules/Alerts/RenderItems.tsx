import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Row from '../../common/components/Row';
import SVGController from '../../common/components/SVGController';
import {COLORS} from '../../common/constant/Themes';
import Column from '../../common/components/Column';
import CustomTextNew from '../../common/components/CustomText';
import {convertDate} from '../../common/services/DateConverter';
import CustomButtonNew from '../../common/components/CustomButton';
import {AlertStoreSnapshotType} from '../../stores/alertsStore';
interface Props {
  item: AlertStoreSnapshotType;
  refSheet: any;
  setSelectedItem: (item: AlertStoreSnapshotType) => void;
}

const RenderItems = ({item, refSheet, setSelectedItem}: any) => {
  const onOpenSheet = (item: any) => {
    refSheet.current?.open();
    setSelectedItem(item);
  };
  return (
    <View style={styles.itemContainer}>
      <Row justify="space-between" rowStyle={{gap: 10}}>
        <View
          style={{
            padding: 5,
            borderRadius: 50,
            backgroundColor: COLORS.iconBGREDColor,
            alignSelf: 'flex-start',
          }}>
          <SVGController name="Alert-Low" color={COLORS.white} />
        </View>
        <Column colWidth="90%">
          <Row justify="space-between" align="center">
            <Row align="center" justify="space-between">
              <CustomTextNew
                text={item.alert_name}
                style={{
                  fontSize: 15,
                  fontWeight: 'bold',
                  color: COLORS.black,
                  marginTop: 5,
                }}
              />
              <CustomTextNew
                text={convertDate(item.last_update_date)}
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
                // setViewDetailsModalVisible({id: item.id, visible: true});
                onOpenSheet(item);
              }}>
              <CustomTextNew
                text="View Details"
                txtSize={12}
                style={[styles.linkText, {marginTop: 5}]}
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
};

export default RenderItems;

const styles = StyleSheet.create({
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
  colStyle: {
    // borderBottomColor: COLORS.borderBottom,
    // borderBottomWidth: 2,
    marginBottom: 5,
    paddingVertical: 5,
  },
  linkText: {
    color: COLORS.blue,
    fontSize: 15,
    fontWeight: 'bold',
  },
  btn: {
    width: '35%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.newGray,
  },
});
