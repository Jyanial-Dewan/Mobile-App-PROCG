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
import {useNavigation, useRoute} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import {observer} from 'mobx-react-lite';
import {useRootStore} from '../../../stores/rootStore';
import {useToast} from '../../../common/components/CustomToast';
import {httpRequest} from '../../../common/constant/httpRequest';
import {api} from '../../../common/api/api';
import {v4 as uuidv4} from 'uuid';
import ReceiversModal from '../../../common/components/ReceiversModal';
import Image from 'react-native-image-fallback';
import {useSocketContext} from '../../../context/SocketContext';
import {
  renderProfilePicture,
  renderSlicedUsername,
} from '../../../common/utility/notifications.utility';
import SelectStatusDropDown from '../../../common/components/SelectStatusDropDown';
import {toTitleCase} from '../../../common/utility/general';
import CustomTextNew from '../../../common/components/CustomText';
import FooterDraftButton from '../../../common/components/FooterDraftButton';
import FooterSendButton from '../../../common/components/FooterSendButton';
import {ProcgURL, ProcgURL2} from '../../../../App';
import ContainerNew from '../../../common/components/Container';
import MainHeader from '../../../common/components/MainHeader';
import {COLORS} from '../../../common/constant/Themes';

interface User {
  name: string;
  profile_picture: string;
}

