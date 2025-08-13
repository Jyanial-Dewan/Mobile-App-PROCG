import {View, Text} from 'react-native';
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
import {MessageSnapshotType} from '~/stores/messageStore';

interface SocketContextProps {
  children: ReactNode;
}

interface SocketContext {
  socket: Socket;
  setUserId: (userId: number | null) => void;
  addDevice: (device: DeviceModel) => void;
  inactiveDevice: (deviceInfoData: {data: DeviceModel[]; user: string}) => void;
}
const SocketContext = createContext({} as SocketContext);

export function useSocketContext() {
  return useContext(SocketContext);
}

export function SocketContextProvider({children}: SocketContextProps) {
  const {userInfo, deviceInfoData, messageStore, devicesStore} = useRootStore();
  const [userId, setUserId] = useState<number | null>(null);
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
      };
      messageStore.addReceivedMessage(formattedData);
      messageStore.addNotificationMessage(formattedData);
      messageStore.addTotalReceived();
    });
    socket?.on('sentMessage', data => {
      const formattedData = {
        ...data,
        creation_date: new Date(data.creation_date),
      };
      messageStore.addSentMessage(formattedData);
      messageStore.addTotalSent();
    });
    socket?.on('draftMessage', data => {
      const formattedData = {
        ...data,
        creation_date: new Date(data.creation_date),
      };
      messageStore.addDraftMessage(formattedData);
      messageStore.addTotalDraft();
    });

    socket?.on('draftMessageId', id => {
      messageStore.sendDraftMessage(id);
    });

    socket?.on('sync', id => {
      messageStore.readNotificationMessage(id);
    });

    socket?.on('deletedMessage', id => {
      // Message is not in the bin → Move it to the bin
      if (
        messageStore.receivedMessages.some(msg => msg.notification_id === id)
      ) {
        messageStore.removeReceivedMessage(id);
      } else if (
        messageStore.notificationMessages.some(
          msg => msg.notification_id === id,
        )
      ) {
        messageStore.removeNotificationMessage(id);
      } else if (
        messageStore.sentMessages.some(msg => msg.notification_id === id)
      ) {
        console.log('App tsx', id);
        messageStore.removeSentMessage(id);
      } else if (
        messageStore.draftMessages.some(msg => msg.notification_id === id)
      ) {
        messageStore.removeDraftMessage(id);
      } else if (
        messageStore.binMessages.some(msg => msg.notification_id === id)
      ) {
        messageStore.removeBinMessage(id);
      }
    });

    // Device Action
    socket?.on('addDevice', data => {
      devicesStore.addDevice(data);
    });

    socket.on('restoreMessage', id => {
      // messageStore.setRefreshing(true);
      const message = messageStore.binMessages.find(
        msg => msg.notification_id === id,
      );
      try {
        if (!message || !userId) return;
        const formattedData: MessageSnapshotType = {
          ...message,
          creation_date: new Date(message.creation_date).getTime(),
        };
        if (formattedData?.status.toLocaleLowerCase() === 'draft') {
          messageStore.addDraftMessage(formattedData);
          messageStore.addTotalDraft();
        } else {
          if (formattedData?.sender === userId) {
            messageStore.addSentMessage(formattedData);
            messageStore.addTotalSent();
          } else {
            messageStore.addReceivedMessage(formattedData);
            messageStore.addTotalReceived();
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        messageStore.removeBinMessage(id);
      }
    });

    return () => {
      socket?.off('receivedMessage');
      socket?.off('draftMessage');
      socket?.off('sentMessage');
      socket?.off('sync');
      socket?.off('deletedMessage');
      socket?.off('draftMessageId');
      socket?.off('addDevice');
      socket?.off('restoreMessage');
    };
  }, [socket, userId]);

  const addDevice = (device: DeviceModel) => {
    socket?.emit('addDevice', device);
  };
  const inactiveDevice = (deviceInfoData: {
    data: DeviceModel[];
    user: string;
  }) => {
    socket?.emit('inactiveDevice', deviceInfoData);
  };
  return (
    <SocketContext.Provider
      value={{
        socket,
        setUserId,
        addDevice,
        inactiveDevice,
      }}>
      {children}
    </SocketContext.Provider>
  );
}
