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
      id: 0,
      label: 'New',
      value: 'NEW',
    },
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

  // const isNew = actionItem.status.toLowerCase() === 'new';
  // const isCompleted = actionItem.status.toLowerCase() === 'completed';
  // const isInProgress = actionItem.status.toLowerCase() === 'in progress';
  const currentIndex = Math.max(
    0,
    status.findIndex(
      s => s.label.toLowerCase() === actionItem.status.toLowerCase(),
    ),
  );

  return (
    <>
      {isModalShow && (
        <TouchableWithoutFeedback onPress={() => setIsModalShow(!isModalShow)}>
          <View style={styles.modalContent}>
            <TouchableWithoutFeedback>
              <View style={{flexDirection: 'row'}}>
                <View style={styles.stepperRow}>
                  {/* one continuous gray track */}
                  <View style={styles.track}>
                    {/* green filled part of the track */}
                    <View
                      style={[
                        styles.trackFill,
                        {
                          width: `${(currentIndex / (status.length - 1)) * 100}%`,
                        },
                      ]}
                    />
                  </View>

                  {/* circles */}
                  {status.map((item, index) => {
                    const isActive = index === currentIndex;
                    const isCompleted = index < currentIndex;

                    return (
                      <TouchableOpacity
                        key={item.id}
                        disabled={item.label.toLowerCase() === 'new'}
                        onPress={() => handlePress(item.value)}
                        style={styles.step}
                        activeOpacity={1}>
                        <View
                          style={[
                            styles.circle,
                            (isActive || isCompleted) && {
                              borderColor: '#16a34a',
                              backgroundColor: '#fff',
                            },
                            // isCompleted && {backgroundColor: '#16a34a'},
                          ]}>
                          {(isActive || isCompleted) && (
                            <Icon name="check" size={16} color={'#16a34a'} />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.label,
                            // isActive && {color: '#16a34a', fontWeight: '600'},
                          ]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}

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
    </>
  );
};

export default observer(StatusUpdateButton);

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    width: 'auto',
    padding: 6,
    borderRadius: 10,
    maxHeight: 350,
    position: 'absolute',
    bottom: 45,
    right: 0,
    zIndex: 99999,
    borderBlockColor: '#b1b1b1ff',
    borderWidth: 0.5,
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

  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#878787',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  // line: {
  //   height: 2,
  //   width: 40,
  //   backgroundColor: '#ccc',
  //   marginHorizontal: 4,
  // },
  label: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.black,
  },
  stepperRow: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 280, // optional, keeps good spacing
    paddingHorizontal: 8,
  },
  track: {
    position: 'absolute',
    left: 14, // = circle radius -> line starts at circle center
    right: 25, // = circle radius -> line ends at circle center
    top: 14, // vertically center with circle
    height: 2,
    backgroundColor: '#ccc',
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    height: 2,
    backgroundColor: '#16a34a',
  },
  step: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1, // keep circles above the track
  },
});
