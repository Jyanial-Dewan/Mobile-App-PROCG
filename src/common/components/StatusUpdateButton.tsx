import React, {useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {COLORS} from '../constant/Themes';
import {ActionItemsStoreSnapshotType} from '../../stores/actionItems';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {observer} from 'mobx-react-lite';

interface Props extends React.ComponentProps<typeof Pressable> {
  actionItem: ActionItemsStoreSnapshotType;
  disabled?: boolean;
  bgColor?: string;
  btnstyle?: {};
  onBtnPress?: () => void;
  btnTextStyle?: {};
  btnText?: string;
  isLoading?: boolean;
  center?: boolean;
  handleStatusUpdate: (action_item_id: number, status: string) => void;
}
const StatusUpdateButton: React.FC<Props> = ({
  actionItem,
  bgColor = COLORS.primaryBtn,
  disabled = false,
  btnstyle = {},
  onBtnPress,
  btnTextStyle,
  btnText,
  isLoading = false,
  center = true,
  handleStatusUpdate,
}: Props) => {
  const [isModalShow, setIsModalShow] = useState(false);
  const status = [
    {
      id: 1,
      label: 'In Progress',
      value: 'IN PROGRESS',
    },
    {
      id: 2,
      label: 'Completed',
      value: 'COMPLETED',
    },
  ];
  const handlePress = (status: string) => {
    handleStatusUpdate(actionItem?.action_item_id, status);
  };

  const isCompleted = actionItem.status.toLowerCase() === 'completed';
  const isInProgress = actionItem.status.toLowerCase() === 'in progress';
  return (
    <>
      <TouchableOpacity
        disabled={disabled}
        style={[
          styles.btnStyle,
          {backgroundColor: disabled ? COLORS.lightGray : bgColor},
          btnstyle || {},
        ]}
        onPress={() => setIsModalShow(!isModalShow)}>
        <View
          style={[
            styles.btnContentWrapperView,
            {
              alignSelf: center ? 'center' : 'auto',
            },
          ]}>
          {btnText && (
            <Text style={[styles.btnText, btnTextStyle || {}]}>{btnText}</Text>
          )}
          {isLoading && (
            <ActivityIndicator
              size="small"
              color={COLORS.white}
              style={styles.loadingStyle}
            />
          )}
        </View>
      </TouchableOpacity>
      <Modal visible={isModalShow} transparent={true} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setIsModalShow(!isModalShow)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <FlatList
                  data={status}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      onPress={() => {
                        handlePress(item.value), setIsModalShow(!isModalShow);
                      }}
                      disabled={
                        isCompleted ||
                        (isInProgress &&
                          item?.label.toLowerCase() === 'in progress')
                      }>
                      <View style={[styles.item]}>
                        {isCompleted ||
                        (isInProgress &&
                          item?.label.toLowerCase() === 'in progress') ? (
                          <Icon name="check" />
                        ) : (
                          <View />
                        )}

                        <Text
                          style={[
                            isCompleted ||
                            (isInProgress &&
                              item?.label.toLowerCase() === 'in progress')
                              ? styles.selected
                              : {color: COLORS.black},
                            ,
                          ]}>
                          {item?.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item, index) => (item.id + index).toString()}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

export default observer(StatusUpdateButton);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  modalContent: {
    backgroundColor: 'white',
    width: 130,
    padding: 6,
    borderRadius: 10,
    maxHeight: 350,
    position: 'absolute',
    top: 135,
    right: 45,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // borderBottomWidth: 1,
    // borderBottomColor: '#ddd',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: 'red',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 50,
  },
  listConatainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // backgroundColor: COLORS.lightBackground,
    marginBottom: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  btnText: {
    color: COLORS.white,
    fontWeight: '500',
    fontSize: 14,
    textAlign: 'center',
  },
  btnStyle: {
    paddingVertical: 12,
    borderRadius: 6,
    justifyContent: 'center',
  },
  btnContentWrapperView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  loadingStyle: {transform: [{scaleX: 0.8}, {scaleY: 0.8}], paddingLeft: 10},
  selected: {
    color: COLORS.textGray,
  },
});
