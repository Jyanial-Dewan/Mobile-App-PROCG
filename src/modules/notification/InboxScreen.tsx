import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import ContainerNew from '../../common/components/Container';
import CustomTextNew from '../../common/components/CustomText';
import useAsyncEffect from '../../common/packages/useAsyncEffect/useAsyncEffect';
import {useRootStore} from '../../stores/rootStore';
import {COLORS} from '../../common/constant/Themes';
import CustomFlatList from '../../common/components/CustomFlatList';
import MainHeader from '../../common/components/MainHeader';
import {_todayDate} from '../../common/services/todayDate';
import {api} from '../../common/api/api';
import {ProcgURL} from '../../../App';
import {httpRequest} from '../../common/constant/httpRequest';
import Feather from 'react-native-vector-icons/Feather';
import CustomDropDownNew from '../../common/components/CustomDropDownTwo';
import {useForm} from 'react-hook-form';
import {observer} from 'mobx-react-lite';
import {NotificationDetailsNavigationProp} from '../../navigations/NotificationStack';
import LongPressedHeader from '../../common/components/LongPressedHeader';
import {useToast} from '../../common/components/CustomToast';
import PlusButton from '../../common/components/PlusButton';
import {formateDateTime} from '../../common/services/dateFormater';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Image from 'react-native-image-fallback';
import {useSocketContext} from '../../context/SocketContext';
import CustomDeleteModal from '../../common/components/CustomDeleteModal';
import {
  renderProfilePicture,
  renderSlicedUsername,
} from '../../common/utility/notifications.utility';
import {MessageSnapshotType} from '../../stores/messageStore';
import CustomFlatListThree from '../../common/components/CustomFlatListThree';
import {toTitleCase} from '../../common/utility/general';
import Row from '../../common/components/Row';

