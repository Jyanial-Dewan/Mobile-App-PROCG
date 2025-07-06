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
import ContainerNew from '../../common/components/Container';
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
import PlusButton from '../../common/components/PlusButton';
import CustomDeleteModal from '../../common/components/CustomDeleteModal';
import {formateDateTime} from '../../common/services/dateFormater';
import {useToast} from '../../common/components/CustomToast';
import CustomTextNew from '../../common/components/CustomText';
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
import {useSocketContext} from '../../context/SocketContext';

interface RenderMessageItemProps {
  item: any;
  userInfo: any;
  selectedIds: string[];
  handleLongPress: (id: string) => void;
  handlePress: (msgId: string, parentId: string) => Promise<void>;
  handleDeleteFromRecycleBin: (msg: any) => Promise<void>;
}

const ITEMHEIGHT = 95;

const RenderMessageItem = observer(
  ({
    item,
    userInfo,
    selectedIds,
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
            actionName="delete permanently"
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
                    backgroundColor: selectedIds.includes(item?.id)
                      ? COLORS.grayBgColor
                      : COLORS.white,
                  },
                ]}
                onLongPress={() => handleLongPress(item?.id)}
                onPress={() => handlePress(item?.id, item?.parentid)}>
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
                        uri: `${url}/${item.sender.profile_picture}`,
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
                      text={item?.sender.name}
                    />
                    <View style={{flexDirection: 'row', gap: 5}}>
                      <CustomTextNew
                        txtStyle={[styles.dateText, {color: COLORS.black}]}
                        text={datePart}
                      />
                      <CustomTextNew
                        txtStyle={styles.dateText}
                        text={timePart}
                      />
                    </View>
                  </View>

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
                        : item?.body.replace(/\s+/g, ' ')
                    }
                  />
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
  const {socket} = useSocketContext();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(0);
  const [isLongPressed, setIsLongPressed] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalShow, setIsModalShow] = useState(false);
  const route = useRoute();
  const routeName = route.name;
  const toaster = useToast();
  const {control, setValue} = useForm();
  const url = selectedUrl || ProcgURL;

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
        url: api.RecycleBinMessages + userInfo?.user_name + `/${currentPage}`,
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
        messageStore.saveBinMessages(formattedRes);
        setIsLoading(false);
      }
      if (res.length < 5) {
        setIsLoading(false);
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

  const handlePress = async (msgId: string, parentId: string) => {
    if (isLongPressed) {
      setSelectedIds(prev => [msgId, ...prev]);
    } else {
      navigation.navigate('Recycle_Bin_Detail', {
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
  };

  const handleCancelLongPress = () => {
    setIsModalShow(false);
    setIsLongPressed(false);
    setSelectedIds([]);
  };

  const handleMultipleDelete = async () => {
    const params = {
      url: api.MoveMultipleFromRecycleBin + userInfo?.user_name,
      data: {ids: selectedIds},
      method: 'put',
      baseURL: url,
      // isConsole: true,
      // isConsoleParams: true,
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

  const handleDeleteFromRecycleBin = async (msg: any) => {
    const putParams = {
      url: api.DeleteFromRecycle + msg.id + `/${userInfo?.user_name}`,
      method: 'put',
      baseURL: url,
      isConsole: true,
      isConsoleParams: true,
    };
    const deleteParams = {
      url: api.Messages + '/' + msg.id,
      method: 'delete',
      baseURL: url,
      isConsole: true,
      isConsoleParams: true,
    };
    try {
      const holdersNumber = msg.holders?.length ?? 0;
      const recycleBinNumber = msg.recyclebin?.length ?? 0;
      if (holdersNumber > 0) {
        const response = await httpRequest(putParams, setIsLoading);
        if (response) {
          socket?.emit('deleteMessage', {
            id: msg.id,
            user: userInfo?.user_name,
          });
          toaster.show({
            message: 'Message has been deleted.',
            type: 'success',
          });
        }
      } else {
        if (recycleBinNumber > 1) {
          const response = await httpRequest(putParams, setIsLoading);
          if (response) {
            socket?.emit('deleteMessage', {
              id: msg.id,
              user: userInfo?.user_name,
            });
            toaster.show({
              message: 'Message has been deleted.',
              type: 'success',
            });
          }
        } else if (recycleBinNumber === 1) {
          const response = await httpRequest(deleteParams, setIsLoading);
          if (response) {
            socket?.emit('deleteMessage', {
              id: msg.id,
              user: userInfo?.user_name,
            });
            toaster.show({
              message: 'Message has been deleted.',
              type: 'success',
            });
          }
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
        isLongPressed ? (
          <LongPressedHeader
            from={route.name}
            handleCancelLongPress={handleCancelLongPress}
            handleShowModal={() => setIsModalShow(true)}
          />
        ) : (
          <MainHeader routeName={routeName} style={{fontWeight: '700'}} />
        )
      }
      style={styles.container}>
      <MessageGroups />
      <CustomFlatList
        // key={messageStore.binMessages.length}
        data={messageStore.binMessages}
        numColumns={1}
        RenderItems={({item}: any) => (
          <RenderMessageItem
            item={item}
            userInfo={userInfo}
            selectedIds={selectedIds}
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
        total={selectedIds.length}
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    height: ITEMHEIGHT,
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
