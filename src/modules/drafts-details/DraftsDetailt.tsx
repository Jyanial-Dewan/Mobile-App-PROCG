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
import Image from 'react-native-image-fallback';
import React, {useEffect, useState} from 'react';
import ContainerNew from '../../common/components/Container';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import MainHeader from '../../common/components/MainHeader';
import {COLORS} from '../../common/constant/Themes';
import {httpRequest} from '../../common/constant/httpRequest';
import {ProcgURL} from '../../../App';
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

interface User {
  name: string;
  profile_picture: string;
}

const DraftsDetails = observer(() => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const {usersStore, userInfo, selectedUrl} = useRootStore();
  const {socket} = useSocketContext();
  const [showModal, setShowModal] = useState(false);
  const [parentid, setParentid] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [recivers, setRecivers] = useState<User[]>([]);
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isAllClicked, setIsAllClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oldMsgState, setOldMsgState] = useState<any>({});
  const [userChanged, setuserChanged] = useState<boolean>(false);
  const sender = {
    name: userInfo?.user_name,
    profile_picture: userInfo?.profile_picture.thumbnail,
  };
  const route = useRoute();
  const routeName = route.name;
  const {_id} = route.params as {_id: string};
  const id = uuidv4();
  const date = new Date();
  const toaster = useToast();
  const url = selectedUrl || ProcgURL;
  const fallbacks = [require('../../assets/prifileImages/thumbnail.jpg')];

  const receiverNames = recivers.map(rcvr => rcvr.name);

  const totalusers = [...receiverNames, userInfo?.user_name];
  const involvedusers = [...new Set(totalusers)];
  const actualUsers = usersStore.users.filter(
    usr => usr.user_name !== userInfo?.user_name,
  );

  const filterdUser = actualUsers.filter(user =>
    user.user_name.toLowerCase().includes(query.toLowerCase()),
  );
  //Fetch SingleMessage
  useAsyncEffect(
    async isMounted => {
      if (!isMounted()) {
        return null;
      }
      const api_params = {
        url: api.Messages + '/' + _id,
        baseURL: ProcgURL,
        // isConsole: true,
        // isConsoleParams: true,
      };
      const res = await httpRequest(api_params, setIsLoading);
      if (res) {
        setParentid(res.parentid);
        setStatus(res.status);
        setRecivers(res.recivers);
        setSubject(res.subject);
        setBody(res.body);
        setOldMsgState({
          receivers: res?.recivers,
          subject: res?.subject,
          body: res?.body,
        });
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
          oldMsgState?.receivers?.map((receiver: User) => {
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
            const res = oldMsgState?.receivers?.every((recvr: User) => {
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

  const handleReciever = (reciever: User) => {
    if (receiverNames.includes(reciever.name)) {
      const newArray = recivers.filter(rcvr => rcvr.name !== reciever.name);
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
      const newReceivers = actualUsers.map(usr => {
        return {
          name: usr.user_name,
          profile_picture: usr.profile_picture.thumbnail,
        };
      });
      setRecivers(newReceivers);
    } else {
      setIsAllClicked(false);
      setRecivers([]);
    }
    setQuery('');
  };

  const handleX = (rcvr: string) => {
    const newRecievers = recivers.filter(r => r.name !== rcvr);
    setRecivers(newRecievers);
  };

  const handleSend = async () => {
    const sendPayload = {
      id,
      sender,
      recivers,
      subject,
      body,
      date,
      status: 'Sent',
      parentid: id,
      involvedusers,
      readers: receiverNames,
      holders: involvedusers,
      recyclebin: [],
    };
    const sendParams = {
      url: api.Messages,
      data: sendPayload,
      method: 'post',
      baseURL: selectedUrl || ProcgURL,
      // isConsole: true,
      // isConsoleParams: true,
    };
    const sendNotificationPayload = {
      id,
      parentid: id,
      date,
      sender: sender,
      recivers: recivers,
      subject,
      body,
    };
    const sendNotificationParams = {
      url: api.SendNotification,
      data: sendNotificationPayload,
      method: 'post',
      baseURL: selectedUrl || ProcgURL,
      isConsole: true,
      isConsoleParams: true,
    };

    const deleteParams = {
      url: api.Messages + '/' + _id,
      method: 'delete',
      baseURL: selectedUrl || ProcgURL,
      // isConsole: true,
      // isConsoleParams: true,
    };
    try {
      const deleteMsg = await httpRequest(deleteParams, setIsSending);
      const newMsg = await httpRequest(sendParams, setIsSending);
      await httpRequest(sendNotificationParams, setIsSending);
      if (deleteMsg && newMsg) {
        socket?.emit('sendMessage', sendPayload);
        socket?.emit('draftMsgId', {id: _id, user: userInfo?.user_name});
        console.log(_id, 'Id in draft details screen');
        toaster.show({message: 'Message Sent Successfully', type: 'success'});
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
  // draft
  const handleDraft = async () => {
    const draftPayload = {
      id: _id,
      sender,
      recivers,
      subject,
      body,
      date,
      status: status,
      parentid,
      involvedusers,
      readers: receiverNames,
      holders: [sender.name],
      recyclebin: [],
    };
    const draftParams = {
      url: api.Messages + '/' + _id,
      data: draftPayload,
      method: 'put',
      baseURL: selectedUrl || ProcgURL,
      // isConsole: true,
      // isConsoleParams: true,
    };
    try {
      const response = await httpRequest(draftParams, setIsDrafting);
      if (response) {
        socket?.emit('sendDraft', draftPayload);
        toaster.show({
          message: 'Message Save to Drafts Successfully',
          type: 'success',
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        toaster.show({message: error.message, type: 'error'});
      }
    }
  };

  const handleDeleteDraftMessage = async (msgId: string) => {
    const deleteParams = {
      url: api.DeleteMessage + msgId + `/${userInfo?.user_name}`,
      method: 'put',
      baseURL: selectedUrl || ProcgURL,
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

  return (
    <ContainerNew
      isKeyboardAware={true}
      isScrollView={false}
      header={
        <MainHeader
          last={
            <RoundedButton
              onPress={() => handleDeleteDraftMessage(_id)}
              child={<Feather name="trash" size={24} color="black" />}
            />
          }
          routeName="Message Details"
        />
      }
      footer={
        <View>
          <TouchableOpacity
            onPress={handleSend}
            style={[
              styles.sentBtn,
              (recivers.length === 0 || body === '' || subject === '') &&
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
                size="small"
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
            ]}>
            {isDrafting ? (
              <ActivityIndicator
                size="small"
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
          {/** Extra Recievers */}
          <ReceiversModal
            showModal={showModal}
            handleX={handleX}
            setShowModal={setShowModal}
            recivers={recivers}
            isHandleX={true}
          />
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
                onPress={() =>
                  handleReciever({
                    name: usr.user_name,
                    profile_picture: usr.profile_picture.thumbnail,
                  })
                }
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
                        headers: {
                          Authorization: `Bearer ${userInfo?.access_token}`,
                        },
                      }}
                      fallback={fallbacks}
                    />
                    <Text style={[styles.item]}>{usr?.user_name}</Text>
                  </View>
                  <View style={styles.itemListWrapper} />
                  {receiverNames.includes(usr.user_name) && (
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
                    uri: `${url}/${recivers[recivers.length - 1].profile_picture}`,
                    headers: {
                      Authorization: `Bearer ${userInfo?.access_token}`,
                    },
                  }}
                  fallback={fallbacks}
                />
                <Text style={styles.textGreen}>
                  {recivers[recivers.length - 1].name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleX(recivers[recivers.length - 1].name)}>
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
});

export default DraftsDetails;

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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingStyle: {transform: [{scaleX: 0.8}, {scaleY: 0.8}]},
});
