import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {io, Socket} from 'socket.io-client';
import {useRootStore} from '../stores/rootStore';
import {DeviceModel} from '../types/device/device';
import {MsgBroker} from '../../App';
import {useNetInfo} from '@react-native-community/netinfo';
import {MessageSnapshotType} from '../stores/messageStore';
export type NotificationType = 'Drafts' | 'Sent' | 'Inbox' | 'Recycle';
export type DraftNotificationType = 'New' | 'Old';
export type MessagePayload = {
  notification: MessageSnapshotType;
  type: NotificationType;
};
export type DraftPayload = {
  notification: MessageSnapshotType;
  type: DraftNotificationType;
};
interface SocketContextProps {
  children: ReactNode;
}
interface InActiveDevicesProps {
  inactiveDevices: DeviceModel[];
  userId: number;
}
interface SocketContext {
  socket: Socket;
  setUserId: (userId: number | null | undefined) => void;
  sendMessage: (
    notificationId: string,
    sender: number,
    recipients: number[],
  ) => void;
  draftMessage: (
    notificationId: string,
    sender: number,
    type: DraftNotificationType,
  ) => void;
  deleteMessage: (notificationId: string, type: NotificationType) => void;
  multipleDeleteMessage: (notificationIds: string[]) => void;
  readMessage: (parentId: string) => void;
  SendAlert: (
    alertId: number,
    recipients: number[],
    isAcknowledge: boolean,
  ) => void;
  addDevice: (device: DeviceModel) => void;
  inactiveDevice: (deviceInfoData: InActiveDevicesProps) => void;
  handleDisconnect: () => void;
}
const SocketContext = createContext({} as SocketContext);

export function useSocketContext() {
  return useContext(SocketContext);
}

