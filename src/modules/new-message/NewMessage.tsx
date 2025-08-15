import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
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
import {ProcgURL} from '../../../App';
import {v4 as uuidv4} from 'uuid';
import ReceiversModal from '../../common/components/ReceiversModal';
import SVGController from '../../common/components/SVGController';
import Image from 'react-native-image-fallback';
import {useSocketContext} from '../../context/SocketContext';
import {
  renderProfilePicture,
  renderUserName,
} from '../../common/utility/notifications.utility';

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
  const navigation = useNavigation();
  const notifcationType = 'REGULAR';
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

  const url = selectedUrl || ProcgURL;
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
      notification_type: notifcationType,
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
      baseURL: url,
      isConsole: true,
      isConsoleParams: true,
    };
    // notificationID, parentId, date, sender, recipients, subject, body;
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
      baseURL: url,
      isConsole: true,
      isConsoleParams: true,
    };

    try {
      const response = await httpRequest(sendParams, setIsSending);
      await httpRequest(sendNotificationParams, setIsSending);
      if (response) {
        socket?.emit('sendMessage', {
          notificationId: sendPayload.notification_id,
          sender: sendPayload.sender,
        });
        toaster.show({message: response.message, type: 'success'});
      }
      setTimeout(async () => {
        navigation.goBack();
      }, 500);
    } catch (error) {
      if (error instanceof Error) {
        toaster.show({message: error.message, type: 'error'});
      }
    } finally {
      setRecivers([]);
      setSubject('');
      setBody('');
    }
  };
  // draft
  const handleDraft = async () => {
    const draftPayload = {
      notification_id: id,
      notification_type: notifcationType,
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
      baseURL: url,
      isConsole: true,
      isConsoleParams: true,
    };
    try {
      const response = await httpRequest(draftParams, setIsDrafting);
      if (response) {
        socket?.emit('sendDraft', {
          notificationId: draftPayload.notification_id,
          sender: draftPayload.sender,
        });
        toaster.show({
          message: response.message,
          type: 'success',
        });
        setTimeout(async () => {
          navigation.goBack();
        }, 500);
      }
    } catch (error) {
      if (error instanceof Error) {
        toaster.show({message: error.message, type: 'error'});
      }
    } finally {
      setRecivers([]);
      setSubject('');
      setBody('');
    }
  };

  const handleX = (rcvr: number | null | undefined) => {
    const newRecievers = recivers.filter(r => r !== rcvr);
    setRecivers(newRecievers);
  };
  return (
    <ContainerNew
      isRefresh={false}
      isKeyboardAware={true}
      isScrollView={false}
      header={<MainHeader routeName={name} />}
      footer={
        <View>
          <TouchableOpacity
            onPress={handleSend}
            style={[
              styles.sentBtn,
              (recivers.length === 0 ||
                body === '' ||
                subject === '' ||
                isSending) &&
                styles.disabled,
            ]}
            disabled={
              recivers.length === 0 ||
              body === '' ||
              subject === '' ||
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
          <TouchableOpacity
            onPress={handleDraft}
            disabled={
              (recivers.length === 0 && body === '' && subject === '') ||
              isDrafting
            }
            style={[
              styles.draftBtn,
              ((recivers.length === 0 && body === '' && subject === '') ||
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
        </View>
      }>
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
            <Text style={{color: COLORS.darkGray}}>To</Text>
            <TextInput
              style={{height: 40, width: '90%', color: COLORS.black}}
              value={query}
              onChangeText={text => setQuery(text)}
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
        {query !== '' && (
          <ScrollView style={styles.modal}>
            <Pressable style={styles.selectPress} onPress={handleSelectAll}>
              <Text style={[styles.item]}>All</Text>
              {isAllClicked && (
                <AntDesign name="check" size={20} color="#3632A6" />
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
                        uri: `${url}/${usr.profile_picture.thumbnail}`,
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
                    <AntDesign name="check" size={20} color="#3632A6" />
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
        )}
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
            placeholderTextColor={COLORS.darkGray}
          />
        </View>
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
});
