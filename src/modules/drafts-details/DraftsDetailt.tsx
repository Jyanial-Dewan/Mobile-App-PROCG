import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Image from 'react-native-image-fallback';
import React, {useEffect, useState} from 'react';
import ContainerNew from '../../common/components/Container';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import MainHeader from '../../common/components/MainHeader';
import {COLORS} from '../../common/constant/Themes';
import {httpRequest} from '../../common/constant/httpRequest';
import {ProcgURL, ProcgURL2} from '../../../App';
import {api} from '../../common/api/api';
import {useRootStore} from '../../stores/rootStore';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {v4 as uuidv4} from 'uuid';
import {useToast} from '../../common/components/CustomToast';
import useAsyncEffect from '../../common/packages/useAsyncEffect/useAsyncEffect';
import {observer} from 'mobx-react-lite';
import ReceiversModal from '../../common/components/ReceiversModal';
import RoundedButton from '../../common/components/RoundedButton';
import SVGController from '../../common/components/SVGController';
import {useSocketContext} from '../../context/SocketContext';
import {
  renderProfilePicture,
  renderSlicedUsername,
} from '../../common/utility/notifications.utility';
import {MessageSnapshotType} from '../../stores/messageStore';
import {AlertStoreSnapshotType} from '../../stores/alertsStore';
import {ActionItemsStoreSnapshotType} from '../../stores/actionItems';
import SelectStatusDropDown from '../../common/components/SelectStatusDropDown';
import {toTitleCase} from '../../common/utility/general';
import CustomTextNew from '../../common/components/CustomText';
import FooterSendButton from '../../common/components/FooterSendButton';
import FooterDraftButton from '../../common/components/FooterDraftButton';
import CustomDeleteModal from '../../common/components/CustomDeleteModal';
interface IOldMsgTypes {
  receivers?: number[];
  subject?: string;
  body?: string;
  alertName?: string;
  alertDescription?: string;
  actionItemName?: string;
  actionItemDescription?: string;
}
const DraftsDetails = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const {usersStore, userInfo, selectedUrl} = useRootStore();
  const {SendAlert, sendMessage, sendDraft, draftMessageId, deleteMessage} =
    useSocketContext();
  const [showModal, setShowModal] = useState(false);
  const [parentid, setParentid] = useState<string>('');
  const [notificationId, setNotificationId] = useState('');
  const [status, setStatus] = useState<string>('');
  const [recivers, setRecivers] = useState<number[]>([]);
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isAllClicked, setIsAllClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [oldMsgState, setOldMsgState] = useState<IOldMsgTypes>({});
  const [alert_id, setAlert_id] = useState<number | null>(null);
  const [alertName, setAlertName] = useState<string>('');
  const [alertDescription, setAlertDescription] = useState<string>('');
  const [action_item_id, setAction_item_id] = useState<number | null>(null);
  const [actionItemName, setActionItemName] = useState<string>('');
  const [actionItemDescription, setActionItemDescription] =
    useState<string>('');
  const [userChanged, setuserChanged] = useState<boolean>(false);
  const [isUsersModalShow, setIsUsersModalShow] = useState(false);
  const route = useRoute();
  const routeName = route.name;
  const {_id} = route.params as {_id: string};
  const date = new Date();
  const toaster = useToast();
  const url = selectedUrl || ProcgURL;
  const fallbacks = [require('../../assets/prifileImages/thumbnail.jpg')];
  const totalusers = [...recivers, userInfo?.user_id];
  const involvedusers = [...new Set(totalusers)];
  const actualUsers = usersStore.users.filter(
    usr => usr.user_id !== userInfo?.user_id,
  );
  const [notificationType, setNotificationType] = useState('');
  const filterdUser = actualUsers.filter(user =>
    user.user_name.toLowerCase().includes(query.toLowerCase()),
  );
  const urlNode = selectedUrl || ProcgURL;
  const urlPython = ProcgURL2;
  //Fetch SingleMessage
  useAsyncEffect(
    async isMounted => {
      if (!isMounted()) {
        return null;
      }
      const api_params = {
        url: api.Messages + '/' + _id,
        baseURL: urlNode,
        // isConsole: true,
        // isConsoleParams: true,
      };
      const res: MessageSnapshotType = await httpRequest(
        api_params,
        setIsLoading,
      );
      if (res) {
        setParentid(res.parent_notification_id);
        setNotificationId(res.notification_id);
        setStatus(res.status);
        setRecivers(res.recipients);
        setSubject(res.subject);
        setBody(res.notification_body);
        setOldMsgState({
          receivers: res?.recipients,
          subject: res?.subject,
          body: res?.notification_body,
        });
        setNotificationType(res.notification_type);
        setAlert_id(res.alert_id);
        setAction_item_id(res.action_item_id);
        if (res.notification_type.toLowerCase() === 'alert') {
          const api_params = {
            url: `${api.CreateAlert}/${res.alert_id}`,
            baseURL: urlNode,
            // isConsole: true,
            // isConsoleParams: true,
          };
          const alertResponse: AlertStoreSnapshotType = await httpRequest(
            api_params,
            setIsLoading,
          );
          if (alertResponse) {
            setOldMsgState((prev: any) => ({
              ...prev,
              alertName: alertResponse.alert_name,
              alertDescription: alertResponse.description,
            }));
            setAlertName(alertResponse.alert_name);
            setAlertDescription(alertResponse.description);
          }
        } else if (res.notification_type.toLowerCase() === 'action item') {
          const api_params = {
            url: `${api.ActionItem}/${res.action_item_id}`,
            baseURL: urlPython,
            access_token: userInfo?.access_token,
            // isConsole: true,
            // isConsoleParams: true,
          };
          const actionItemResponse: ActionItemsStoreSnapshotType =
            await httpRequest(api_params, setIsLoading);

          if (actionItemResponse) {
            setOldMsgState(prev => ({
              ...prev,
              actionItemName: actionItemResponse.action_item_name,
              actionItemDescription: actionItemResponse.description,
            }));
            setActionItemName(actionItemResponse.action_item_name);
            setActionItemDescription(actionItemResponse.description);
          }
        }
      }
    },
    [isFocused, _id],
  );
  useEffect(() => {
    const handleUserChange = async () => {
      if (oldMsgState?.receivers?.length ?? 0 > 0) {
        if (oldMsgState?.receivers?.length !== recivers.length) {
          setuserChanged(true);
        } else {
          oldMsgState?.receivers?.map((receiver: number) => {
            const res = recivers.every(recvr => {
              if (receiver !== recvr) {
                return true;
              } else {
                return false;
              }
            });
            setuserChanged(res);
          });
        }
      } else if (recivers.length > 0) {
        if (recivers.length !== oldMsgState?.receivers?.length) {
          setuserChanged(true);
        } else {
          recivers.map(receiver => {
            const res = oldMsgState?.receivers?.every((recvr: number) => {
              if (receiver !== recvr) {
                return true;
              } else {
                return false;
              }
            });
            setuserChanged(res ?? false);
          });
        }
      } else {
        setuserChanged(false);
      }
    };
    handleUserChange();
  }, [recivers, oldMsgState?.receivers]);

  const handleReciever = (reciever: number) => {
    if (recivers.includes(reciever)) {
      const newArray = recivers.filter(rcvr => rcvr !== reciever);
      setRecivers(newArray);
      setQuery('');
    } else {
      setRecivers(prevArray => [...prevArray, reciever]);
      setQuery('');
    }
  };

  const handleSelectAll = () => {
    if (!isAllClicked) {
      setIsAllClicked(true);
      const newReceivers = actualUsers.map(usr => usr.user_id);
      setRecivers(newReceivers);
    } else {
      setIsAllClicked(false);
      setRecivers([]);
    }
    setQuery('');
  };

  const handleX = (rcvr: number) => {
    const newRecievers = recivers.filter(r => r !== rcvr);
    setRecivers(newRecievers);
  };

  const handleSend = async () => {
    const sendPayload = {
      sender: userInfo?.user_id,
      recipients: recivers,
      subject: subject,
      notification_body: body,
      status: 'SENT',
      creation_date: new Date(),
      involved_users: involvedusers,
      readers: recivers,
      holders: involvedusers,
      recycle_bin: [],
    };

    const sendParams = {
      url: `${api.Messages}/${notificationId}`,
      data: sendPayload,
      method: 'put',
      baseURL: selectedUrl || ProcgURL,
      // isConsole: true,
      // isConsoleParams: true,
    };
    const sendNotificationPayload = {
      notificationID: notificationId,
      parentId: parentid,
      date: new Date(),
      sender: userInfo?.user_name,
      recipients: recivers,
      subject,
      body,
    };
    const sendNotificationParams = {
      url: api.SendNotification,
      data: sendNotificationPayload,
      method: 'post',
      baseURL: selectedUrl || ProcgURL,
      // isConsole: true,
      // isConsoleParams: true,
    };
    try {
      if (notificationType.toLowerCase() === 'action item') {
        const SendActionItemPayload = {
          action_item_id: action_item_id,
          action_item_name: actionItemName,
          description: actionItemDescription,
          status: 'NEW',
          user_ids: recivers,
        };
        const sendActionItemParams = {
          url: `${api.ActionItem}/upsert`,
          data: SendActionItemPayload,
          method: 'post',
          baseURL: urlPython,
          access_token: userInfo?.access_token,
          // isConsole: true,
          // isConsoleParams: true,
        };
        const resSendAction = await httpRequest(
          sendActionItemParams,
          setIsSending,
        );
        if (resSendAction) {
          const updateResponse = await httpRequest(sendParams, setIsSending);
          if (updateResponse) {
            await httpRequest(sendNotificationParams, setIsSending);
            sendMessage(notificationId);
            draftMessageId(notificationId);
            // socket?.emit('sendMessage', {
            //   notificationId: notificationId,
            //   sender: userInfo?.user_id,
            // });
            // socket?.emit('draftMsgId', {
            //   notificationId: notificationId,
            //   sender: userInfo?.user_id,
            // });
            toaster.show({
              message: updateResponse.message,
              type: 'success',
            });
          }
        }
      } else if (notificationType.toLowerCase() === 'alert') {
        const SendAlertPayload = {
          alert_name: alertName,
          description: alertDescription,
          recipients: recivers,
          last_updated_by: userInfo?.user_id,
        };
        const sendAlertParams = {
          url: `${api.CreateAlert}/${alert_id}`,
          data: SendAlertPayload,
          method: 'put',
          baseURL: urlNode,
          // isConsole: true,
          // isConsoleParams: true,
        };
        const alertResponse = await httpRequest(sendAlertParams, setIsSending);
        if (alertResponse) {
          const updateResponse = await httpRequest(sendParams, setIsSending);
          if (updateResponse) {
            await httpRequest(sendNotificationParams, setIsSending);
            SendAlert(alert_id!, recivers, false);
            // socket.emit('SendAlert', {
            //   alertId: alert_id,
            //   recipients: recivers,
            //   isAcknowledge: false,
            // });
            sendMessage(notificationId);
            draftMessageId(notificationId);
            // socket?.emit('sendMessage', {
            //   notificationId: notificationId,
            //   sender: userInfo?.user_id,
            // });
            // socket?.emit('draftMsgId', {
            //   notificationId: notificationId,
            //   sender: userInfo?.user_id,
            // });
            toaster.show({
              message: updateResponse.message,
              type: 'success',
            });
          }
        }
      } else {
        const updateResponse = await httpRequest(sendParams, setIsSending);
        if (updateResponse) {
          await httpRequest(sendNotificationParams, setIsSending);
          sendMessage(notificationId);
          draftMessageId(notificationId);
          // socket?.emit('sendMessage', {
          //   notificationId: notificationId,
          //   sender: userInfo?.user_id,
          // });
          // socket?.emit('draftMsgId', {
          //   notificationId: notificationId,
          //   sender: userInfo?.user_id,
          // });
          toaster.show({
            message: updateResponse.message,
            type: 'success',
          });
        }
      }
      setTimeout(async () => {
        setSubject('');
        setRecivers([]);
        setBody('');
        setActionItemName('');
        setActionItemDescription('');
        setAlertName('');
        setAlertDescription('');
        navigation.goBack();
      }, 500);
    } catch (error) {
      if (error instanceof Error) {
        toaster.show({message: error.message, type: 'error'});
      }
    }
  };
  // draft
  const handleDraft = async () => {
    const draftPayload = {
      sender: userInfo?.user_id,
      recipients: recivers,
      subject: subject,
      notification_body: body,
      status: 'DRAFT',
      creation_date: new Date(),
      involved_users: involvedusers,
      readers: recivers,
      holders: involvedusers,
      recycle_bin: [],
    };
    const draftParams = {
      url: `${api.Messages}/${notificationId}`,
      data: draftPayload,
      method: 'put',
      baseURL: selectedUrl || ProcgURL,
      // isConsole: true,
      // isConsoleParams: true,
    };
    try {
      if (notificationType.toLowerCase() === 'action item') {
        const SendActionItemPayload = {
          action_item_name: actionItemName,
          description: actionItemDescription,
          status: 'NEW',
          user_ids: recivers,
        };
        const sendActionItemParams = {
          url: `${api.ActionItem}/${action_item_id}`,
          data: SendActionItemPayload,
          method: 'put',
          baseURL: urlPython,
          access_token: userInfo?.access_token,
          // isConsole: true,
          // isConsoleParams: true,
        };
        const resAction = await httpRequest(
          sendActionItemParams,
          setIsDrafting,
        );
        if (resAction) {
          const draftResponse = await httpRequest(draftParams, setIsDrafting);
          if (draftResponse) {
            sendDraft(notificationId);
            // socket?.emit('sendDraft', {
            //   notificationId: notificationId,
            //   sender: draftPayload.sender,
            // });
            toaster.show({
              message: draftResponse.message,
              type: 'success',
            });
          }
        }
      } else if (notificationType.toLowerCase() === 'alert') {
        const SendAlertPayload = {
          alert_name: alertName,
          description: alertDescription,
          last_updated_by: userInfo?.user_id,
          recipients: recivers,
        };
        const draftAlertParams = {
          url: `${api.CreateAlert}/${alert_id}`,
          data: SendAlertPayload,
          method: 'put',
          baseURL: urlNode,
          // isConsole: true,
          // isConsoleParams: true,
        };
        const alertResponse = await httpRequest(
          draftAlertParams,
          setIsDrafting,
        );
        if (alertResponse) {
          const draftResponse = await httpRequest(draftParams, setIsDrafting);
          if (draftResponse) {
            SendAlert(alert_id!, recivers, false);
            // socket.emit('SendAlert', {
            //   alertId: alert_id,
            //   recipients: recivers,
            //   isAcknowledge: false,
            // });
            sendDraft(notificationId);
            // socket?.emit('sendDraft', {
            //   notificationId: notificationId,
            //   sender: draftPayload.sender,
            // });
            toaster.show({
              message: draftResponse.message,
              type: 'success',
            });
          }
        }
      } else {
        const draftResponse = await httpRequest(draftParams, setIsDrafting);
        if (draftResponse) {
          sendDraft(notificationId);
          // socket?.emit('sendDraft', {
          //   notificationId: notificationId,
          //   sender: draftPayload.sender,
          // });
          toaster.show({
            message: draftResponse.message,
            type: 'success',
          });
        }
      }

      setTimeout(async () => {
        setSubject('');
        setRecivers([]);
        setBody('');
        setActionItemName('');
        setActionItemDescription('');
        setAlertName('');
        setAlertDescription('');
        navigation.goBack();
      }, 500);
    } catch (error) {
      if (error instanceof Error) {
        toaster.show({message: error.message, type: 'error'});
      }
    }
  };

  const handleDeleteDraftMessage = async (msgId: string) => {
    const deleteParams = {
      url: api.DeleteMessage + msgId + `/${userInfo?.user_id}`,
      method: 'put',
      baseURL: selectedUrl || ProcgURL,
      // isConsole: true,
      // isConsoleParams: true,
    };
    try {
      setIsLoading(true);
      const response = await httpRequest(deleteParams, setIsLoading);
      if (response) {
        deleteMessage(notificationId);
        // socket?.emit('deleteMessage', {
        //   notificationId: msgId,
        //   sender: userInfo?.user_id,
        // });
        toaster.show({
          message: response.message,
          type: 'success',
        });
        setTimeout(async () => {
          navigation.goBack();
        }, 1000);
      }
    } catch (error) {
      if (error instanceof Error) {
        toaster.show({message: error.message, type: 'error'});
      }
    }
  };

  useEffect(() => {
    if (recivers.length === 0) {
      setShowModal(false);
    }
  }, [recivers.length]);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  return (
    <ContainerNew
      isRefresh={false}
      isKeyboardAware={true}
      isScrollView={false}
      header={
        <MainHeader
          last={
            <RoundedButton
              onPress={() => setIsOpenDeleteModal(true)}
              child={<Feather name="trash" size={24} color="black" />}
            />
          }
          routeName={
            isLoading ? 'Loading...' : `Edit ${toTitleCase(notificationType)}`
          }
        />
      }
      footer={
        <View>
          {/* draft */}
          {notificationType.toLowerCase() === 'alert' && (
            <FooterDraftButton
              handleDraft={handleDraft}
              isDrafting={isDrafting}
              disabled={
                (!userChanged &&
                  oldMsgState?.subject === subject &&
                  oldMsgState?.body === body &&
                  oldMsgState?.alertName === alertName &&
                  oldMsgState?.alertDescription === alertDescription) ||
                isLoading ||
                isDrafting
              }
              style={[
                styles.draftBtn,
                ((!userChanged &&
                  oldMsgState?.subject === subject &&
                  oldMsgState?.body === body &&
                  oldMsgState?.alertName === alertName &&
                  oldMsgState?.alertDescription === alertDescription) ||
                  isLoading ||
                  isDrafting) &&
                  styles.disabled,
              ]}
            />
          )}
          {notificationType.toLowerCase() === 'action item' && (
            <FooterDraftButton
              handleDraft={handleDraft}
              isDrafting={isDrafting}
              disabled={
                (!userChanged &&
                  oldMsgState?.subject === subject &&
                  oldMsgState?.body === body &&
                  oldMsgState?.actionItemName === actionItemName &&
                  oldMsgState?.actionItemDescription ===
                    actionItemDescription) ||
                isDrafting
              }
              style={[
                styles.draftBtn,
                ((!userChanged &&
                  oldMsgState?.subject === subject &&
                  oldMsgState?.body === body &&
                  oldMsgState?.actionItemName === actionItemName &&
                  oldMsgState?.actionItemDescription ===
                    actionItemDescription) ||
                  isDrafting) &&
                  styles.disabled,
              ]}
            />
          )}
          {notificationType.toLowerCase() === 'notification' && (
            <FooterDraftButton
              handleDraft={handleDraft}
              isDrafting={isDrafting}
              disabled={
                (!userChanged &&
                  oldMsgState?.subject === subject &&
                  oldMsgState?.body === body) ||
                isDrafting
              }
              style={[
                styles.draftBtn,
                ((!userChanged &&
                  oldMsgState?.subject === subject &&
                  oldMsgState?.body === body) ||
                  isDrafting) &&
                  styles.disabled,
              ]}
            />
          )}
          {!notificationType && (
            <FooterDraftButton
              handleDraft={() => {}}
              isDrafting={isDrafting}
              disabled={true}
              style={[styles.draftBtn, styles.disabled]}
            />
          )}
          {/* send */}
          <FooterSendButton
            handleSend={handleSend}
            isSending={isSending}
            disabled={
              !notificationType ||
              recivers.length === 0 ||
              body === '' ||
              subject === '' ||
              isSending ||
              isLoading ||
              (notificationType.toLowerCase() === 'alert' &&
                alertName === '') ||
              (notificationType.toLowerCase() === 'alert' &&
                alertDescription === '') ||
              (notificationType.toLowerCase() === 'action item' &&
                actionItemName === '') ||
              (notificationType.toLowerCase() === 'action item' &&
                actionItemDescription === '')
            }
            style={[
              styles.sentBtn,
              (!notificationType ||
                recivers.length === 0 ||
                body === '' ||
                subject === '' ||
                isSending ||
                isLoading ||
                (notificationType.toLowerCase() === 'alert' &&
                  alertName === '') ||
                (notificationType.toLowerCase() === 'alert' &&
                  alertDescription === '') ||
                (notificationType.toLowerCase() === 'action item' &&
                  actionItemName === '') ||
                (notificationType.toLowerCase() === 'action item' &&
                  actionItemDescription === '')) &&
                styles.disabled,
            ]}
          />
        </View>
      }>
      {/* delete modal  */}
      {isOpenDeleteModal && (
        <CustomDeleteModal
          isModalShow={true}
          setIsModalShow={setIsOpenDeleteModal}
          total={1}
          onPressCallApi={() => handleDeleteDraftMessage(_id)}
          onCancel={() => setIsOpenDeleteModal(false)}
          actionName="move to Recycle Bin"
        />
      )}
      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <View style={{flex: 1, marginHorizontal: 20}}>
          {/* notification selection  */}
          <View
            style={
              {
                // flexDirection: 'row',
                // justifyContent: 'space-between',
                // alignItems: 'center',
                // gap: 10,
              }
            }>
            {/*Notification Type*/}
            {/* <CustomTextNew text="Type:" txtColor={COLORS.black} /> */}
            <SelectStatusDropDown
              isDisabled={true}
              width={'100%'}
              // width={Dimensions.get('screen').width - 40}
              height={30}
              defaultValue={toTitleCase(notificationType)}
              data={[]}
              handleSelectedStatus={() => {}}
              border={true}
            />
          </View>
          {/*To*/}
          <View style={styles.lineContainerTo}>
            <View style={styles.withinLineContainer}>
              <Text
                style={{color: COLORS.darkGray}}
                onPress={() => setIsUsersModalShow(true)}>
                To
              </Text>
              <Pressable
                onPress={() => setIsUsersModalShow(true)}
                style={{width: '90%', height: 40}}
              />
            </View>
            {recivers.length > 1 && (
              <Pressable
                onPress={() => setShowModal(true)}
                style={styles.downBtnContainer}>
                <MaterialCommunityIcons
                  name="dots-horizontal"
                  size={24}
                  color="black"
                />
              </Pressable>
            )}
            {/** Extra Recievers */}
            <ReceiversModal
              showModal={showModal}
              handleX={handleX}
              setShowModal={setShowModal}
              recivers={recivers}
              isHandleX={true}
            />
          </View>
          {/* user popup modal  */}
          <Modal
            visible={isUsersModalShow}
            transparent
            animationType="fade"
            onRequestClose={() => setIsUsersModalShow(false)}>
            <TouchableWithoutFeedback
              onPress={() => setIsUsersModalShow(false)}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={() => {}}>
                  <View
                    style={[
                      styles.modalContent,
                      {
                        position: 'absolute',
                        top: 140,
                        left: 20,
                      },
                    ]}>
                    <TextInput
                      autoFocus
                      style={{
                        fontSize: 16,
                        height: 40,
                        width: '90%',
                        color: COLORS.black,
                      }}
                      placeholder="Search recipient"
                      placeholderTextColor={COLORS.black}
                      value={query}
                      onChangeText={text => {
                        setQuery(text);
                      }}
                    />
                    <ScrollView scrollEnabled={true} style={{height: 300}}>
                      <Pressable
                        style={[
                          styles.selectPress,
                          {
                            borderBottomColor: COLORS.lightGray,
                            borderBottomWidth: 0.5,
                          },
                        ]}
                        onPress={handleSelectAll}>
                        <Text style={[styles.item]}>Select All</Text>
                        {isAllClicked && (
                          <AntDesign
                            name="check"
                            size={20}
                            color={COLORS.black}
                          />
                        )}
                      </Pressable>

                      {filterdUser.map((usr, index) => (
                        <TouchableOpacity
                          onPress={() => handleReciever(usr.user_id)}
                          key={usr.user_id}>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              borderBottomColor:
                                index !== filterdUser.length - 1
                                  ? COLORS.lightGray
                                  : 'transparent',
                              borderBottomWidth: 0.5,
                            }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                gap: 6,
                                alignItems: 'center',
                              }}>
                              <Image
                                style={styles.profileImage}
                                source={{
                                  uri: `${urlNode}/${usr.profile_picture.thumbnail}`,
                                  // headers: {
                                  //   Authorization: `Bearer ${userInfo?.access_token}`,
                                  // },
                                }}
                                fallback={fallbacks}
                              />
                              <Text style={[styles.item]}>
                                {usr?.user_name}
                              </Text>
                            </View>
                            <View style={styles.itemListWrapper} />
                            {recivers.includes(usr.user_id) && (
                              <AntDesign
                                name="check"
                                size={20}
                                color={COLORS.black}
                              />
                            )}
                          </View>
                        </TouchableOpacity>
                      ))}

                      {filterdUser?.length === 0 && (
                        <View style={styles.noData}>
                          <Text style={[styles.noItem]}>No Data Found</Text>
                        </View>
                      )}
                    </ScrollView>
                    <ScrollView scrollEnabled={true}></ScrollView>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
          {/* show single user  */}
          {recivers.length !== 0 ? (
            <View style={{flexDirection: 'row'}}>
              <View style={styles.singleRcvr}>
                <View style={styles.withinSinglRcve}>
                  <Image
                    style={styles.profileImage}
                    source={{
                      uri: `${url}/${renderProfilePicture(recivers[recivers.length - 1], usersStore.users)}`,
                      // headers: {
                      //   Authorization: `Bearer ${userInfo?.access_token}`,
                      // },
                    }}
                    fallback={fallbacks}
                  />
                  <Text style={styles.textGreen}>
                    {renderSlicedUsername(
                      recivers[recivers.length - 1],
                      usersStore.users,
                      30,
                    )}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleX(recivers[recivers.length - 1])}>
                  <Feather name="x" size={16} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View
              style={{
                width: '100%',
                height: 0.5,
                backgroundColor: COLORS.lightGray5,
              }}></View>
          )}
          {/*Subject*/}
          <View style={styles.lineContainer}>
            <Text style={{color: COLORS.darkGray}}>Subject</Text>
            <TextInput
              style={{height: 40, width: '80%', color: COLORS.black}}
              value={subject}
              maxLength={100}
              onChangeText={text => setSubject(text)}
            />
          </View>
          {/*Body*/}
          <View style={styles.lineContainerBody}>
            <TextInput
              style={[
                styles.textInputBody,
                {
                  height:
                    notificationType.toLowerCase() === 'notification'
                      ? 400
                      : 200,
                },
              ]}
              placeholderTextColor={COLORS.darkGray}
              placeholder="Body"
              value={body}
              onChangeText={text => setBody(text)}
              multiline={true}
            />
          </View>
          {/* Action Item   */}
          {notificationType.toLowerCase() === 'action item' && (
            <>
              <View
                style={[
                  styles.withinLineContainer,
                  {
                    width: '100%',
                    borderBottomWidth: 0.5,
                    borderBottomColor: COLORS.lightGray5,
                  },
                ]}>
                <Text style={{color: COLORS.darkGray}}>Name</Text>
                <TextInput
                  style={{height: 40, width: '90%', color: COLORS.black}}
                  value={actionItemName}
                  maxLength={100}
                  onChangeText={text => setActionItemName(text)}
                />
              </View>
              <View style={styles.lineContainerBody}>
                <TextInput
                  style={styles.textInputBody}
                  placeholder="Description"
                  value={actionItemDescription}
                  onChangeText={text => setActionItemDescription(text)}
                  multiline={true}
                  // numberOfLines={10}
                  placeholderTextColor={COLORS.darkGray}
                />
              </View>
            </>
          )}

          {/* Alert  */}
          {notificationType.toLowerCase() === 'alert' && (
            <>
              <View
                style={[
                  styles.withinLineContainer,
                  {
                    width: '100%',
                    borderBottomWidth: 0.5,
                    borderBottomColor: COLORS.lightGray5,
                  },
                ]}>
                <Text style={{color: COLORS.darkGray}}>Name</Text>
                <TextInput
                  style={{height: 40, width: '90%', color: COLORS.black}}
                  value={alertName}
                  maxLength={100}
                  onChangeText={text => setAlertName(text)}
                />
              </View>
              <View style={styles.lineContainerBody}>
                <TextInput
                  multiline={true}
                  // numberOfLines={10}
                  style={styles.textInputBody}
                  placeholder="Description"
                  value={alertDescription}
                  onChangeText={text => setAlertDescription(text)}
                  placeholderTextColor={COLORS.darkGray}
                />
              </View>
            </>
          )}
        </View>
      )}
    </ContainerNew>
  );
};

