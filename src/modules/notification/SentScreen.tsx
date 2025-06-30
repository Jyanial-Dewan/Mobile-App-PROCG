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
import ContainerNew from '../../common/components/Container';
import CustomTextNew from '../../common/components/CustomText';
import useAsyncEffect from '../../common/packages/useAsyncEffect/useAsyncEffect';
import {useRootStore} from '../../stores/rootStore';
import Feather from 'react-native-vector-icons/Feather';
import {COLORS} from '../../common/constant/Themes';
import CustomFlatList from '../../common/components/CustomFlatList';
import MainHeader from '../../common/components/MainHeader';
import {_todayDate} from '../../common/services/todayDate';
import {api} from '../../common/api/api';
import {ProcgURL} from '../../../App';
import {httpRequest} from '../../common/constant/httpRequest';
import CustomDropDownNew from '../../common/components/CustomDropDownTwo';
import {useForm} from 'react-hook-form';
import {NotificationDetailsNavigationProp} from '../../navigations/NotificationStack';
import {observer} from 'mobx-react-lite';
import LongPressedHeader from '../../common/components/LongPressedHeader';
import PlusButton from '../../common/components/PlusButton';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {formateDateTime} from '../../common/services/dateFormater';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {useToast} from '../../common/components/CustomToast';
import {RenderMessageItemProps} from './InboxScreen';
import Image from 'react-native-image-fallback';
import {useSocketContext} from '../../context/SocketContext';
import CustomDeleteModal from '../../common/components/CustomDeleteModal';

const ITEMHEIGHT = 95;

