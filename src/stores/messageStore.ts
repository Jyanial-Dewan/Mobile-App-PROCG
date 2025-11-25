import {getSnapshot, Instance, SnapshotOut, types} from 'mobx-state-tree';

const userModeL = types.model('userModel', {
  name: types.string,
  profile_picture: types.string,
});

export const MessageModel = types.model('messageModel', {
  action_item_id: types.maybeNull(types.number),
  alert_id: types.maybeNull(types.number),
  created_by: types.number,
  creation_date: types.Date,
  holder: types.boolean,
  involved_users: types.array(types.number),
  last_update_date: types.Date,
  last_updated_by: types.number,
  notification_body: types.string,
  notification_id: types.string,
  notification_type: types.string,
  parent_notification_id: types.string,
  reader: types.boolean,
  recipient: types.boolean,
  recipients: types.array(types.number),
  recycle_bin: types.boolean,
  sender: types.number,
  status: types.string,
  subject: types.string,
  user_id: types.number,
});
// export const MessageModel = types.model('messageModel', {
//   notification_id: types.string,
//   notification_type: types.string,
//   sender: types.number,
//   recipients: types.array(types.number),
//   subject: types.string,
//   notification_body: types.string,
//   creation_date: types.Date,
//   status: types.string,
//   parent_notification_id: types.string,
//   involved_users: types.array(types.number),
//   readers: types.array(types.number),
//   holders: types.array(types.number),
//   recycle_bin: types.array(types.number),
//   action_item_id: types.maybeNull(types.number),
//   alert_id: types.maybeNull(types.number),
// });