export default observer(DraftsDetails);

const styles = StyleSheet.create({
  lineContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomColor: COLORS.lightGray5,
    borderBottomWidth: 0.5,
    paddingBottom: 2,
  },
  lineContainerTo: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    borderBottomColor: COLORS.lightGray5,
    paddingBottom: 2,
  },

  lineContainerBody: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomColor: COLORS.lightGray5,
    borderBottomWidth: 0.5,
    paddingBottom: 2,
  },
  withinLineContainer: {
    width: '90%',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  textInputBody: {
    minHeight: 160,
    textAlignVertical: 'top',
    width: '100%',
    color: COLORS.black,
  },
  disabled: {
    backgroundColor: 'rgba(55, 134, 230, 0.15)',
  },
  sentBtn: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: COLORS.primaryBtn,
    padding: 8,
    borderRadius: 99,
    // iOS Shadow
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 4},
    // shadowOpacity: 0.3,
    // shadowRadius: 4,

    // Android Shadow
    // elevation: 5,
  },
  draftBtn: {
    position: 'absolute',
    right: 70,
    bottom: 20,
    backgroundColor: COLORS.primaryBtn,
    padding: 8,
    borderRadius: 99,
    // iOS Shadow
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 4},
    // shadowOpacity: 0.3,
    // shadowRadius: 4,

    // Android Shadow
    // elevation: 5,
  },
  noData: {alignItems: 'center', justifyContent: 'center'},
  noItem: {
    paddingVertical: 15,
    fontSize: 17,
  },
  item: {
    fontSize: 17,
    color: COLORS.blackish,
    paddingVertical: 4,
  },
  itemListWrapper: {
    borderTopWidth: 1,
    borderColor: '#E4E9F2',
    marginTop: 8,
  },
  selectPress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  singleRcvr: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 0.5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    borderRadius: 6,
  },
  withinSinglRcve: {flexDirection: 'row', gap: 5, alignItems: 'center'},
  textGreen: {
    color: COLORS.textGreen,
    fontSize: 13,
    fontWeight: '500',
  },
  downBtnContainer: {
    height: 24,
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.border,
    borderRadius: 4,
  },
  profileImage: {
    width: 24,
    height: 24,
    borderRadius: 50,
    backgroundColor: COLORS.iconGrayBackground,
    borderWidth: 1,
    borderColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    // width: 333,
    width: '70%',
    padding: 6,
    borderRadius: 10,
    // maxHeight: 60,
    position: 'absolute',
    top: 66,
    left: 20,
    zIndex: 99999,
    // borderBlockColor: '#b1b1b1ff',
    // borderWidth: 0.5,
  },
});