const RenderMessageItem = ({
  item,
  selectedIds,
  setIsLongPressed,
  setSelectedIds,
  userInfo,
  handleLongPress,
  handlePress,
  handleSingleDeleteMessage,
}: RenderMessageItemProps) => {
  const screenWidth = useWindowDimensions().width;
  const SWIPE_THRESHOLD = -screenWidth * 0.6;
  const translateX = useSharedValue(0);
  const marginY = useSharedValue(10);
  const scaleX = useSharedValue(0);
  const hasExecuted = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const {datePart, timePart} = formateDateTime(item.date);
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
    handleSingleDeleteMessage(item.id);
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
      marginTop: marginY.value,
    };
  });

  const animatedHeight = !loaded ? {} : height;

  const backgroundColor = selectedIds.includes(item.id)
    ? 'transparent'
    : COLORS.primaryRed;
  return (
    <View>
      {openModal && (
        <CustomDeleteModal
          isModalShow={openModal}
          setIsModalShow={setOpenModal}
          total={1}
          onPressCallApi={() => handleDelete()}
          onCancel={() => onCancel()}
          deleteMessage="Are you sure you want to move to Recycle Bin?"
        />
      )}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[animatedHeight, {backgroundColor, borderRadius: 15}]}
          onLayout={e => {
            if (!loaded) {
              scaleX.value = ITEMHEIGHT;
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
                backgroundColor: selectedIds.includes(item?.id)
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
                  backgroundColor: selectedIds.includes(item.id)
                    ? COLORS.grayBgColor
                    : COLORS.white,
                },
              ]}
              onLongPress={() => handleLongPress(item.id)}
              onPress={() => handlePress(item.id, item.parentid)}>
              {/* Image Section */}
              <View
                style={[
                  styles.imageStyle,
                  {
                    borderColor: COLORS.notifcationIconBorder,
                    backgroundColor: COLORS.white,
                  },
                ]}>
                {selectedIds.includes(item.id) ? (
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
                      uri: `${url}/${item.recivers[0].profile_picture}`,
                      headers: {
                        Authorization: `Bearer ${userInfo?.access_token}`,
                      },
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
                    text={
                      item.recivers.length > 1
                        ? `${item.recivers[0].name} ...`
                        : item.recivers[0].name
                    }
                  />
                  <View style={{flexDirection: 'row', gap: 5}}>
                    <CustomTextNew
                      txtStyle={[styles.dateText, {color: COLORS.black}]}
                      text={datePart}
                    />
                    <CustomTextNew txtStyle={styles.dateText} text={timePart} />
                  </View>
                </View>
                {/* <View
                style={[
                  styles.itemListWrapper,
                  {
                    borderColor: selectedIds.includes(item?.id)
                      ? COLORS.white
                      : '#E4E9F2',
                  },
                ]}
              /> */}
                <CustomTextNew
                  txtStyle={styles.subText}
                  txtAlign="justify"
                  text={item?.subject}
                />
                <CustomTextNew
                  txtStyle={styles.bodyText}
                  txtAlign="justify"
                  text={
                    item?.body?.length > 60
                      ? item?.body?.replace(/\s+/g, ' ').slice(0, 60) + '...'
                      : item?.body?.replace(/\s+/g, ' ')
                  }
                />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const SentScreen = observer(() => {
  const isFocused = useIsFocused();
  const navigation = useNavigation<NotificationDetailsNavigationProp>();
  const {userInfo, messageStore, selectedUrl} = useRootStore();
  const {socket} = useSocketContext();
  const [isLoading, setIsLoading] = useState(false);
  const {control, setValue} = useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(0);
  const [isLongPressed, setIsLongPressed] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const route = useRoute();
  const toaster = useToast();
  const url = selectedUrl || ProcgURL;

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
      if (messageStore.sentMessages.length === messageStore.totalSent) {
        return;
      }
      const api_params = {
        url: api.SentMessages + userInfo?.user_name + `/${currentPage}`,
        baseURL: url,
        // isConsole: true,
        // isConsoleParams: true,
      };
      const res = await httpRequest(api_params, setIsLoading);
      if (res) {
        setHasMore(res.length);
        const formattedRes = res.map((msg: any) => ({
          ...msg,
          date: new Date(msg.date),
        }));

        messageStore.saveSentMessages(formattedRes);
      }
      if (res.length < 5) {
        return;
      }
    },
    [
      isFocused,
      currentPage,
      messageStore.sentMessages.length,
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
      navigation.navigate('NotificationDetails', {
        _id: parentId,
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
  };

  const handleCancelLongPress = () => {
    setIsLongPressed(false);
    setSelectedIds([]);
  };

  const handleSingleDeleteMessage = async (msgId: string) => {
    const deleteParams = {
      url: api.DeleteMessage + msgId + `/${userInfo?.user_name}`,
      method: 'put',
      baseURL: url,
      isConsole: true,
      isConsoleParams: true,
    };
    try {
      setIsLoading(true);
      const response = await httpRequest(deleteParams, setIsLoading);
      if (response) {
        socket?.emit('deleteMessage', {id: msgId, user: userInfo?.user_name});
        toaster.show({
          message: 'Message has been moved to recyclebin.',
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
      url: api.MoveMultipleToRecycleBin + userInfo?.user_name,
      data: {ids: selectedIds},
      method: 'put',
      baseURL: url,
      isConsole: true,
      isConsoleParams: true,
    };
    try {
      const response = await httpRequest(params, setIsLoading);
      if (response) {
        socket?.emit('multipleDelete', {
          ids: selectedIds,
          user: userInfo?.user_name,
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
      isScrollView={false}
      backgroundColor={COLORS.lightBackground}
      header={
        isLongPressed ? (
          <LongPressedHeader
            handleCancelLongPress={handleCancelLongPress}
            handleMultipleDelete={handleMultipleDelete}
          />
        ) : (
          <MainHeader routeName="Sent" style={{fontWeight: '700'}} />
        )
      }
      footer={<PlusButton />}
      style={styles.container}>
      <MessageGroups />
      <CustomFlatList
        // key={messageStore.sentMessages.length}
        data={messageStore.sentMessages}
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
        hasMore={hasMore}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        contentContainerStyle={
          messageStore.sentMessages.length === 0 ? styles.flexGrow : null
        }
        refreshing={messageStore.refreshing}
        onRefresh={handleRefresh}
        emptyItem={EmptyListItem}
      />
    </ContainerNew>
  );
});

export default SentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
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