export const MessageStore = types
  .model('messageStore', {
    receivedMessages: types.array(MessageModel),
    sentMessages: types.array(MessageModel),
    draftMessages: types.array(MessageModel),
    binMessages: types.array(MessageModel),
    notificationMessages: types.array(MessageModel),
    totalReceived: types.number,
    totalSent: types.number,
    totalDraft: types.number,
    totalBin: types.number,
    refreshing: types.optional(types.boolean, false),
  })
  .actions(self => ({
    setRefreshing(value: boolean) {
      self.refreshing = value;
    },

    // Notification Messages
    saveNotificationMessages(msgs: Array<MessageSnapshotType>) {
      const validMsgs = msgs.map(msg =>
        MessageModel.create({
          ...msg,
          creation_date: new Date(msg.creation_date),
          last_update_date: new Date(msg.last_update_date),
        }),
      );
      self.notificationMessages.replace(validMsgs);
    },

    addNotificationMessage(msg: MessageSnapshotType) {
      const clonedMessage = {
        ...msg,
        creation_date: new Date(msg.creation_date),
        last_update_date: new Date(msg.last_update_date),
      };
      self.notificationMessages.unshift(clonedMessage);
    },

    readNotificationMessage(notificationId: string) {
      const messageToRemove = self.notificationMessages.find(
        message => message.notification_id === notificationId,
      );
      if (messageToRemove) {
        self.notificationMessages.remove(messageToRemove);
      }
    },
    removeNotificationMessage(notificationId: string) {
      const messageToRemove = self.notificationMessages.find(
        message => message.notification_id === notificationId,
      );
      if (messageToRemove) {
        const snapshot = getSnapshot(messageToRemove);
        self.notificationMessages.remove(messageToRemove);
        this.addBinMessage(snapshot);
      }
    },

    //ReceivedMessages
    initialReceivedMessages(msgs: Array<MessageSnapshotType>) {
      const initialMsg = msgs.map(msg =>
        MessageModel.create({
          ...msg,
          creation_date: new Date(msg.creation_date),
          last_update_date: new Date(msg.last_update_date),
        }),
      );
      self.receivedMessages.replace(initialMsg);
    },

    saveReceivedMessages(msgs: Array<MessageSnapshotType>) {
      const validMsgs = msgs.map(msg =>
        MessageModel.create({
          ...msg,
          creation_date: new Date(msg.creation_date),
          last_update_date: new Date(msg.last_update_date),
        }),
      );

      const incommingMsgs = new Set(validMsgs.map(msg => msg.notification_id));
      const existMsgs = self.receivedMessages.filter(
        msg => !incommingMsgs.has(msg.notification_id),
      );
      self.receivedMessages.replace([...existMsgs, ...validMsgs]);
    },

    addReceivedMessage(msg: MessageSnapshotType) {
      const clonedMessage = {
        ...msg,
        creation_date: new Date(msg.creation_date),
        last_update_date: new Date(msg.last_update_date),
      };
      self.receivedMessages.unshift(clonedMessage);
      self.totalReceived++;
    },

    removeReceivedMessage(notificationId: string) {
      const messageToRemove = self.receivedMessages.find(
        message => message.notification_id === notificationId,
      );
      if (messageToRemove) {
        const cloned = getSnapshot(messageToRemove);
        self.receivedMessages.remove(messageToRemove);
        self.totalReceived--;
        this.addBinMessage(cloned);
      }
    },

    setTotalReceived(total: number) {
      self.totalReceived = total;
    },

    // addTotalReceived() {
    //   self.totalReceived++;
    // },

    //SentMessages
    initialSentMessages(msgs: Array<MessageSnapshotType>) {
      const initialMsg = msgs.map(msg =>
        MessageModel.create({
          ...msg,
          creation_date: new Date(msg.creation_date),
          last_update_date: new Date(msg.last_update_date),
        }),
      );
      self.sentMessages.replace(initialMsg);
    },

    saveSentMessages(msgs: Array<MessageSnapshotType>) {
      const validMsgs = msgs.map(msg =>
        MessageModel.create({
          ...msg,
          creation_date: new Date(msg.creation_date),
          last_update_date: new Date(msg.last_update_date),
        }),
      );

      const incommingMsgs = new Set(validMsgs.map(msg => msg.notification_id));
      const existMsgs = self.sentMessages.filter(
        msg => !incommingMsgs.has(msg.notification_id),
      );
      self.sentMessages.replace([...existMsgs, ...validMsgs]);
    },
    addSentMessage(msg: MessageSnapshotType) {
      const clonedMessage = {
        ...msg,
        creation_date: new Date(msg.creation_date),
        last_update_date: new Date(msg.last_update_date),
      };
      self.sentMessages.unshift(clonedMessage);
      self.totalSent++;
    },
    removeSentMessage(notificationId: string) {
      const messageToRemove = self.sentMessages.find(
        message => message.notification_id === notificationId,
      );
      if (messageToRemove) {
        const cloned = getSnapshot(messageToRemove);
        self.sentMessages.remove(messageToRemove);
        this.addBinMessage(cloned);
        self.totalSent--;
      }
    },
    setTotalSent(total: number) {
      self.totalSent = total;
    },
    // addTotalSent() {
    //   self.totalSent++;
    // },

    //DraftMessages
    initialDraftMessages(msgs: Array<MessageSnapshotType>) {
      const initialMsg = msgs.map(msg =>
        MessageModel.create({
          ...msg,
          creation_date: new Date(msg.creation_date),
          last_update_date: new Date(msg.last_update_date),
        }),
      );
      self.draftMessages.replace(initialMsg);
    },

    saveDraftMessages(msgs: Array<MessageSnapshotType>) {
      // const validMsgs = msgs.map(msg => MessageModel.create(msg));
      // self.draftMessages.replace(validMsgs);
      const validMsgs = msgs.map(msg =>
        MessageModel.create({
          ...msg,
          creation_date: new Date(msg.creation_date),
          last_update_date: new Date(msg.last_update_date),
        }),
      );

      const incommingMsgs = new Set(validMsgs.map(msg => msg.notification_id));
      const existMsgs = self.draftMessages.filter(
        msg => !incommingMsgs.has(msg.notification_id),
      );

      // Append new messages instead of replacing the whole list
      self.draftMessages.replace([...self.draftMessages, ...validMsgs]);

      // Remove duplicates to avoid redundant messages
      const uniqueMessages = Array.from(
        new Map(
          self.draftMessages.map(msg => [msg.notification_id, msg]),
        ).values(),
      );

      self.draftMessages.replace(uniqueMessages);
    },
    addDraftMessage(msg: MessageSnapshotType) {
      const existingIndex = self.draftMessages.findIndex(
        m => m.notification_id === msg.notification_id,
      );

      if (existingIndex !== -1) {
        // Replace the existing message with a model instance
        self.draftMessages[existingIndex] = MessageModel.create({
          ...msg,
          creation_date: new Date(msg.creation_date),
          last_update_date: new Date(msg.last_update_date),
        });
      } else {
        // Add new message at the start as a model instance
        const clonedMessage = {
          ...msg,
          creation_date: new Date(msg.creation_date),
          last_update_date: new Date(msg.last_update_date),
        };
        self.draftMessages.unshift(clonedMessage);
        self.totalDraft++;
      }
    },
    sendDraftMessage(notificationId: string) {
      const messageToSend = self.draftMessages.find(
        message => message.notification_id === notificationId,
      );
      if (messageToSend) {
        self.draftMessages.remove(messageToSend);
        self.totalDraft--;
      }
    },
    removeDraftMessage(notificationId: string) {
      const messageToRemove = self.draftMessages.find(
        message => message.notification_id === notificationId,
      );
      if (messageToRemove) {
        const snapshot = getSnapshot(messageToRemove);
        // this.addBinMessage(getSnapshot(messageToRemove));
        self.draftMessages.remove(messageToRemove);
        self.totalDraft--;
        this.addBinMessage(snapshot);
      }
    },
    setTotalDraft(total: number) {
      self.totalDraft = total;
    },
    // addTotalDraft() {
    //   self.totalDraft++;
    // },

    //BinMessages
    initialBinMessages(msgs: Array<MessageSnapshotType>) {
      const initialMsg = msgs.map(msg =>
        MessageModel.create({
          ...msg,
          creation_date: new Date(msg.creation_date),
          last_update_date: new Date(msg.last_update_date),
        }),
      );
      self.binMessages.replace(initialMsg);
    },

    saveBinMessages(msgs: Array<MessageSnapshotType>) {
      const validMsgs = msgs.map(msg =>
        MessageModel.create({
          ...msg,
          creation_date: new Date(msg.creation_date),
          last_update_date: new Date(msg.last_update_date),
        }),
      );

      const incommingMsgs = new Set(validMsgs.map(msg => msg.notification_id));
      const existMsgs = self.binMessages.filter(
        msg => !incommingMsgs.has(msg.notification_id),
      );
      self.binMessages.replace([...existMsgs, ...validMsgs]);
    },
    addBinMessage(msg: MessageSnapshotType) {
      const existingIndex = self.binMessages.findIndex(
        m => m.notification_id === msg.notification_id,
      );

      if (existingIndex !== -1) {
        // Replace the existing message with a model instance
        self.binMessages[existingIndex] = MessageModel.create({
          ...msg,
          creation_date: new Date(msg.creation_date),
          last_update_date: new Date(msg.last_update_date),
        });
      } else {
        // Add new message at the start as a model instance
        const clonedMessage = {
          ...msg,
          creation_date: new Date(msg.creation_date),
          last_update_date: new Date(msg.last_update_date),
        };
        self.binMessages.unshift(clonedMessage);
        self.totalBin++;
      }
    },
    removeBinMessage(notificationId: string) {
      const messageToRemove = self.binMessages.find(
        message => message.notification_id === notificationId,
      );

      if (messageToRemove) {
        self.binMessages.remove(messageToRemove);
        self.totalBin--;
      }
    },
    setTotalBin(total: number) {
      self.totalBin = total;
    },
    // addTotalBin() {
    //   self.totalBin++;
    // },
  }));

export type MessageType = Instance<typeof MessageModel>;
export type MessageSnapshotType = SnapshotOut<typeof MessageModel>;
