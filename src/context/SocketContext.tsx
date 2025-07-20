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

interface SocketContextProps {
  children: ReactNode;
}

interface SocketContext {
  socket: Socket;
  setUserName: React.Dispatch<React.SetStateAction<string | null | undefined>>;
  addDevice: (device: DeviceModel) => void;
  inactiveDevice: (deviceInfoData: {data: DeviceModel[]; user: string}) => void;
}
const SocketContext = createContext({} as SocketContext);

export function useSocketContext() {
  return useContext(SocketContext);
}

export function SocketContextProvider({children}: SocketContextProps) {
  const {userInfo, messageStore, devicesStore} = useRootStore();
  const [username, setUserName] = useState<string | null>();

  // Memoize the socket connection so that it's created only once
  const socket = useMemo(() => {
    // console.log(username, 'socket');
    return io('wss://procg.viscorp.app', {
      path: '/socket.io/',
      query: {
        key: username,
      },
      transports: ['websocket'],
    });
  }, [username]);

  useEffect(() => {
    socket.connect();
    socket.on('connect', () => {
      console.log('Connected to WebSocket', socket.id);
    });

    socket?.on('receivedMessage', data => {
      console.log('recivedMessage', data);
      const formattedData = {...data, date: new Date(data.date)};
      messageStore.addReceivedMessage(formattedData);
      messageStore.addNotificationMessage(formattedData);
      messageStore.addTotalReceived();
    });
    socket?.on('sentMessage', data => {
      const formattedData = {...data, date: new Date(data.date)};
      messageStore.addSentMessage(formattedData);
      messageStore.addTotalSent();
    });
    socket?.on('draftMessage', data => {
      const formattedData = {...data, date: new Date(data.date)};
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
      if (messageStore.receivedMessages.some(msg => msg.id === id)) {
        messageStore.removeReceivedMessage(id);
      } else if (messageStore.notificationMessages.some(msg => msg.id === id)) {
        messageStore.removeNotificationMessage(id);
      } else if (messageStore.sentMessages.some(msg => msg.id === id)) {
        console.log('App tsx', id);
        messageStore.removeSentMessage(id);
      } else if (messageStore.draftMessages.some(msg => msg.id === id)) {
        messageStore.removeDraftMessage(id);
      } else if (messageStore.binMessages.some(msg => msg.id === id)) {
        messageStore.removeBinMessage(id);
      }
    });

    // Device Action
    socket?.on('addDevice', data => {
      devicesStore.addDevice(data);
    });

    socket.on('restoreMessage', id => {
      const message = messageStore.binMessages.find(msg => msg.id === id);
      const deepClone = (obj: any) => {
        return JSON.parse(JSON.stringify(obj));
      };
      try {
        if (!message || !username) return;
        const formattedData = {
          ...message,
          date: new Date(message.date).getTime(),
        };
        const newMessage = deepClone(formattedData);

        if (formattedData.status === 'Draft') {
          messageStore.addDraftMessage(newMessage);
          messageStore.addTotalDraft();
        } else {
          if (formattedData.sender.name === username) {
            messageStore.addSentMessage(newMessage);
            messageStore.addTotalSent();
          } else {
            messageStore.addReceivedMessage(newMessage);
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
  }, [socket]);

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
        setUserName,
        addDevice,
        inactiveDevice,
      }}>
      {children}
    </SocketContext.Provider>
  );
}
