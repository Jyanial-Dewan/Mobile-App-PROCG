import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
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
import LongPressedHeader from '../../common/components/LongPressedHeader';
import PlusButton from '../../common/components/PlusButton';
import {formateDateTime} from '../../common/services/dateFormater';
import {useToast} from '../../common/components/CustomToast';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackScreensParms} from '~/types/navigationTs/RootStackScreenParams';
import {RenderMessageItemProps} from './InboxScreen';
import Image from 'react-native-image-fallback';
import {useSocketContext} from '../../context/SocketContext';
import CustomDeleteModal from '../../common/components/CustomDeleteModal';
import {
  renderProfilePicture,
  renderSlicedUsername,
} from '../../common/utility/notifications.utility';
import CustomFlatListThree from '../../common/components/CustomFlatListThree';
import {MessageSnapshotType} from '../../stores/messageStore';
import {toTitleCase} from '../../common/utility/general';
import Row from '../../common/components/Row';

const ITEMHEIGHT = 105;
const RenderMessageItem = ({
  item,
  userInfo,
  selectedIds,
  setSelectedIds,
  setIsLongPressed,
  handleLongPress,
  handlePress,
  handleSingleDeleteMessage,
}: RenderMessageItemProps) => {
  const screenWidth = useWindowDimensions().width;
  const SWIPE_THRESHOLD = -screenWidth * 0.6;
  const translateX = useSharedValue(0);
  const scaleX = useSharedValue(0);
  const marginY = useSharedValue(5);
  const hasExecuted = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const {datePart, timePart} = formateDateTime(item.creation_date as any);
  const {usersStore, selectedUrl} = useRootStore();
  const [openModal, setOpenModal] = useState(false);

  const url = selectedUrl || ProcgURL;
  const fallbacks = [require('../../assets/prifileImages/thumbnail.jpg')];
  const noUserFallback = [require('../../assets/prifileImages/person.png')];

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
      if (selectedIds.length > 0 && !hasExecuted.current) {
        runOnJS(setSelectedIds)([]);
        runOnJS(setIsLongPressed)(false);
        hasExecuted.current = false;
      }
      // Determine if the component should be dismissed or return to its original position
      const shouldDelete = translateX.value < SWIPE_THRESHOLD;

      if (shouldDelete) {
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
                  ? 'transparent'
                  : COLORS.white,
                borderRadius: 14,
              },
            ]}>
            <TouchableOpacity
              activeOpacity={1}
              style={[
                styles.rowContainer,
                {
                  backgroundColor: selectedIds.includes(item.notification_id)
                    ? COLORS.grayBgColor
                    : COLORS.white,
                },
              ]}
              onLongPress={() => handleLongPress(item.notification_id)}
              onPress={() =>
                handlePress(item.notification_id, item.parent_notification_id)
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
                      // uri: `${url}/${item.recivers[0]?.profile_picture}`,
                      uri: `${url}/${renderProfilePicture(item.recipients[0], usersStore.users)}`,
                      // headers: {
                      //   Authorization: `Bearer ${userInfo?.access_token}`,
                      // },
                    }}
                    fallback={
                      item.recipients.length === 0 ? noUserFallback : fallbacks
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
                      item?.recipients.length > 0
                        ? `${renderSlicedUsername(
                            item.recipients[0],
                            usersStore.users,
                            15,
                          )}${item.recipients.length > 1 ? ', ...' : ''}`
                        : '(no user)'
                    }
                    // text={
                    //   item?.recivers.length > 0 && item?.recivers[0]?.name
                    //     ? item?.recivers.length > 1
                    //       ? `${item.recivers[0].name.slice(0, 20)}${item.recivers[0].name.length > 20 ? '...' : ''}`
                    //       : item.recivers[0].name
                    //     : '(no user)'
                    // }
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
                  text={item?.subject ?? '(empty subject)'}
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
};

const DraftScreen = observer(() => {
  const isFocused = useIsFocused();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackScreensParms>>();
  const {userInfo, messageStore, selectedUrl} = useRootStore();
  const {socket, deleteMessage, multipleDeleteMessage} = useSocketContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isModalShow, setIsModalShow] = useState(false);
  const {control, setValue} = useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLongPressed, setIsLongPressed] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const route = useRoute();
  const toaster = useToast();
  const routeName = route.name;
  const [hasMore, setHasMore] = useState(0);
  const url = selectedUrl || ProcgURL;
  const limit = 50;

  useFocusEffect(
    useCallback(() => {
      setValue('routeName', {label: routeName});
    }, [isFocused]),
  );
  useAsyncEffect(
    async isMounted => {
      setIsLoading(true);
      if (!isMounted()) {
        return null;
      }

      const api_params = {
        url:
          api.DraftMessages +
          userInfo?.user_id +
          `/${currentPage}` +
          `/${limit}`,
        baseURL: url,
        // isConsole: true,
        // isConsoleParams: true,
      };
      const res = await httpRequest(api_params, setIsLoading);
      if (res) {
        setHasMore(res.length);
        const formattedRes = res.map((msg: MessageSnapshotType) => ({
          ...msg,
          creation_date: new Date(msg.creation_date),
        }));
        messageStore.saveDraftMessages(formattedRes);
        messageStore.setRefreshing(false);
      }
      if (res.length < 5) {
        setIsLoading(false);
        return;
      }
    },
    [
      socket,
      isFocused,
      currentPage,
      messageStore.draftMessages.length,
      messageStore.refreshing,
    ],
  );

  const handleRefresh = () => {
    messageStore.setRefreshing(true);
    setCurrentPage(1);
  };

  const handlePress = async (msgId: string, parentId: string) => {
    if (isLongPressed) {
      setSelectedIds(prev => [msgId, ...prev]);
    } else {
      navigation.navigate('Drafts_Detail', {
        _id: msgId,
      });
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

  const handleSingleDeleteMessage = async (msgId: string) => {
    const deleteParams = {
      url: api.DeleteMessage + msgId + `/${userInfo?.user_id}`,
      method: 'put',
      baseURL: url,
      // isConsole: true,
      // isConsoleParams: true,
    };
    try {
      setIsLoading(true);
      const response = await httpRequest(deleteParams, setIsLoading);
      deleteMessage(msgId);
      // socket?.emit('deleteMessage', {
      //   notificationId: msgId,
      //   sender: userInfo?.user_id,
      // });
      if (response) {
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
        // socket?.emit('multipleDelete', {
        //   ids: selectedIds,
        //   user: userInfo?.user_id,
        // });
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
          <MainHeader routeName={routeName} style={{fontWeight: '700'}} />
        )
      }
      style={styles.container}>
      <MessageGroups />
      <CustomFlatListThree
        data={messageStore.draftMessages}
        keyExtractor={(item: MessageSnapshotType, index: number) =>
          item.notification_id + index
        }
        RenderItems={({item}: any) => (
          <RenderMessageItem
            item={item}
            userInfo={userInfo}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
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
        emptyItem={
          !isLoading && messageStore.draftMessages.length === 0
            ? EmptyListItem
            : null
        }
        contentContainerStyle={
          messageStore.draftMessages.length === 0 ? styles.flexGrow : null
        }
        refreshing={messageStore.refreshing}
        onRefresh={handleRefresh}
      />
      <PlusButton />
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

export default DraftScreen;

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
  },
  flexGrow: {
    flexGrow: 1,
  },
});
