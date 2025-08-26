import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import ContainerNew from '../../common/components/Container';
import MainHeader from '../../common/components/MainHeader';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../../common/constant/Themes';
import {useRootStore} from '../../stores/rootStore';
import {useToast} from '../../common/components/CustomToast';
import {httpRequest} from '../../common/constant/httpRequest';
import {api} from '../../common/api/api';
import {ProcgURL} from '../../../App';
import {v4 as uuidv4} from 'uuid';
import useAsyncEffect from '../../common/packages/useAsyncEffect/useAsyncEffect';
import ReceiversModal from '../../common/components/ReceiversModal';
import SVGController from '../../common/components/SVGController';
import {useSocketContext} from '../../context/SocketContext';
import Image from 'react-native-image-fallback';
import {MessageSnapshotType} from '../../stores/messageStore';
import {
  renderProfilePicture,
  renderSlicedUsername,
} from '../../common/utility/notifications.utility';

interface User {
  name: string;
  profile_picture: string;
}

const ReplyScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {usersStore, userInfo, selectedUrl} = useRootStore();
  const {socket, sendMessage, sendDraft} = useSocketContext();
  const {_id} = route.params as {_id: string};
  const isFocused = useIsFocused();
  const [parrentMessage, setParrentMessage] =
    useState<MessageSnapshotType | null>(null);
  const [recivers, setRecivers] = useState<number[]>([]);
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [oldBody, setOldBody] = useState('');
  const id = uuidv4();
  const date = new Date();
  const toaster = useToast();
  const url = selectedUrl || ProcgURL;
  const fallbacks = [require('../../assets/prifileImages/thumbnail.jpg')];

  //Fetch SingleMessage
  useAsyncEffect(
    async isMounted => {
      if (!isMounted()) {
        return null;
      }
      const api_params = {
        url: api.Messages + '/' + _id,
        baseURL: url,
        // isConsole: true,
        // isConsoleParams: true,
      };
      const res: MessageSnapshotType = await httpRequest(
        api_params,
        setIsLoading,
      );
      if (res) {
        setParrentMessage(res);
        setSubject(`Re: ${res.subject}`);
        const totalInvolved = [...res.recipients, res.sender];
        const newRecivers = totalInvolved.filter(
          usr => usr !== userInfo?.user_id,
        );
        setRecivers(newRecivers);
        setOldBody(res.notification_body);
      }
    },
    [isFocused, _id],
  );

  const handleSend = async () => {
    const sendPayload = {
      notification_id: id,
      notification_type: parrentMessage?.notification_type,
      sender: userInfo?.user_id,
      recipients: recivers,
      subject: subject,
      notification_body: body,
      status: 'SENT',
      creation_date: new Date(),
      parent_notification_id: parrentMessage?.parent_notification_id,
      involved_users: parrentMessage?.involved_users,
      readers: recivers,
      holders: parrentMessage?.involved_users,
      recycle_bin: [],
      action_item_id: parrentMessage?.action_item_id,
      alert_id: parrentMessage?.alert_id,
    };
    const sendParams = {
      url: api.Messages,
      data: sendPayload,
      method: 'post',
      baseURL: url,
      isConsole: true,
      // isConsoleParams: true,
    };
    // notificationID, parentId, date, sender, recipients, subject, body;
    const sendNotificationPayload = {
      notificationID: id,
      parentId: parrentMessage?.parent_notification_id,
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
      baseURL: url,
      isConsole: true,
      isConsoleParams: true,
    };
    try {
      const response = await httpRequest(sendParams, setIsSending);
      await httpRequest(sendNotificationParams, setIsSending);
      if (response) {
        sendMessage(sendPayload.notification_id);
        // socket?.emit('sendMessage', {
        //   notificationId: sendPayload.notification_id,
        //   sender: sendPayload.sender,
        // });
        toaster.show({message: response.message, type: 'success'});
      }
    } catch (error) {
      if (error instanceof Error) {
        toaster.show({message: error.message, type: 'error'});
      }
    } finally {
      setBody('');
      setTimeout(async () => {
        navigation.goBack();
      }, 500);
    }
  };

  const handleDraft = async () => {
    const draftPayload = {
      notification_id: id,
      notification_type: parrentMessage?.notification_type,
      sender: userInfo?.user_id,
      recipients: recivers,
      subject: `${subject}`,
      notification_body: body,
      status: 'DRAFT',
      creation_date: new Date(),
      parent_notification_id: parrentMessage?.parent_notification_id,
      involved_users: parrentMessage?.involved_users,
      readers: recivers,
      holders: [userInfo?.user_id],
      recycle_bin: [],
      action_item_id: parrentMessage?.action_item_id,
      alert_id: parrentMessage?.alert_id,
    };
    const draftParams = {
      url: api.Messages,
      data: draftPayload,
      method: 'post',
      baseURL: url,
      isConsole: true,
      // isConsoleParams: true,
    };
    try {
      const response = await httpRequest(draftParams, setIsDrafting);
      if (response) {
        sendDraft(draftPayload.notification_id);
        // socket?.emit('sendDraft', {
        //   notificationId: draftPayload.notification_id,
        //   sender: draftPayload.sender,
        // });
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

  return (
    <ContainerNew
      isKeyboardAware={true}
      isScrollView={false}
      header={<MainHeader routeName={route.name} />}
      footer={
        <View>
          {/* send  */}
          <TouchableOpacity
            onPress={handleSend}
            style={[
              styles.sentBtn,
              {
                opacity:
                  recivers.length === 0 || body === '' || isSending ? 0.5 : 1,
              },
            ]}
            disabled={recivers.length === 0 || body === '' || isSending}>
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
          {/* draft  */}
          <TouchableOpacity
            onPress={handleDraft}
            disabled={body === '' || oldBody === body || isDrafting}
            style={[
              styles.draftBtn,
              {
                opacity:
                  body === '' || oldBody === body || isDrafting ? 0.5 : 1,
              },
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
            handleX={() => console.log('hello')}
            setShowModal={setShowModal}
            recivers={recivers}
            isHandleX={false}
          />
          <View style={styles.withinLineContainer}>
            <Text style={{color: COLORS.darkGray}}>To</Text>
            {recivers.length !== 0 && (
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
                        15,
                      )}
                    </Text>
                  </View>
                </View>
              </View>
            )}
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

        {/*Subject*/}
        <View style={styles.lineContainer}>
          <Text style={{color: COLORS.darkGray}}>Subject</Text>
          <TextInput
            style={{height: 40, width: '80%', color: COLORS.textGray}}
            value={subject}
            readOnly
            onChangeText={text => setSubject(text)}
          />
        </View>
        {/*Body*/}
        <View style={styles.lineContainerBody}>
          <TextInput
            style={styles.textInputBody}
            placeholderTextColor={COLORS.darkGray}
            placeholder="Body"
            value={body}
            onChangeText={text => setBody(text)}
            multiline={true}
          />
        </View>
      </View>
    </ContainerNew>
  );
};

export default ReplyScreen;

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
    backgroundColor: '#3886e6',
    padding: 8,
    borderRadius: 99,
    // iOS Shadow
    shadowColor: '#3886e6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,

    // Android Shadow
    elevation: 5,
  },
  draftBtn: {
    position: 'absolute',
    right: 70,
    bottom: 20,
    backgroundColor: '#3886e6',
    padding: 8,
    borderRadius: 99,
    // iOS Shadow
    shadowColor: '#3886e6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,

    // Android Shadow
    elevation: 5,
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
  loadingStyle: {
    transform: [{scaleX: 0.8}, {scaleY: 0.8}],
  },
});
