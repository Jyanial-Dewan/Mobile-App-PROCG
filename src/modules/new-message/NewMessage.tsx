import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import ContainerNew from '../../common/components/Container';
import MainHeader from '../../common/components/MainHeader';
import {useNavigation, useRoute} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import {COLORS} from '../../common/constant/Themes';
import {useRootStore} from '../../stores/rootStore';
import {useToast} from '../../common/components/CustomToast';
import {httpRequest} from '../../common/constant/httpRequest';
import {api} from '../../common/api/api';
import {ProcgURL, ProcgURL2} from '../../../App';
import {v4 as uuidv4} from 'uuid';
import ReceiversModal from '../../common/components/ReceiversModal';
import SVGController from '../../common/components/SVGController';
import Image from 'react-native-image-fallback';
import {useSocketContext} from '../../context/SocketContext';
import {
  renderProfilePicture,
  renderUserName,
} from '../../common/utility/notifications.utility';
import SelectStatusDropDown from '../../common/components/SelectStatusDropDown';
import {toTitleCase} from '../../common/utility/general';

interface User {
  name: string;
  profile_picture: string;
}

const NewMessage = () => {
  const {name} = useRoute();
  const {usersStore, userInfo, selectedUrl} = useRootStore();
  const {socket} = useSocketContext();
  const [showModal, setShowModal] = useState(false);
  const [recivers, setRecivers] = useState<number[]>([]);
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isAllClicked, setIsAllClicked] = useState(false);
  const [selectedNotificationType, setSelectedNotificationType] =
    useState('NOTIFICATION');
  const [actionItemName, setActionItemName] = useState('');
  const [actionItemDescription, setActionItemDescription] = useState('');
  const [alertName, setAlertName] = useState('');
  const [alertDescription, setAlertDescription] = useState('');
  const [isUsersModalShow, setIsUsersModalShow] = useState(false);
  const allNotificationType = [
    {title: 'Notification', value: 'NOTIFICATION'},
    {title: 'Action Item', value: 'ACTION ITEM'},
    {title: 'Alert', value: 'ALERT'},
  ];
  const navigation = useNavigation();
  const id = uuidv4();
  const date = new Date();
  const toaster = useToast();

  const totalusers = [...recivers, userInfo?.user_id];
  const involvedusers = [...new Set(totalusers)];
  const actualUsers = usersStore.users.filter(
    usr => usr.user_id !== userInfo?.user_id,
  );

  const filterdUser = actualUsers.filter(user =>
    user.user_name.toLowerCase().includes(query.toLowerCase()),
  );

  const urlNode = selectedUrl || ProcgURL;
  const urlPython = ProcgURL2;
  const fallbacks = [require('../../assets/prifileImages/thumbnail.jpg')];

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

  const handleSend = async () => {
    const sendPayload = {
      notification_id: id,
      notification_type: selectedNotificationType,
      sender: userInfo?.user_id,
      recipients: recivers,
      subject: subject,
      notification_body: body,
      status: 'SENT',
      creation_date: new Date(),
      parent_notification_id: id,
      involved_users: involvedusers,
      readers: recivers,
      holders: involvedusers,
      recycle_bin: [],
      action_item_id: null,
      alert_id: null,
    };
    const sendParams = {
      url: api.Messages,
      data: sendPayload,
      method: 'post',
      baseURL: urlNode,
      // isConsole: true,
      // isConsoleParams: true,
    };
    const sendNotificationPayload = {
      notificationID: id,
      parentId: id,
      date: new Date(),
      sender: userInfo?.user_id,
      recipients: recivers,
      subject,
      body,
    };
    const sendNotificationParams = {
      url: api.SendNotification,
      data: sendNotificationPayload,
      method: 'post',
      baseURL: urlNode,
      // isConsole: true,
      // isConsoleParams: true,
    };
    try {
      if (selectedNotificationType.toLowerCase() === 'action item') {
        const SendActionItemPayload = {
          action_item_name: actionItemName,
          description: actionItemDescription,
          status: 'NEW',
          user_ids: recivers,
        };
        const sendActionItemParams = {
          url: api.ActionItem,
          data: SendActionItemPayload,
          method: 'post',
          baseURL: urlPython,
          access_token: userInfo?.access_token,
          // isConsole: true,
          // isConsoleParams: true,
        };
        const actionItemResponse = await httpRequest(
          sendActionItemParams,
          setIsSending,
        );

        if (actionItemResponse.message) {
          sendPayload.action_item_id = actionItemResponse.action_item_id;
          const notificationResponse = await httpRequest(
            sendParams,
            setIsSending,
          );
          if (notificationResponse) {
            await httpRequest(sendNotificationParams, setIsSending);
            // const params1 = {
            //   url: `${api.Messages}/${notificationResponse.result.notification_id}`,
            //   data: {
            //     action_item_id: actionItemResponse.action_item_id,
            //   },
            //   method: 'put',
            //   baseURL: urlNode,
            //   // isConsole: true,
            //   // isConsoleParams: true,
            // };
            // await httpRequest(params1, setIsSending);
            const params2 = {
              url: `${api.ActionItem}/${actionItemResponse.action_item_id}`,
              data: {
                notification_id: notificationResponse.result.notification_id,
              },
              method: 'put',
              baseURL: urlPython,
              access_token: userInfo?.access_token,
              // isConsole: true,
              // isConsoleParams: true,
            };
            await httpRequest(params2, setIsSending);
            socket?.emit('sendMessage', {
              notificationId: sendPayload.notification_id,
              sender: sendPayload.sender,
            });
            toaster.show({
              message: notificationResponse.message,
              type: 'success',
            });
          }
        }
      } else if (selectedNotificationType.toLowerCase() === 'alert') {
        const SendAlertPayload = {
          alert_name: alertName,
          description: alertDescription,
          recepients: recivers,
          // notification_id: id,
          created_by: userInfo?.user_id,
          last_updated_by: userInfo?.user_id,
        };
        const sendAlertParams = {
          url: api.CreateAlert,
          data: SendAlertPayload,
          method: 'post',
          baseURL: urlNode,
          // isConsole: true,
          // isConsoleParams: true,
        };
        const alertResponse = await httpRequest(sendAlertParams, setIsSending);

        if (alertResponse) {
          sendPayload.alert_id = alertResponse.result.alert_id;
          const notificationResponse = await httpRequest(
            sendParams,
            setIsSending,
          );
          if (notificationResponse) {
            //update alert
            const updateAlertParams = {
              url: `${api.CreateAlert}/${alertResponse.result.alert_id}`,
              data: {
                notification_id: notificationResponse.result.notification_id,
              },
              method: 'put',
              baseURL: urlNode,
              // isConsole: true,
              // isConsoleParams: true,
            };
            await httpRequest(updateAlertParams, setIsSending);
            // send notification
            await httpRequest(sendNotificationParams, setIsSending);
            // const params = {
            //   url: `${api.Messages}/${notificationResponse.result.notification_id}`,
            //   data: {
            //     alert_id: alertResponse.result.alert_id,
            //   },
            //   method: 'put',
            //   baseURL: urlNode,
            //   // isConsole: true,
            //   // isConsoleParams: true,
            // };
            // await httpRequest(params, setIsSending);
            socket.emit('SendAlert', {
              alertId: alertResponse.result.alert_id,
              recipients: recivers,
              isAcknowledge: false,
            });
            socket?.emit('sendMessage', {
              notificationId: sendPayload.notification_id,
              sender: sendPayload.sender,
            });
            toaster.show({
              message: notificationResponse.message,
              type: 'success',
            });
          }
        }
      } else {
        const notificationResponse = await httpRequest(
          sendParams,
          setIsSending,
        );
        if (notificationResponse) {
          await httpRequest(sendNotificationParams, setIsSending);
          socket?.emit('sendMessage', {
            notificationId: sendPayload.notification_id,
            sender: sendPayload.sender,
          });
          toaster.show({
            message: notificationResponse.message,
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
        // setSelectedNotificationType('NOTIFICATION');
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
      notification_id: id,
      notification_type: selectedNotificationType,
      sender: userInfo?.user_id,
      recipients: recivers,
      subject: subject,
      notification_body: body,
      status: 'DRAFT',
      creation_date: new Date(),
      parent_notification_id: id,
      involved_users: involvedusers,
      readers: recivers,
      holders: involvedusers,
      recycle_bin: [],
      action_item_id: null,
      alert_id: null,
    };
    const draftParams = {
      url: api.Messages,
      data: draftPayload,
      method: 'post',
      baseURL: urlNode,
      // isConsole: true,
      // isConsoleParams: true,
    };
    try {
      if (selectedNotificationType.toLowerCase() === 'action item') {
        const SendActionItemPayload = {
          action_item_name: actionItemName,
          description: actionItemDescription,
          status: 'NEW',
          user_ids: recivers,
        };
        const sendActionItemParams = {
          url: api.ActionItem,
          data: SendActionItemPayload,
          method: 'post',
          baseURL: urlPython,
          access_token: userInfo?.access_token,
          // isConsole: true,
          // isConsoleParams: true,
        };
        const actionItemResponse = await httpRequest(
          sendActionItemParams,
          setIsDrafting,
        );
        if (actionItemResponse.message) {
          draftPayload.action_item_id = actionItemResponse.action_item_id;
          const notificationResponse = await httpRequest(
            draftParams,
            setIsDrafting,
          );
          if (notificationResponse) {
            // const params1 = {
            //   url: `${api.Messages}/${notificationResponse.result.notification_id}`,
            //   data: {
            //     action_item_id: actionItemResponse.action_item_id,
            //   },
            //   method: 'put',
            //   baseURL: urlNode,
            //   isConsole: true,
            //   isConsoleParams: true,
            // };
            // await httpRequest(params1, setIsDrafting);
            const params2 = {
              url: `${api.ActionItem}/${actionItemResponse.action_item_id}`,
              data: {
                notification_id: notificationResponse.result.notification_id,
              },
              method: 'put',
              baseURL: urlPython,
              access_token: userInfo?.access_token,
              // isConsole: true,
              // isConsoleParams: true,
            };
            await httpRequest(params2, setIsDrafting);
            socket?.emit('sendDraft', {
              notificationId: draftPayload.notification_id,
              sender: draftPayload.sender,
            });
            toaster.show({
              message: 'Message Save to Drafts Successfully',
              type: 'success',
            });
          }
        }
      }
      if (selectedNotificationType.toLowerCase() === 'alert') {
        const SendAlertPayload = {
          alert_name: alertName,
          description: alertDescription,
          recepients: recivers,
          // notification_id: id,
          created_by: userInfo?.user_id,
          last_updated_by: userInfo?.user_id,
        };
        const sendAlertParams = {
          url: api.CreateAlert,
          data: SendAlertPayload,
          method: 'post',
          baseURL: urlNode,
          // isConsole: true,
          // isConsoleParams: true,
        };
        const alertResponse = await httpRequest(sendAlertParams, setIsDrafting);
        if (alertResponse.message) {
          draftPayload.alert_id = alertResponse.result.alert_id;
          const notificationResponse = await httpRequest(
            draftParams,
            setIsDrafting,
          );
          if (notificationResponse) {
            const updateAlertParams = {
              url: `${api.CreateAlert}/${alertResponse.result.alert_id}`,
              data: {
                notification_id: notificationResponse.result.notification_id,
              },
              method: 'put',
              baseURL: urlNode,
              // isConsole: true,
              // isConsoleParams: true,
            };
            await httpRequest(updateAlertParams, setIsSending);
            socket.emit('SendAlert', {
              alertId: alertResponse.result.alert_id,
              recipients: recivers,
              isAcknowledge: false,
            });
            socket?.emit('sendDraft', {
              notificationId: draftPayload.notification_id,
              sender: draftPayload.sender,
            });
            toaster.show({
              message: 'Message Save to Drafts Successfully',
              type: 'success',
            });
          }
        }
      } else {
        const notificationResponse = await httpRequest(
          draftParams,
          setIsDrafting,
        );
        if (notificationResponse) {
          socket?.emit('sendDraft', {
            notificationId: draftPayload.notification_id,
            sender: draftPayload.sender,
          });
          toaster.show({
            message: notificationResponse.message,
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
        // setSelectedNotificationType('NOTIFICATION');
        navigation.goBack();
      }, 500);
    } catch (error) {
      if (error instanceof Error) {
        toaster.show({
          message: `${(error && error.message) ?? 'Action item name already exists'}`,
          type: 'error',
        });
      }
    }
  };

  const handleX = (rcvr: number | null | undefined) => {
    const newRecievers = recivers.filter(r => r !== rcvr);
    setRecivers(newRecievers);
  };

  const handleNotificationType = (type: string) => {
    setSelectedNotificationType(type);
  };

  useEffect(() => {
    if (recivers.length === 0) {
      setShowModal(false);
    }
  }, [recivers.length]);
  return (
    <ContainerNew
      isRefresh={false}
      isKeyboardAware={true}
      isScrollView={false}
      header={
        <MainHeader
          routeName={`New ${toTitleCase(selectedNotificationType)}`}
        />
      }
      footer={
        <View>
          {/* draft */}
          <TouchableOpacity
            onPress={handleDraft}
            disabled={
              (recivers.length === 0 &&
                body === '' &&
                subject === '' &&
                actionItemName === '' &&
                actionItemDescription === '' &&
                alertName === '' &&
                alertDescription === '') ||
              isDrafting
            }
            style={[
              styles.draftBtn,
              ((recivers.length === 0 &&
                body === '' &&
                subject === '' &&
                actionItemName === '' &&
                actionItemDescription === '' &&
                alertName === '' &&
                alertDescription === '') ||
                isDrafting) &&
                styles.disabled,
            ]}>
            {isDrafting ? (
              <ActivityIndicator
                size={24}
                color={COLORS.white}
                style={styles.loadingStyle}
              />
            ) : (
              <SVGController name="Notebook-Pen" color={COLORS.white} />
            )}
          </TouchableOpacity>
          {/* send */}
          <TouchableOpacity
            onPress={handleSend}
            style={[
              styles.sentBtn,
              (recivers.length === 0 ||
                body === '' ||
                subject === '' ||
                (selectedNotificationType.toLowerCase() === 'action item' &&
                  actionItemName === '') ||
                (selectedNotificationType.toLowerCase() === 'action item' &&
                  actionItemDescription === '') ||
                (selectedNotificationType.toLowerCase() === 'alert' &&
                  alertName === '') ||
                (selectedNotificationType.toLowerCase() === 'alert' &&
                  alertDescription === '') ||
                isSending) &&
                styles.disabled,
            ]}
            disabled={
              recivers.length === 0 ||
              body === '' ||
              subject === '' ||
              (selectedNotificationType.toLowerCase() === 'action item' &&
                actionItemName === '') ||
              (selectedNotificationType.toLowerCase() === 'action item' &&
                actionItemDescription === '') ||
              (selectedNotificationType.toLowerCase() === 'alert' &&
                alertName === '') ||
              (selectedNotificationType.toLowerCase() === 'alert' &&
                alertDescription === '') ||
              isSending
            }>
            {isSending ? (
              <ActivityIndicator
                size={24}
                color={COLORS.white}
                style={styles.loadingStyle}
              />
            ) : (
              <SVGController name="Send" color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>
      }>
      <View style={{marginHorizontal: 20}}>
        {/*Notification Type*/}
        <SelectStatusDropDown
          width={Dimensions.get('screen').width - 40}
          height={30}
          defaultValue={allNotificationType[0]?.title}
          data={allNotificationType}
          handleSelectedStatus={handleNotificationType}
          border={true}
        />
      </View>
      <View style={{flex: 1, marginHorizontal: 20}}>
        {/*To*/}
        <View style={styles.lineContainerTo}>
          {/** Extra Recievers */}
          <ReceiversModal
            showModal={showModal}
            handleX={handleX}
            setShowModal={setShowModal}
            recivers={recivers}
            isHandleX={true}
          />
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
        </View>

        <Modal
          visible={isUsersModalShow}
          transparent
          animationType="fade"
          onRequestClose={() => setIsUsersModalShow(false)}>
          <TouchableWithoutFeedback onPress={() => setIsUsersModalShow(false)}>
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
                      style={styles.selectPress}
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

                    {filterdUser.map(usr => (
                      <TouchableOpacity
                        onPress={() => handleReciever(usr.user_id)}
                        key={usr.user_id}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
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
                            <Text style={[styles.item]}>{usr?.user_name}</Text>
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
                  <ScrollView scrollEnabled={true}>
                    {/* {query !== '' && ( */}

                    {/* )} */}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {recivers.length !== 0 ? (
          <View style={{flexDirection: 'row'}}>
            <View style={styles.singleRcvr}>
              <View style={styles.withinSinglRcve}>
                <Image
                  style={styles.profileImage}
                  source={{
                    uri: `${urlNode}/${renderProfilePicture(recivers[recivers.length - 1], usersStore.users)}`,
                    // headers: {
                    //   Authorization: `Bearer ${userInfo?.access_token}`,
                    // },
                  }}
                  fallback={fallbacks}
                />
                <Text style={styles.textGreen}>
                  {renderUserName(
                    recivers[recivers.length - 1],
                    usersStore.users,
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
            onChangeText={text => setSubject(text)}
          />
        </View>
        {/*Body*/}
        <View style={styles.lineContainerBody}>
          <TextInput
            style={styles.textInputBody}
            placeholder="Body"
            value={body}
            onChangeText={text => setBody(text)}
            multiline={true}
            // numberOfLines={10}
            placeholderTextColor={COLORS.darkGray}
          />
        </View>

        {/* {selectedNotificationType.toLowerCase() !== 'notification' && (
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>
              {toTitleCase(selectedNotificationType)}
            </Text>
            <View style={styles.dividerLine} />
          </View>
        )} */}
        {/* Action Item   */}
        {selectedNotificationType.toLowerCase() === 'action item' && (
          <>
            <View
              style={[
                styles.withinLineContainer,
                {
                  borderBottomWidth: 0.5,
                  borderBottomColor: COLORS.lightGray5,
                },
              ]}>
              <Text style={{color: COLORS.darkGray}}>Name</Text>
              <TextInput
                style={{height: 40, width: '90%', color: COLORS.black}}
                value={actionItemName}
                maxLength={150}
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
        {selectedNotificationType.toLowerCase() === 'alert' && (
          <>
            <View
              style={[
                styles.withinLineContainer,
                {
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
    </ContainerNew>
  );
};

export default NewMessage;

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
    paddingBottom: 2,
  },
  withinLineContainer: {
    width: '90%',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  textInputBody: {
    minHeight: 200,
    textAlignVertical: 'top',
    width: '100%',
    color: COLORS.black,
    // borderBottomColor: COLORS.lightGray5,
    // borderBottomWidth: 0.5,
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
  disabled: {
    backgroundColor: 'rgba(55, 134, 230, 0.15)',
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
  modal: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray6,
    width: Platform.OS === 'ios' ? '100%' : '100%',
    maxHeight: Platform.OS === 'ios' ? '90%' : 350,
    backgroundColor: COLORS.lightBackground,
    borderRadius: 6,
    position: 'absolute',
    top: 40,
    zIndex: 10,
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
  singleRcvrScroll: {
    width: '100%',

    backgroundColor: COLORS.lightBackground,
    paddingVertical: 4,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
    borderRadius: 6,
    marginBottom: 10,
  },
  receiversContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray5,
    paddingBottom: 10,
  },
  imageStyle: {
    height: 20,
    width: 20,
    borderRadius: 99,
    objectFit: 'cover',
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
  },
  loadingStyle: {transform: [{scaleX: 0.8}, {scaleY: 0.8}]},
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16, // space above and below
  },
  dividerLine: {
    flex: 1, // stretch line to fill space
    height: 1, // thin line
    backgroundColor: '#ccc', // light gray
  },
  dividerText: {
    marginHorizontal: 10, // spacing between lines and text
    fontWeight: '600', // bold text
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: '#ffffffff',
    color: COLORS.black,
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
    borderBlockColor: '#b1b1b1ff',
    borderWidth: 0.5,
  },
});