const NewMessage = () => {
  const {name} = useRoute();
  const {usersStore, userInfo, selectedUrl} = useRootStore();
  const {SendAlert, sendMessage, draftMessage} = useSocketContext();
  const [showModal, setShowModal] = useState(false);
  const [recipients, setRecipients] = useState<number[]>([]);
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isAllClicked, setIsAllClicked] = useState(false);
  const [selectedNotificationType, setSelectedNotificationType] = useState('');
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

  const totalusers = [...recipients, userInfo?.user_id];
  const involvedusers = [...new Set(totalusers)];
  const actualUsers = usersStore.users.filter(
    usr => usr.user_id !== userInfo?.user_id,
  );

  const filterdUser = actualUsers.filter(user =>
    user?.user_name?.toLowerCase().includes(query.toLowerCase()),
  );

  const urlNode = selectedUrl || ProcgURL;
  const urlPython = ProcgURL2;
  const fallbacks = [require('../../../assets/prifileImages/thumbnail.jpg')];

  const handleReciever = (reciever: number) => {
    if (recipients.includes(reciever)) {
      const newArray = recipients.filter(rcvr => rcvr !== reciever);
      setRecipients(newArray);
      setQuery('');
    } else {
      setRecipients(prevArray => [...prevArray, reciever]);
      setQuery('');
    }
  };

  const handleSelectAll = () => {
    if (!isAllClicked) {
      setIsAllClicked(true);
      const newReceivers = actualUsers.map(usr => usr.user_id);
      setRecipients(newReceivers as number[]);
    } else {
      setIsAllClicked(false);
      setRecipients([]);
    }
    setQuery('');
  };

  const handleSend = async () => {
    const sendPayload = {
      notification_id: id,
      notification_type: selectedNotificationType,
      sender: userInfo?.user_id,
      recipients: recipients,
      subject: subject,
      notification_body: body,
      status: 'SENT',
      creation_date: new Date(),
      parent_notification_id: id,
      involved_users: involvedusers,
      readers: recipients,
      holders: involvedusers,
      recycle_bin: [],
      action_item_id: null,
      alert_id: null,
    };
    const sendNotificationPayload = {
      notificationID: id,
      parentId: id,
      date: new Date(),
      sender: userInfo?.user_id,
      recipients: recipients,
      subject,
      body,
    };

    const sendParams = {
      url: api.Messages,
      data: sendPayload,
      method: 'post',
      baseURL: urlNode,
      access_token: userInfo?.access_token,
      // isConsole: true,
      // isConsoleParams: true,
    };

    const sendNotificationParams = {
      url: api.SendNotification,
      data: sendNotificationPayload,
      method: 'post',
      baseURL: urlNode,
      access_token: userInfo?.access_token,
      // isConsole: true,
      // isConsoleParams: true,
    };
    try {
      const notificationResponse = await httpRequest(sendParams, setIsSending);
      if (notificationResponse) {
        if (selectedNotificationType.toLowerCase() === 'alert') {
          const SendAlertPayload = {
            alert_name: alertName,
            description: alertDescription,
            recepients: recipients,
            notification_id: id,
            status: 'SENT',
          };
          const sendAlertParams = {
            url: api.Alerts,
            data: SendAlertPayload,
            method: 'post',
            baseURL: urlNode,
            access_token: userInfo?.access_token,
            // isConsole: true,
            // isConsoleParams: true,
          };
          const alertResponse = await httpRequest(
            sendAlertParams,
            setIsSending,
          );
          if (alertResponse) {
            if (selectedNotificationType.toLowerCase() === 'alert') {
              toaster.show({
                message: alertResponse.message,
                type: 'success',
              });
            }
            SendAlert(alertResponse.result.alert_id, recipients, false);
          }
        }

        if (selectedNotificationType.toLowerCase() === 'action item') {
          const SendActionItemPayload = {
            action_item_name: actionItemName,
            description: actionItemDescription,
            user_ids: recipients,
            notification_id: id,
            action: 'SENT',
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
          await httpRequest(sendActionItemParams, setIsSending);
        }

        await httpRequest(sendNotificationParams, setIsSending);
        sendMessage(
          sendPayload.notification_id,
          userInfo?.user_id!,
          recipients,
          'Sent',
        );
        if (selectedNotificationType.toLowerCase() === 'notification') {
          toaster.show({
            message: 'Notification Send Successfully',
            type: 'success',
          });
        }
      }

      setTimeout(async () => {
        setSubject('');
        setRecipients([]);
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
      recipients: recipients,
      subject: subject,
      notification_body: body,
      status: 'DRAFT',
      creation_date: new Date(),
      parent_notification_id: id,
      involved_users: involvedusers,
      readers: recipients,
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
      const notificationResponse = await httpRequest(
        draftParams,
        setIsDrafting,
      );

      if (notificationResponse) {
        if (selectedNotificationType.toLowerCase() === 'alert') {
          const SendAlertPayload = {
            alert_name: alertName ?? ' ',
            description: alertDescription ?? ' ',
            recepients: recipients ?? [],
            notification_id: id,
            status: 'DRAFT',
          };
          const sendAlertParams = {
            url: api.Alerts,
            data: SendAlertPayload,
            method: 'post',
            baseURL: urlNode,
            // isConsole: true,
            // isConsoleParams: true,
          };
          const alertResponse = await httpRequest(
            sendAlertParams,
            setIsDrafting,
          );

          if (alertResponse) {
            if (selectedNotificationType.toLowerCase() === 'alert') {
              toaster.show({
                message: alertResponse.message,
                type: 'success',
              });
            }
          }
        }

        if (selectedNotificationType.toLowerCase() === 'action item') {
          const SendActionItemPayload = {
            action_item_name: actionItemName ?? ' ',
            description: actionItemDescription ?? ' ',
            user_ids: recipients ?? [],
            notification_id: id,
            action: 'DRAFT',
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
          if (actionItemResponse) {
            if (selectedNotificationType.toLowerCase() === 'action item') {
              toaster.show({
                message: actionItemResponse.message,
                type: 'success',
              });
            }
          }
        }

        draftMessage(draftPayload.notification_id, userInfo?.user_id!, 'New');
        if (selectedNotificationType.toLowerCase() === 'notification') {
          toaster.show({
            message: notificationResponse.message,
            type: 'success',
          });
        }
      }

      setTimeout(async () => {
        setSubject('');
        setRecipients([]);
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
    const newRecievers = recipients.filter(r => r !== rcvr);
    setRecipients(newRecievers);
  };

  const handleNotificationType = (type: string) => {
    setSelectedNotificationType(type);
  };

  useEffect(() => {
    if (recipients.length === 0) {
      setShowModal(false);
    }
  }, [recipients.length]);

  const actionItemEmpty = !subject || !actionItemName || !actionItemDescription;
  const alertEmpty = !subject || !alertName || !alertDescription;
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
          <FooterDraftButton
            handleDraft={handleDraft}
            isDrafting={isDrafting}
            disabled={
              selectedNotificationType.toLowerCase() === 'notification'
                ? (recipients.length === 0 && body === '' && subject === '') ||
                  isDrafting
                : !selectedNotificationType ||
                  (selectedNotificationType.toLowerCase() === 'action item' &&
                    actionItemEmpty) ||
                  (selectedNotificationType.toLowerCase() === 'alert' &&
                    alertEmpty) ||
                  isDrafting
            }
            style={[
              styles.draftBtn,
              (selectedNotificationType.toLowerCase() === 'notification'
                ? !subject || isDrafting
                : !selectedNotificationType ||
                  (selectedNotificationType.toLowerCase() === 'action item' &&
                    actionItemEmpty) ||
                  (selectedNotificationType.toLowerCase() === 'alert' &&
                    alertEmpty) ||
                  isDrafting) && styles.disabled,
            ]}
          />
          {/* send */}
          <FooterSendButton
            handleSend={handleSend}
            isSending={isSending}
            disabled={
              !selectedNotificationType ||
              recipients.length === 0 ||
              body === '' ||
              subject === '' ||
              (selectedNotificationType.toLowerCase() === 'action item' &&
                actionItemEmpty) ||
              (selectedNotificationType.toLowerCase() === 'alert' &&
                alertEmpty) ||
              isSending
            }
            style={[
              styles.sentBtn,
              (!selectedNotificationType ||
                recipients.length === 0 ||
                body === '' ||
                subject === '' ||
                (selectedNotificationType.toLowerCase() === 'action item' &&
                  actionItemEmpty) ||
                (selectedNotificationType.toLowerCase() === 'alert' &&
                  alertEmpty) ||
                isSending) &&
                styles.disabled,
            ]}
          />
        </View>
      }>
      <View
        style={{
          marginHorizontal: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
        }}>
        {/*Notification Type*/}
        {/* <CustomTextNew text="Type:" txtColor={COLORS.black} /> */}
        <SelectStatusDropDown
          width={'100%'}
          // width={Dimensions.get('screen').width - 40}
          height={30}
          defaultValue={'Select Type'}
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
            recivers={recipients}
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
          {/* user length > 1 icon */}
          {recipients.length > 1 && (
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
        {/* users popup modal  */}
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
                        onPress={() => handleReciever(usr.user_id as number)}
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
                            <Text style={[styles.item]}>{usr?.user_name}</Text>
                          </View>
                          <View style={styles.itemListWrapper} />
                          {recipients.includes(usr.user_id as number) && (
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
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        {/* single user  */}
        {recipients.length !== 0 ? (
          <View style={{flexDirection: 'row'}}>
            <View style={styles.singleRcvr}>
              <View style={styles.withinSinglRcve}>
                <Image
                  style={styles.profileImage}
                  source={{
                    uri: `${urlNode}/${renderProfilePicture(recipients[recipients.length - 1], usersStore.users)}`,
                    // headers: {
                    //   Authorization: `Bearer ${userInfo?.access_token}`,
                    // },
                  }}
                  fallback={fallbacks}
                />
                <Text style={styles.textGreen}>
                  {renderSlicedUsername(
                    recipients[recipients.length - 1],
                    usersStore.users,
                    30,
                  )}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleX(recipients[recipients.length - 1])}>
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
                  selectedNotificationType.toLowerCase() === 'notification' ||
                  !selectedNotificationType
                    ? 400
                    : 200,
              },
            ]}
            placeholder="Body"
            value={body}
            onChangeText={text => setBody(text)}
            multiline={true}
            // numberOfLines={10}
            placeholderTextColor={COLORS.darkGray}
          />
        </View>

        {/* Action Item   */}
        {selectedNotificationType.toLowerCase() === 'action item' && (
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
        {selectedNotificationType.toLowerCase() === 'alert' && (
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
    </ContainerNew>
  );
};

export default observer(NewMessage);

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
  },
});
