import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {io} from 'socket.io-client';
import {useRootStore} from '../stores/rootStore';
import {DeviceModel} from '../types/device/device';
import {MsgBroker} from '../../App';
import {useNetInfo} from '@react-native-community/netinfo';
import {
  NotificationType,
  DraftNotificationType,
  SentNotificationType,
  MessagePayload,
  DraftPayload,
  SentPayload,
  SocketContextType,
  InActiveDevicesProps,
} from '../types/notifications/notificationTypes';
interface SocketContextProps {
  children: ReactNode;
}

const SocketContext = createContext({} as SocketContextType);

export function useSocketContext() {
  return useContext(SocketContext);
}

export function SocketContextProvider({children}: SocketContextProps) {
  const {deviceInfoData, messageStore, devicesStore, alertsStore} =
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
    });

    socket?.on('sentMessage', ({notification, type}: SentPayload) => {
      if (type === 'Draft') {
        messageStore.removeDraftMessage(notification.notification_id);
      }
      messageStore.addSentMessage(notification);
    });

    socket?.on('draftMessage', ({notification, type}: DraftPayload) => {
      messageStore.addDraftMessage(notification);
    });

    socket?.on('sync', id => {
      messageStore.readNotificationMessage(id);
    });

    socket?.on('deletedMessage', ({notification, type}: MessagePayload) => {
      if (type === 'Inbox') {
        messageStore.removeReceivedMessage(notification.notification_id);
        messageStore.removeNotificationMessage(notification.notification_id);
        messageStore.addBinMessage(notification);
      } else if (type === 'Sent') {
        messageStore.removeSentMessage(notification.notification_id);
        messageStore.addBinMessage(notification);
      } else if (type === 'Drafts') {
        messageStore.removeDraftMessage(notification.notification_id);
        messageStore.addBinMessage(notification);
      } else if (type === 'Recycle') {
        messageStore.removeBinMessage(notification.notification_id);
      }
    });

    socket.on('permanentDeleteMessage', (notificationId: string) => {
      messageStore.removeBinMessage(notificationId);
    });

    socket?.on('addDevice', device => {
      devicesStore.addDevice(device);
    });

    socket.on('restoreMessage', ({notification, type}: MessagePayload) => {
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
            messageStore.addNotificationMessage(notification);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        messageStore.removeBinMessage(notification.notification_id);
      }
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
      socket?.off('permanentDeleteMessage');
      socket?.off('addDevice');
      socket?.off('restoreMessage');
      socket?.off('SentAlert');
    };
  }, [socket, userId]);

  const sendMessage = (
    notificationId: string,
    sender: number,
    recipients: number[],
    type: SentNotificationType,
  ) => {
    socket?.emit('sendMessage', {
      notificationId,
      sender,
      recipients,
      type,
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

  const deleteMessage = (notificationId: string, type: NotificationType) => {
    socket?.emit('deleteMessage', {
      notificationId,
      sender: userId,
      type,
    });
  };

  const handleParmanentDeleteMessage = (notificationId: string) => {
    socket.emit('permanentDeleteMessage', {notificationId, sender: userId});
  };

  const multipleDeleteMessage = (
    selectedIds: string[],
    type: NotificationType,
  ) => {
    socket?.emit('multipleDelete', {
      ids: selectedIds,
      user: userId,
      type,
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
        deleteMessage,
        handleParmanentDeleteMessage,
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
