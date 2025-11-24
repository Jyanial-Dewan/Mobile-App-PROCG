import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Image from 'react-native-image-fallback';
import {MessageSnapshotType} from '../../../stores/messageStore';
import {formateDateTime} from '../../../common/services/dateFormater';
import {useRootStore} from '../../../stores/rootStore';
import {ProcgURL, ProcgURL2} from '../../../../App';
import {COLORS} from '../../../common/constant/Themes';
import {observer} from 'mobx-react-lite';
import CustomDeleteModal from '../../../common/components/CustomDeleteModal';
import {useToast} from '../../../common/components/CustomToast';
import CustomTextNew from '../../../common/components/CustomText';
import Row from '../../../common/components/Row';
import {httpRequest} from '../../../common/constant/httpRequest';
import {api} from '../../../common/api/api';
import {
  renderProfilePicture,
  renderSlicedUsername,
} from '../../../common/utility/notifications.utility';
import Feather from 'react-native-vector-icons/Feather';
import {toTitleCase} from '../../../common/utility/general';
import {NotificationDetailsNavigationProp} from '../../../navigations/NotificationStack';
import {useSocketContext} from '../../../context/SocketContext';
import {useForm} from 'react-hook-form';
import useAsyncEffect from '../../../common/packages/useAsyncEffect/useAsyncEffect';
import CustomDropDownNew from '../../../common/components/CustomDropDownTwo';
import ContainerNew from '../../../common/components/Container';
import LongPressedHeader from '../../../common/components/LongPressedHeader';
import MainHeader from '../../../common/components/MainHeader';
import CustomFlatListThree from '../../../common/components/CustomFlatListThree';
import PlusButton from '../../../common/components/PlusButton';