export function SocketContextProvider({children}: SocketContextProps) {
  const {userInfo, deviceInfoData, messageStore, devicesStore, alertsStore} =
    useRootStore();
  const [userId, setUserId] = useState<number | null | undefined>(null);
  const hasInternet = useNetInfo().isConnected;

  // Memoize the socket connection so that it's created only once
  const socket = useMemo(() => {
    // console.log(username, 'socket');
    // return io('wss://procg.datafluent.team', {
    return io(MsgBroker, {
      path: '/socket.io/',
      query: {
        key: userId,
        device_id: deviceInfoData.id,
      },
      transports: ['websocket'],
    });
  }, [userId, deviceInfoData.id]);

  useEffect(() => {
    if (!userId) {
      console.log('No username set, skipping socket connection');
      return;
    }
    if (hasInternet) socket.connect();
    socket.on('connect', () => {
      console.log('Connected to WebSocket', socket.id, userId);
    });

    socket?.on('receivedMessage', data => {
      const formattedData = {
        ...data,
        creation_date: new Date(data.creation_date),
        last_update_date: new Date(data.last_update_date),
      };
      messageStore.addReceivedMessage(formattedData);
      messageStore.addNotificationMessage(formattedData);
      // messageStore.addTotalReceived();
    });

    socket?.on('sentMessage', data => {
      const formattedData = {
        ...data,
        creation_date: new Date(data.creation_date),
        last_update_date: new Date(data.last_update_date),
      };
      const existDraftMsg = messageStore.draftMessages.find(
        msg => msg.notification_id === formattedData.notification_id,
      );
      if (existDraftMsg) {
        messageStore.removeDraftMessage(formattedData.notification_id);
      }
      messageStore.addSentMessage(formattedData);
      // messageStore.addTotalSent();
    });

    socket?.on('draftMessage', ({notification, type}: DraftPayload) => {
      messageStore.addDraftMessage(notification);
      // messageStore.addTotalDraft();
    });
    // socket?.on('draftMessage', ({notification, type}: DraftPayload) => {
    //   if (type === 'Old') {
    //     const newDraftMessages = messageStore.draftMessages.filter(
    //       msg => msg.notification_id === notification.notification_id,
    //     );
    //     if (newDraftMessages) {
    //       messageStore.addDraftMessage({...newDraftMessages});
    //     }
    //     // if (notification.recipients === undefined) {
    //     //   messageStore.addDraftMessage({
    //     //     ...notification,
    //     //     recipients: [],
    //     //   });
    //     // } else {
    //     //   messageStore.addDraftMessage(notification);
    //     // }
    //   } else {
    //     if (notification.recipients === undefined) {
    //       messageStore.addDraftMessage({
    //         ...notification,
    //         recipients: [],
    //       });
    //     } else {
    //       messageStore.addDraftMessage(notification);
    //     }
    //     messageStore.addTotalDraft();
    //   }

    //   // const formattedData = {
    //   //   ...data,
    //   //   creation_date: new Date(data.creation_date),
    //   //   last_update_date: new Date(data.last_update_date),
    //   // };
    //   // messageStore.addDraftMessage(formattedData);
    //   // messageStore.addTotalDraft();
    // });

    // socket?.on('draftMessage', id => {
    //   messageStore.sendDraftMessage(id);
    // });

    socket?.on('sync', id => {
      messageStore.readNotificationMessage(id);
    });

    socket?.on('deletedMessage', ({notification, type}) => {
      if (type === 'Inbox') {
        // messageStore.addBinMessage(notification);
        messageStore.removeReceivedMessage(notification.notification_id);
        messageStore.removeNotificationMessage(notification.notification_id);
      } else if (type === 'Sent') {
        // messageStore.addBinMessage(notification);
        messageStore.removeSentMessage(notification.notification_id);
      } else if (type === 'Drafts') {
        // messageStore.addBinMessage(notification);
        messageStore.removeDraftMessage(notification.notification_id);
      } else if (type === 'Recycle') {
        messageStore.removeBinMessage(notification.notification_id);
      }
      // Message is not in the bin → Move it to the bin
      // if (
      //   messageStore.receivedMessages.some(msg => msg.notification_id === id)
      // ) {
      //   messageStore.removeReceivedMessage(id);
      // } else if (
      //   messageStore.notificationMessages.some(
      //     msg => msg.notification_id === id,
      //   )
      // ) {
      //   messageStore.removeNotificationMessage(id);
      // } else if (
      //   messageStore.sentMessages.some(msg => msg.notification_id === id)
      // ) {
      //   console.log('App tsx', id);
      //   messageStore.removeSentMessage(id);
      // } else if (
      //   messageStore.draftMessages.some(msg => msg.notification_id === id)
      // ) {
      //   messageStore.removeDraftMessage(id);
      // } else if (
      //   messageStore.binMessages.some(msg => msg.notification_id === id)
      // ) {
      //   messageStore.removeBinMessage(id);
      // }
    });

    // Device Action
    socket?.on('addDevice', device => {
      devicesStore.addDevice(device);
    });

    socket.on('restoreMessage', ({notification, type}) => {
      console.log('restoreMessage', notification, type);
      try {
        if (type === 'Drafts') {
          messageStore.addDraftMessage(notification);
          // messageStore.addTotalDraft();
        } else if (type === 'Sent') {
          messageStore.addSentMessage(notification);
          // messageStore.addTotalSent();
        } else if (type === 'Inbox') {
          messageStore.addReceivedMessage(notification);
          // messageStore.addTotalReceived();
          if (notification.reader === true) {
            messageStore.saveNotificationMessages(notification);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        messageStore.removeBinMessage(notification.notification_id);
      }
      // // messageStore.setRefreshing(true);
      // const message = messageStore.binMessages.find(
      //   msg => msg.notification_id === notification.notification_id,
      // );
      // try {
      //   if (!message || !userId) return;
      //   const formattedData: MessageSnapshotType = {
      //     ...message,
      //     creation_date: new Date(message.creation_date).getTime(),
      //     last_update_date: new Date(message.last_update_date).getTime(),
      //   };
      //   if (formattedData?.status.toLocaleLowerCase() === 'draft') {
      //     messageStore.addDraftMessage(formattedData);
      //     messageStore.addTotalDraft();
      //   } else {
      //     if (formattedData?.sender === userId) {
      //       messageStore.addSentMessage(formattedData);
      //       messageStore.addTotalSent();
      //     } else {
      //       messageStore.addReceivedMessage(formattedData);
      //       messageStore.addTotalReceived();
      //     }
      //   }
      // } catch (error) {
      //   console.log(error);
      // } finally {
      //   messageStore.removeBinMessage(id);
      // }
    });

    socket.on('SentAlert', ({alert, isAcknowledge}) => {
      if (isAcknowledge) {
        alertsStore.readAlert(alert.alert_id);
      } else {
        alertsStore.addAlert(alert);
      }
    });

    return () => {
      socket?.off('receivedMessage');
      socket?.off('draftMessage');
      socket?.off('sentMessage');
      socket?.off('sync');
      socket?.off('deletedMessage');
      socket?.off('addDevice');
      socket?.off('restoreMessage');
      socket?.off('SentAlert');
    };
  }, [socket, userId]);

  const sendMessage = (
    notificationId: string,
    sender: number,
    recipients: number[],
  ) => {
    socket?.emit('sendMessage', {
      notificationId,
      sender,
      recipients,
    });
  };
  const draftMessage = (
    notificationId: string,
    sender: number,
    type: DraftNotificationType,
  ) => {
    socket?.emit('sendDraft', {
      notificationId,
      sender,
      type,
    });
  };
  // const sendDraft = (notificationId: string, sender: number) => {
  //   socket?.emit('sendDraft', {
  //     notificationId,
  //     sender,
  //   });
  // };
  const deleteMessage = (notificationId: string, type: NotificationType) => {
    socket?.emit('deleteMessage', {
      notificationId,
      sender: userId,
      type,
    });
  };
  const multipleDeleteMessage = (selectedIds: string[]) => {
    socket?.emit('multipleDelete', {
      ids: selectedIds,
      user: userId,
    });
  };
  const readMessage = (parentId: string) => {
    socket?.emit('read', {
      parentID: parentId,
      sender: userId,
    });
  };
  const SendAlert = (
    alertId: number,
    recipients: number[],
    isAcknowledge: boolean,
  ) => {
    console.log(alertId, recipients, isAcknowledge, 'SendAlert');
    socket.emit('SendAlert', {
      alertId,
      recipients,
      isAcknowledge,
    });
  };

  const addDevice = (device: DeviceModel) => {
    socket?.emit('addDevice', {deviceId: device.id, userId});
  };
  const inactiveDevice = ({inactiveDevices, userId}: InActiveDevicesProps) => {
    socket?.emit('inactiveDevice', {inactiveDevices, userId});
  };

  const handleDisconnect = () => {
    socket?.disconnect();
  };
  return (
    <SocketContext.Provider
      value={{
        socket,
        setUserId,
        sendMessage,
        draftMessage,
        // sendDraft,
        deleteMessage,
        multipleDeleteMessage,
        readMessage,
        SendAlert,
        addDevice,
        inactiveDevice,
        handleDisconnect,
      }}>
      {children}
    </SocketContext.Provider>
  );
}