export interface RenderMessageItemProps {
  item: MessageSnapshotType;
  userInfo: any;
  selectedIds: string[];
  notificationIds?: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  handleLongPress: (id: string) => void;
  handlePress: (msgId: string, parentId: string) => Promise<void>;
  setIsLongPressed: React.Dispatch<React.SetStateAction<boolean>>;
  handleSingleDeleteMessage: (msg: any) => Promise<void>;
}
const ITEMHEIGHT = 90;
const RenderMessageItem = ({
  item,
  userInfo,
  selectedIds,
  notificationIds,
  setSelectedIds,
  setIsLongPressed,
  handleLongPress,
  handlePress,
  handleSingleDeleteMessage,
}: RenderMessageItemProps) => {
  const {usersStore} = useRootStore();
  const screenWidth = useWindowDimensions().width;
  const SWIPE_THRESHOLD = -screenWidth * 0.6;
  const translateX = useSharedValue(0);
  const marginY = useSharedValue(10);
  const scaleX = useSharedValue(0);
  const hasExecuted = useRef(false);
  const [loaded, setLoaded] = useState(false);
  // const {datePart, timePart} = formateDateTime(item.creation_date as any);
  const {selectedUrl} = useRootStore();
  const [openModal, setOpenModal] = useState(false);

  const url = selectedUrl || ProcgURL;
  const fallbacks = [require('../../assets/prifileImages/thumbnail.jpg')];

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
    handleSingleDeleteMessage(item.notification_id);
    marginY.value = withTiming(0);
    scaleX.value = withTiming(0);
  };

  const panGesture = Gesture.Pan()
    .failOffsetY([-5, 5])
    .activeOffsetX([-5, 5])
    .onUpdate(event => {
      // Update the position of the component based on the gesture
      translateX.value = event.translationX;
      if (selectedIds.length > 0 && !hasExecuted.current) {
        runOnJS(setSelectedIds)([]);
        runOnJS(setIsLongPressed)(false);
        hasExecuted.current = true;
      }
    })
    .onEnd(() => {
      console.log(scaleX.value);
      if (selectedIds.length > 0 && !hasExecuted.current) {
        runOnJS(setSelectedIds)([]);
        runOnJS(setIsLongPressed)(false);
        hasExecuted.current = false;
      }
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
      marginTop: marginY.value,
    };
  });
  const animatedHeight = !loaded ? {} : height;

  const backgroundColor = selectedIds.includes(item.notification_id)
    ? 'transparent'
    : COLORS.primaryRed;

  return (
    <View style={{paddingVertical: 5}}>
      {openModal && (
        <CustomDeleteModal
          isModalShow={openModal}
          setIsModalShow={setOpenModal}
          total={1}
          onPressCallApi={() => handleDelete()}
          onCancel={() => onCancel()}
          actionName="move to Recycle Bin"
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
                  ? COLORS.grayBgColor
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
              onLongPress={() => handleLongPress(item?.notification_id)}
              onPress={() =>
                handlePress(item?.notification_id, item?.parent_notification_id)
              }>
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
                      uri: `${url}/${renderProfilePicture(item.sender, usersStore.users)}`,
                      // uri: `${url}/${item.sender.profile_picture}`,
                      // headers: {
                      //   Authorization: `Bearer ${userInfo?.access_token}`,
                      // },
                    }}
                    fallback={fallbacks}
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
                    text={renderSlicedUsername(
                      item.sender,
                      usersStore.users,
                      24,
                    )}
                  />
                  <View style={{flexDirection: 'row', gap: 5}}>
                    <CustomTextNew
                      txtStyle={[styles.dateText, {color: COLORS.black}]}
                      text={item.creation_date.toLocaleString()}
                    />
                  </View>
                </View>
                <Row>
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
                </Row>

                <CustomTextNew
                  txtStyle={styles.subText}
                  txtAlign="justify"
                  // text={`${item?.subject.slice(0, 50)}${item?.subject?.length > 50 ? '...' : ''}`}
                  text={item?.subject}
                />
                {/* <CustomTextNew
                  txtStyle={styles.bodyText}
                  txtAlign="justify"
                  text={
                    item?.body?.length > 50
                      ? item?.body?.replace(/\s+/g, ' ').slice(0, 50) + '...'
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
};

const InboxScreen = observer(() => {
  const isFocused = useIsFocused();
  const {userInfo, messageStore, selectedUrl} = useRootStore();
  const {socket, readMessage, deleteMessage, multipleDeleteMessage} =
    useSocketContext();
  const navigation = useNavigation<NotificationDetailsNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLongPressed, setIsLongPressed] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(0);
  const notificationIds = messageStore.notificationMessages.map(
    msg => msg.notification_id,
  );
  const [isModalShow, setIsModalShow] = useState(false);
  const route = useRoute();
  const toaster = useToast();
  const url = selectedUrl || ProcgURL;
  const limit = 10;
  const {control, setValue} = useForm({
    defaultValues: {
      routeName: {label: route.name},
    },
  });

  useFocusEffect(
    useCallback(() => {
      setValue('routeName', {label: route.name});
    }, [isFocused]),
  );
  useAsyncEffect(
    async isMounted => {
      if (!isMounted()) {
        return null;
      }
      setIsLoading(true);
      const api_params = {
        url: `${api.ReceivedMessages}/received?user_id=${userInfo?.user_id}&page=${currentPage}&limit=${limit}`,
        baseURL: url,
        // isConsole: true,
        // isConsoleParams: true,
      };
      const res = await httpRequest(api_params, setIsLoading);
      if (res) {
        setHasMore(res.result.length);
        if (currentPage === 1) {
          messageStore.initialReceivedMessages(res.result ?? []);
        } else {
          messageStore.saveReceivedMessages(res.result ?? []);
        }
        messageStore.setRefreshing(false);
        messageStore.setTotalReceived(res.total ?? 0);
      }

      if (res.result.length < 5) {
        return;
      }
    },
    [
      isFocused,
      currentPage,
      messageStore.receivedMessages.length,
      messageStore.refreshing,
    ],
  );

  const handleRefresh = () => {
    messageStore.setRefreshing(true);
    setCurrentPage(1);
  };

  // read Message
  const handlePress = async (msgId: string, parentId: string) => {
    if (isLongPressed) {
      setSelectedIds(prev => [msgId, ...prev]);
    } else {
      const readerParams = {
        url: `${api.UpdateReaders}?parent_notification_id=${parentId}&user_id=${userInfo?.user_id}`,
        method: 'put',
        baseURL: url,
        // isConsole: true,
        // isConsoleParams: true,
      };
      try {
        const response = await httpRequest(readerParams, setIsLoading);
        if (response) {
          if (notificationIds.includes(parentId)) {
            readMessage(parentId);
          }
          navigation.navigate('NotificationDetails', {
            _id: parentId,
          });
        }
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message);
        }
      }
    }
    if (selectedIds.includes(msgId)) {
      handleDisSelect(msgId);
    }
  };

  const handleLongPress = (id: string) => {
    setIsLongPressed(true);
    setSelectedIds(prev => [id, ...prev]);
  };

  const handleDisSelect = (id: string) => {
    const newSelected = selectedIds.filter(item => item !== id);
    setSelectedIds(newSelected);
    if (newSelected.length === 0 || !newSelected) setIsLongPressed(false);
  };

  const handleCancelLongPress = () => {
    setIsLongPressed(false);
    setSelectedIds([]);
    setIsModalShow(false);
  };
  const removeNotificationMessage = (ids: string[]) => {
    for (const id of ids) {
      messageStore.removeNotificationMessage(id);
    }
  };
  const handleSingleDeleteMessage = async (msgId: string) => {
    const deleteParams = {
      url: `${api.DeleteMessage}?notification_id=${msgId}&user_id=${userInfo?.user_id}`,
      method: 'put',
      baseURL: url,
      // isConsole: true,
      // isConsoleParams: true,
    };

    try {
      const response = await httpRequest(deleteParams, setIsLoading);
      if (response) {
        deleteMessage(msgId, 'Inbox');
        toaster.show({
          message: response.message,
          type: 'success',
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        toaster.show({message: error.message, type: 'error'});
      }
    }
  };

  const handleMultipleDelete = async () => {
    const params = {
      url: api.MoveMultipleToRecycleBin + userInfo?.user_id,
      data: {ids: selectedIds},
      method: 'put',
      baseURL: url,
      // isConsole: true,
      // isConsoleParams: true,
    };
    try {
      const response = await httpRequest(params, setIsLoading);
      if (response) {
        multipleDeleteMessage(selectedIds);
        toaster.show({
          message: response.message,
          type: 'success',
        });
        setIsLongPressed(false);
        setSelectedIds([]);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
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

  // const renderInboxMessages = useCallback(
  //   ({item}: any) => {
  //     <RenderMessageItem
  //       item={item}
  //       userInfo={userInfo}
  //       selectedIds={selectedIds}
  //       setSelectedIds={setSelectedIds}
  //       notificationIds={notificationIds}
  //       setIsLongPressed={setIsLongPressed}
  //       handleLongPress={handleLongPress}
  //       handlePress={handlePress}
  //       handleSingleDeleteMessage={handleSingleDeleteMessage}
  //     />;
  //   },
  //   [messageStore.refreshing],
  // );

  return (
    <ContainerNew
      isRefresh={true}
      isScrollView={false}
      backgroundColor={COLORS.lightBackground}
      header={
        isLongPressed && selectedIds.length ? (
          <LongPressedHeader
            from={route.name}
            selectedIds={selectedIds}
            handleCancelLongPress={handleCancelLongPress}
            handleShowModal={() => setIsModalShow(true)}
          />
        ) : (
          <MainHeader routeName="Inbox" style={{fontWeight: '700'}} />
        )
      }
      footer={<PlusButton />}
      style={styles.container}>
      <MessageGroups />
      <CustomFlatListThree
        data={messageStore.receivedMessages}
        keyExtractor={(item: MessageSnapshotType, index: number) =>
          item.notification_id + index
        }
        RenderItems={({item}: any) => (
          <RenderMessageItem
            item={item}
            userInfo={userInfo}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            notificationIds={notificationIds}
            setIsLongPressed={setIsLongPressed}
            handleLongPress={handleLongPress}
            handlePress={handlePress}
            handleSingleDeleteMessage={handleSingleDeleteMessage}
          />
        )}
        isLoading={isLoading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        hasMore={hasMore}
        contentContainerStyle={
          messageStore.sentMessages.length === 0 ? styles.flexGrow : null
        }
        emptyItem={
          !isLoading && messageStore.receivedMessages.length === 0
            ? EmptyListItem
            : null
        }
        refreshing={messageStore.refreshing}
        onRefresh={handleRefresh}
      />
      <CustomDeleteModal
        total={selectedIds.length}
        isModalShow={isModalShow}
        onCancel={handleCancelLongPress}
        setIsModalShow={setIsModalShow}
        onPressCallApi={handleMultipleDelete}
        actionName="move to Recycle Bin"
      />
    </ContainerNew>
  );
});

export default InboxScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  rowContainer: {
    // height: ITEMHEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 14,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
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
    top: '40%',
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
    marginTop: 20,
  },
  flexGrow: {
    flexGrow: 1,
  },
  badgeText: {
    width: 'auto',
    fontSize: 12,
    // fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: '#f4f4f4be',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    flexDirection: 'column',
  },
});