interface RenderMessageItemProps {
  item: MessageSnapshotType;
  userInfo: any;
  selectedIds: string[];
  notificationIds?: string[];
  handleLongPress: (msg: MessageSnapshotType) => void;
  handlePress: (msg: MessageSnapshotType) => Promise<void>;
  handleDeleteFromRecycleBin: (msg: any) => Promise<void>;
}
const ITEMHEIGHT = 105;
const RenderMessageItem = observer(
  ({
    item,
    userInfo,
    selectedIds,
    notificationIds,
    handleLongPress,
    handlePress,
    handleDeleteFromRecycleBin,
  }: RenderMessageItemProps) => {
    const screenWidth = useWindowDimensions().width;
    const SWIPE_THRESHOLD = -screenWidth * 0.6;
    const translateX = useSharedValue(0);
    const scaleX = useSharedValue(0);
    const marginY = useSharedValue(5);
    const [loaded, setLoaded] = useState(false);
    const {datePart, timePart} = formateDateTime(item.creation_date as any);
    const {usersStore, selectedUrl} = useRootStore();
    const [openModal, setOpenModal] = useState(false);
    const url = selectedUrl || ProcgURL;
    const fallbacks = [require('../../../assets/prifileImages/thumbnail.jpg')];
    const noUserFallback = [
      require('../../../assets/prifileImages/person.png'),
    ];

    const openDeleteModal = () => {
      setOpenModal(true);
    };

    const onCancel = () => {
      setOpenModal(false);
      translateX.value = withSpring(0, {
        duration: 1,
      });
    };

    const handleDelete = () => {
      handleDeleteFromRecycleBin(item);
      marginY.value = withTiming(0);
      scaleX.value = withTiming(0);
    };

    const panGesture = Gesture.Pan()
      .failOffsetY([-5, 5])
      .activeOffsetX([-5, 5])
      .onUpdate(event => {
        // Update the position of the component based on the gesture
        translateX.value = event.translationX;
      })
      .onEnd(() => {
        // Determine if the component should be dismissed or return to its original position
        const shouldDelete = translateX.value < SWIPE_THRESHOLD;

        if (shouldDelete) {
          // runOnJS(handleDelete)();
          translateX.value = withTiming(-screenWidth, {}, finished => {
            if (finished) {
              runOnJS(openDeleteModal)();
              // marginY.value = withTiming(0);
              // scaleX.value = withTiming(0);
            }
          });
        } else {
          translateX.value = withSpring(0, {
            duration: 1,
          });
        }
      });
    const animatedStyle = useAnimatedStyle(() => {
      // console.log(translateX.value, 'value');
      return {
        transform: [
          {
            translateX: translateX.value,
          },
        ],
      };
    });

    const height = useAnimatedStyle(() => {
      return {
        height: scaleX.value,
        marginVertical: marginY.value,
      };
    });

    const animatedHeight = !loaded ? {} : height;

    const backgroundColor = selectedIds.includes(item.notification_id)
      ? 'transparent'
      : COLORS.primaryRed;

    const findOrigin = (msg: MessageSnapshotType) => {
      if (msg?.status.toLocaleLowerCase() === 'draft') {
        return 'Draft';
      } else {
        if (msg?.sender === userInfo.user_id) {
          return 'Sent';
        } else {
          return 'Inbox';
        }
      }
    };
    return (
      <View style={{paddingVertical: 5}}>
        {openModal && (
          <CustomDeleteModal
            isModalShow={openModal}
            setIsModalShow={setOpenModal}
            total={1}
            onPressCallApi={() => handleDelete()}
            onCancel={() => onCancel()}
            actionName="delete permanently"
          />
        )}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[animatedHeight, {backgroundColor, borderRadius: 15}]}
            onLayout={e => {
              if (!loaded) {
                // scaleX.value = ITEMHEIGHT;
                setLoaded(true);
              }
            }}>
            <View style={styles.deleteBtn}>
              <Feather name="trash" size={24} color={COLORS.white} />
            </View>
            <Animated.View
              style={[
                animatedStyle,
                {
                  backgroundColor: selectedIds.includes(item?.notification_id)
                    ? COLORS.highLight
                    : COLORS.white,
                  borderRadius: 14,
                },
              ]}>
              <TouchableOpacity
                activeOpacity={1}
                style={[
                  styles.rowContainer,
                  {
                    backgroundColor:
                      notificationIds?.includes(item.notification_id) ||
                      selectedIds.includes(item?.notification_id)
                        ? COLORS.highLight
                        : COLORS.white,
                  },
                ]}
                onLongPress={() => handleLongPress(item)}
                onPress={() => handlePress(item)}>
                {/* Image Section */}
                <View
                  style={[
                    styles.imageStyle,
                    {
                      borderColor: COLORS.notifcationIconBorder,
                      backgroundColor: COLORS.white,
                    },
                  ]}>
                  {selectedIds.includes(item.notification_id) ? (
                    <View
                      style={{
                        height: 40,
                        width: 40,
                        borderRadius: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Feather name="check" size={24} color={COLORS.green} />
                    </View>
                  ) : (
                    <Image
                      style={styles.profileImage}
                      source={{
                        // uri: `${url}/${findOrigin(item) === 'Inbox' ? item?.sender?.profile_picture : item?.recivers[0]?.profile_picture}`,
                        uri: `${url}/${findOrigin(item) === 'Inbox' ? renderProfilePicture(item.sender, usersStore.users) : renderProfilePicture(item.recipients[0], usersStore.users)}`,
                        // headers: {
                        //   Authorization: `Bearer ${userInfo?.access_token}`,
                        // },
                      }}
                      fallback={
                        item.recipients.length === 0
                          ? noUserFallback
                          : fallbacks
                      }
                    />
                  )}
                </View>

                {/* Text Section */}
                <View
                  style={{
                    flex: 1,
                    marginLeft: 10,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <CustomTextNew
                      txtStyle={styles.headText}
                      text={
                        item?.recipients?.length === 0
                          ? '(No User)'
                          : findOrigin(item) === 'Inbox'
                            ? renderSlicedUsername(
                                item.recipients[0],
                                usersStore.users,
                                15,
                              )
                            : renderSlicedUsername(
                                item.sender,
                                usersStore.users,
                                15,
                              )
                        // item?.recivers?.length === 0
                        //   ? '(No User)'
                        //   : findOrigin(item) === 'Inbox'
                        //     ? `${item.recivers[0].name.slice(0, 20)}${item.recivers[0].name?.length > 20 ? '...' : ''}`
                        //     : `${item?.sender.name.slice(0, 20)}${item.sender?.name.length > 20 ? '...' : ''}`
                      }
                    />
                    <View>
                      <CustomTextNew
                        txtStyle={[styles.dateText, {color: COLORS.black}]}
                        text={item.creation_date.toLocaleString()}
                      />
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <View
                      style={{
                        backgroundColor: COLORS.badgeBlueLight,
                        paddingHorizontal: 3,
                        borderRadius: 5,
                        alignItems: 'center',
                      }}>
                      <CustomTextNew
                        text={toTitleCase(item?.notification_type)}
                        txtColor={COLORS.black}
                      />
                    </View>
                    <CustomTextNew
                      txtStyle={[styles.subText]}
                      txtAlign="justify"
                      text={findOrigin(item)}
                    />
                  </View>
                  <CustomTextNew
                    txtStyle={styles.subText}
                    txtAlign="justify"
                    text={item?.subject}
                    // text={`${item?.subject.slice(0, 40)}${item?.subject?.length > 40 ? '...' : ''}`}
                  />
                  {/* <CustomTextNew
                    txtStyle={styles.bodyText}
                    txtAlign="justify"
                    text={
                      item?.body?.length > 80
                        ? item?.body?.replace(/\s+/g, ' ').slice(0, 80) + '...'
                        : item?.body?.replace(/\s+/g, ' ')
                    }
                  /> */}
                </View>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>
    );
  },
);

const RecycleBin = observer(() => {
  const navigation = useNavigation<NotificationDetailsNavigationProp>();
  const isFocused = useIsFocused();
  const {userInfo, messageStore, selectedUrl} = useRootStore();
  const {
    socket,
    deleteMessage,
    handleParmanentDeleteMessage,
    multipleDeleteMessage,
  } = useSocketContext();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(0);
  const [isLongPressed, setIsLongPressed] = useState<boolean>(false);
  const [selectedMsgIds, setSelectedMsgIds] = useState<string[]>([]);
  const [selectedMSGs, setSelectedMSGs] = useState<MessageSnapshotType[]>([]);
  const [selectedAlertIds, setSelectedAlertIds] = useState<number[] | null>([]);
  const [selectedActionItemIds, setSelectedActionItemIds] = useState<
    number[] | null
  >([]);
  const [isModalShow, setIsModalShow] = useState(false);
  const route = useRoute();
  const routeName = route.name;
  const toaster = useToast();
  const {control, setValue} = useForm();
  const NODE_URL = selectedUrl || ProcgURL;
  const limit = 50;
  const notificationIds = messageStore.notificationMessages.map(
    msg => msg.notification_id,
  );
  useFocusEffect(
    useCallback(() => {
      setValue('routeName', {label: 'Recycle Bin'});
    }, [isFocused]),
  );
  useAsyncEffect(
    async isMounted => {
      if (!isMounted()) {
        return null;
      }
      const api_params = {
        url: `${api.RecycleBinMessages}?user_id=${userInfo?.user_id}&page=${currentPage}&limit=${limit}`,
        baseURL: NODE_URL,
        // isConsole: true,
        // isConsoleParams: true,
      };
      const res = await httpRequest(api_params, setIsLoading);
      if (res) {
        setHasMore(res.result.length);
        if (currentPage === 1) {
          messageStore.initialBinMessages(res.result ?? []);
        } else {
          messageStore.saveBinMessages(res.result ?? []);
        }
        messageStore.setRefreshing(false);
      }
      if (res.result.length < 5) {
        return;
      }
    },
    [
      isFocused,
      currentPage,
      messageStore.binMessages.length,
      messageStore.refreshing,
    ],
  );

  const handleRefresh = () => {
    messageStore.setRefreshing(true);
    setCurrentPage(1);
  };

  const handlePress = async (msg: MessageSnapshotType) => {
    if (isLongPressed) {
      setSelectedMsgIds(prev => [msg.notification_id, ...prev]);
      setSelectedMSGs(prev => [msg, ...prev]);
      // if (msg.alert_id) {
      //   setSelectedAlertIds((prev: number[] | null) => [msg.alert_id, ...prev]);
      // }
      // if (msg.action_item_id) {
      //   setSelectedActionItemIds((prev: number[] | null) => [
      //     msg.action_item_id,
      //     ...prev,
      //   ]);
      // }
    } else {
      navigation.navigate('Recycle_Bin_Detail', {
        _id: msg.notification_id,
      });
    }
    if (selectedMsgIds.includes(msg.notification_id)) {
      handleDisSelectMsg(msg);
    }
  };
  console.log(selectedMSGs, '427');
  const handleLongPress = (msg: MessageSnapshotType) => {
    setIsLongPressed(true);
    setSelectedMSGs(prev => [msg, ...prev]);
    setSelectedMsgIds(prev => [msg.notification_id, ...prev]);
    // if (msg.alert_id) {
    //   setSelectedAlertIds(prev => [msg.alert_id, ...prev]);
    // }
    // if (msg.action_item_id) {
    //   setSelectedActionItemIds(prev => [msg.action_item_id, ...prev]);
    // }
  };
  const handleDisSelectMsg = (msg: MessageSnapshotType) => {
    const newSelected = selectedMSGs.filter(
      item => item.notification_id !== msg.notification_id,
    );
    setSelectedMSGs(newSelected);
    setSelectedMsgIds(newSelected.map(item => item.notification_id));
    // setSelectedAlertIds(newSelected.map(item => item?.alert_id));
    // setSelectedActionItemIds(newSelected.map(item => item?.action_item_id));
  };

  const handleCancelLongPress = () => {
    setIsModalShow(false);
    setIsLongPressed(false);
    setSelectedMsgIds([]);
    setSelectedMSGs([]);
    setSelectedAlertIds([]);
    setSelectedActionItemIds([]);
  };

  const handleMultipleDelete = async () => {
    const params = {
      url: `${api.MoveMultipleFromRecycleBin}/${userInfo?.user_id}`,
      data: {ids: selectedMsgIds},
      method: 'put',
      baseURL: NODE_URL,
      isConsole: true,
      isConsoleParams: true,
    };
    try {
      const response = await httpRequest(params, setIsLoading);
      if (response) {
        multipleDeleteMessage(selectedMsgIds, 'Recycle');

        toaster.show({
          message: response.message,
          type: 'success',
        });
        setIsLongPressed(false);
        setSelectedMsgIds([]);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
    }
  };

  const handleDeleteFromRecycleBin = async (msg: MessageSnapshotType) => {
    try {
      if (msg.alert_id && msg.status === 'DRAFT') {
        const deleteAlertParams = {
          url: `${api.Alerts}/${msg.alert_id}`,
          method: 'delete',
          baseURL: NODE_URL,
        };
        const deletedAlert = await httpRequest(deleteAlertParams, setIsLoading);
        if (deletedAlert) {
          const deleteNotificationParams = {
            url: `${api.Messages}/${msg.notification_id}`,
            method: 'delete',
            baseURL: NODE_URL,
            isToast: true,
          };
          const deleteNotification = await httpRequest(
            deleteNotificationParams,
            setIsLoading,
          );
          if (deleteNotification) {
            handleParmanentDeleteMessage(msg.notification_id);
            toaster.show({
              message: deleteNotification.message,
              type: 'success',
            });
          }
        }
      } else if (msg.action_item_id && msg.status === 'DRAFT') {
        const deleteActionItemParams = {
          url: `${api.ActionItem}/${msg.action_item_id}`,
          method: 'delete',
          baseURL: ProcgURL2,
          access_token: userInfo?.access_token,
          isConsole: true,
          isConsoleParams: true,
        };
        const deletedActionItem = await httpRequest(
          deleteActionItemParams,
          setIsLoading,
        );
        if (deletedActionItem) {
          const deleteNotificationParams = {
            url: `${api.Messages}/${msg.notification_id}`,
            method: 'delete',
            baseURL: NODE_URL,
            isConsole: true,
            isConsoleParams: true,
          };
          const deleteNotification = await httpRequest(
            deleteNotificationParams,
            setIsLoading,
          );
          if (deleteNotification) {
            handleParmanentDeleteMessage(msg.notification_id);
            toaster.show({
              message: deleteNotification.message,
              type: 'success',
            });
          }
        }
      } else if (
        msg.status === 'DRAFT' &&
        msg.notification_type === 'NOTIFICATION'
      ) {
        const deleteNotificationParams = {
          url: `${api.Messages}/${msg.notification_id}`,
          method: 'delete',
          baseURL: NODE_URL,
          isConsole: true,
          isConsoleParams: true,
        };
        const deleteNotification = await httpRequest(
          deleteNotificationParams,
          setIsLoading,
        );
        if (deleteNotification) {
          handleParmanentDeleteMessage(msg.notification_id);
          toaster.show({
            message: deleteNotification.message,
            type: 'success',
          });
        }
      } else {
        const putParams = {
          url: `${api.DeleteFromRecycle}?notification_id=${msg.notification_id}&user_id=${userInfo?.user_id}`,
          method: 'put',
          baseURL: NODE_URL,
          isConsole: true,
          isConsoleParams: true,
        };
        const response = await httpRequest(putParams, setIsLoading);
        if (response) {
          deleteMessage(msg.notification_id, 'Recycle');
          toaster.show({
            message: response.message,
            type: 'success',
          });
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        toaster.show({message: error.message, type: 'error'});
      }
    }
  };

  const MessageGroups = () => {
    return (
      <CustomDropDownNew
        name="routeName"
        setValue={setValue}
        control={control}
        labelStyle={styles.label}
        isIconShow={true}
      />
    );
  };

  const EmptyListItem = () => {
    return (
      <View style={styles.emptyListStyle}>
        <CustomTextNew text={'No message found'} txtColor={COLORS.black} />
      </View>
    );
  };

  return (
    <ContainerNew
      isRefresh={true}
      backgroundColor={COLORS.lightBackground}
      isScrollView={false}
      header={
        isLongPressed && selectedMsgIds.length ? (
          <LongPressedHeader
            from={route.name}
            selectedIds={selectedMsgIds}
            handleCancelLongPress={handleCancelLongPress}
            handleShowModal={() => setIsModalShow(true)}
          />
        ) : (
          <MainHeader routeName={routeName} style={{fontWeight: '700'}} />
        )
      }
      style={styles.container}>
      <MessageGroups />
      <CustomFlatListThree
        data={messageStore.binMessages}
        keyExtractor={(item: MessageSnapshotType, index: number) =>
          item.notification_id + index
        }
        // numColumns={1}
        RenderItems={({item}: any) => (
          <RenderMessageItem
            item={item}
            userInfo={userInfo}
            selectedIds={selectedMsgIds}
            notificationIds={notificationIds}
            handlePress={handlePress}
            handleLongPress={handleLongPress}
            handleDeleteFromRecycleBin={handleDeleteFromRecycleBin}
          />
        )}
        isLoading={isLoading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        hasMore={hasMore}
        contentContainerStyle={
          messageStore.binMessages.length === 0 ? styles.flexGrow : null
        }
        emptyItem={
          !isLoading && messageStore.binMessages.length === 0
            ? EmptyListItem
            : null
        }
        refreshing={messageStore.refreshing}
        onRefresh={handleRefresh}
      />
      <PlusButton />
      <CustomDeleteModal
        total={selectedMsgIds.length}
        isModalShow={isModalShow}
        onCancel={handleCancelLongPress}
        setIsModalShow={setIsModalShow}
        onPressCallApi={handleMultipleDelete}
        actionName="delete permanently"
      />
    </ContainerNew>
  );
});

export default RecycleBin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
  },
  rowContainer: {
    // height: ITEMHEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 14,
  },
  imageStyle: {
    borderRadius: 50,
    borderWidth: 1,
  },
  iconContainer: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    width: 35,
    height: 35,
    borderRadius: 35 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  headText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    color: COLORS.black,
  },
  bodyText: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.inputTextColor,
  },
  subText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginTop: 6,
    marginBottom: 3,
  },
  dateText: {
    fontSize: 10,
    fontWeight: '400',
  },
  msgText: {
    fontSize: 13,
    fontWeight: '400',
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

  itemListWrapper: {
    borderTopWidth: 1,
    marginVertical: 12,
  },
  deleteBtn: {
    position: 'absolute',
    right: '5%',
    top: '35%',
    // transform: [{translateY: -12}],
  },
  profileImage: {
    height: 40,
    width: 40,
    objectFit: 'cover',
    borderRadius: 50,
  },
  emptyListStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexGrow: {
    flexGrow: 1,
  },
});
