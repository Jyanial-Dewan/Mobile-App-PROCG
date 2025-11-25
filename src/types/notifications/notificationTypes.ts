import {MessageSnapshotType} from '~/stores/messageStore';
import {DeviceModel} from '../device/device';
import {Socket} from 'socket.io-client';

export type NotificationType = 'Drafts' | 'Sent' | 'Inbox' | 'Recycle';
export type DraftNotificationType = 'New' | 'Old';
export type SentNotificationType = 'Sent' | 'Draft';
export type MessagePayload = {
  notification: MessageSnapshotType;
  type: NotificationType;
};
export type DraftPayload = {
  notification: MessageSnapshotType;
  type: DraftNotificationType;
};
export type SentPayload = {
  notification: MessageSnapshotType;
  type: SentNotificationType;
};
export interface InActiveDevicesProps {
  inactiveDevices: DeviceModel[];
  userId: number;
}
export interface SocketContextType {
  socket: Socket;
  setUserId: (userId: number | null | undefined) => void;
  sendMessage: (
    notificationId: string,
    sender: number,
    recipients: number[],
    type: SentNotificationType,
  ) => void;
  draftMessage: (
    notificationId: string,
    sender: number,
    type: DraftNotificationType,
  ) => void;
  deleteMessage: (notificationId: string, type: NotificationType) => void;
  handleParmanentDeleteMessage: (notificationId: string) => void;
  multipleDeleteMessage: (
    notificationIds: string[],
    type: NotificationType,
  ) => void;
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
