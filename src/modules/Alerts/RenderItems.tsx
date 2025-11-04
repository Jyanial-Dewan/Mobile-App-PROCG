import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import Row from '../../common/components/Row';
import SVGController from '../../common/components/SVGController';
import {COLORS} from '../../common/constant/Themes';
import Column from '../../common/components/Column';
import CustomTextNew from '../../common/components/CustomText';
import {convertDate} from '../../common/services/DateConverter';
import CustomButtonNew from '../../common/components/CustomButton';
import {AlertStoreSnapshotType} from '../../stores/alertsStore';
import {useRootStore} from '../../stores/rootStore';
import {api} from '../../common/api/api';
import {httpRequest} from '../../common/constant/httpRequest';
import {useSocketContext} from '../../context/SocketContext';
import {useToast} from '../../common/components/CustomToast';
interface Props {
  item: AlertStoreSnapshotType;
  refSheet: any;
  setSelectedItem: (item: AlertStoreSnapshotType) => void;
}

const RenderItems = ({url, item, refSheet, setSelectedItem}: any) => {
  const {userInfo, alertsStore} = useRootStore();
  const {SendAlert} = useSocketContext();
  const [isLoading, setIsLoading] = useState(false);
  const notificationIds = alertsStore.notificationAlerts.map(
    item => item.alert_id,
  );
  const toaster = useToast();
  const onOpenSheet = (item: AlertStoreSnapshotType) => {
    setSelectedItem(item);
    refSheet.current?.open();
  };

  const handleAcknowledge = async () => {
    try {
      const api_params = {
        url: `${api.Alerts}/acknowledge/${item.alert_id}/${userInfo?.user_id}`,
        data: {acknowledge: true},
        baseURL: url,
        method: 'put',
        isConsole: true,
        isConsoleParams: true,
      };
      const res = await httpRequest(api_params, setIsLoading);

      if (res) {
        toaster.show({message: res.message, type: 'success'});
        SendAlert(item.alert_id, [userInfo?.user_id!], true);
        alertsStore.readAlert(item.alert_id);
      }
    } catch (error) {
      if (error instanceof Error) {
        toaster.show({message: error.message, type: 'error'});
      }
    }
  };

  return (
    <View
      style={[
        styles.itemContainer,
        {
          backgroundColor:
            item.acknowledge === false ? COLORS.grayBgColor : COLORS.white,
        },
      ]}>
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
        <Column colWidth="100%">
          <Column colWidth="85%" colStyle={{gap: 5}}>
            <Row justify="space-between">
              <CustomTextNew
                text={`ID: ${item.alert_id}`}
                style={{color: COLORS.textNewBold, fontWeight: 'bold'}}
              />
              <CustomTextNew
                text={convertDate(item.last_update_date)}
                txtColor={COLORS.textNewBold}
              />
            </Row>
            <CustomTextNew
              text={item.alert_name}
              style={{
                fontSize: 15,
                fontWeight: 'bold',
                color: COLORS.black,
              }}
            />
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
                  txtSize={12}
                  style={[styles.linkText, {marginTop: 5}]}
                />
              </TouchableOpacity>
            )}
            <Row justify="flex-start">
              <CustomButtonNew
                disabled={item.acknowledge === false ? false : true}
                btnText={'Acknowledge'}
                // isLoading={false}
                onBtnPress={handleAcknowledge}
                btnstyle={
                  item.acknowledge === false ? styles.btn : styles.btnDisable
                }
              />
            </Row>
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
        </Column>
      </Row>
    </View>
  );
};

export default RenderItems;

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: COLORS.white,
    padding: 10,
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
    width: 'auto',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.darkGray,
  },
  btnDisable: {
    width: 'auto',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B1B1B1',
  },
});
