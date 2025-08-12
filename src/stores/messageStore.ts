import {getSnapshot, Instance, SnapshotOut, types} from 'mobx-state-tree';

const userModeL = types.model('userModel', {
  name: types.string,
  profile_picture: types.string,
});

export const MessageModel = types.model('messageModel', {
  notification_id: types.string,
  notification_type: types.string,
  sender: types.number,
  recipients: types.array(types.number),
  subject: types.string,
  notification_body: types.string,
  creation_date: types.Date,
  status: types.string,
  parent_notification_id: types.string,
  involved_users: types.array(types.number),
  readers: types.array(types.number),
  holders: types.array(types.number),
  recycle_bin: types.array(types.number),
  action_item_id: types.maybeNull(types.number),
  alert_id: types.maybeNull(types.number),
});

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
        }),
      );
      self.notificationMessages.replace(validMsgs);
    },
    addNotificationMessage(msg: MessageSnapshotType) {
      self.notificationMessages.unshift(msg);
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
    saveReceivedMessages(msgs: Array<MessageSnapshotType>) {
      const validMsgs = msgs.map(msg =>
        MessageModel.create({
          ...msg,
          creation_date: new Date(msg.creation_date),
        }),
      );

      const incommingMsgs = new Set(validMsgs.map(msg => msg.notification_id));
      const existMsgs = self.receivedMessages.filter(
        msg => !incommingMsgs.has(msg.notification_id),
      );
      self.receivedMessages.replace([...existMsgs, ...validMsgs]);
    },
    addReceivedMessage(msg: MessageSnapshotType) {
      self.receivedMessages.unshift(msg);
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
    addTotalReceived() {
      self.totalReceived++;
    },

    //SentMessages
    saveSentMessages(msgs: Array<MessageSnapshotType>) {
      // const validMsgs = msgs.map(msg => MessageModel.create(msg));
      // self.sentMessages.replace(validMsgs);

      const validMsgs = msgs.map(msg =>
        MessageModel.create({
          ...msg,
          creation_date: new Date(msg.creation_date),
        }),
      );

      const incommingMsgs = new Set(validMsgs.map(msg => msg.notification_id));
      const existMsgs = self.sentMessages.filter(
        msg => !incommingMsgs.has(msg.notification_id),
      );
      self.sentMessages.replace([...existMsgs, ...validMsgs]);
    },
    addSentMessage(msg: MessageSnapshotType) {
      self.sentMessages.unshift(msg);
    },
    removeSentMessage(notificationId: string) {
      const messageToRemove = self.sentMessages.find(
        message => message.notification_id === notificationId,
      );
      if (messageToRemove) {
        const cloned = getSnapshot(messageToRemove);
        self.sentMessages.remove(messageToRemove);
        console.log(messageToRemove, 'removed');
        this.addBinMessage(cloned);
        self.totalSent--;
      }
    },
    setTotalSent(total: number) {
      self.totalSent = total;
    },
    addTotalSent() {
      self.totalSent++;
    },

    //DraftMessages
    saveDraftMessages(msgs: Array<MessageSnapshotType>) {
      // const validMsgs = msgs.map(msg => MessageModel.create(msg));
      // self.draftMessages.replace(validMsgs);
      const validMsgs = msgs.map(msg =>
        MessageModel.create({
          ...msg,
          creation_date: new Date(msg.creation_date),
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
        });
      } else {
        // Add new message at the start as a model instance
        self.draftMessages.unshift(msg);
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
    addTotalDraft() {
      self.totalDraft++;
    },

    //BinMessages
    saveBinMessages(msgs: Array<MessageSnapshotType>) {
      const validMsgs = msgs.map(msg =>
        MessageModel.create({
          ...msg,
          creation_date: new Date(msg.creation_date),
        }),
      );

      const incommingMsgs = new Set(validMsgs.map(msg => msg.notification_id));
      const existMsgs = self.binMessages.filter(
        msg => !incommingMsgs.has(msg.notification_id),
      );
      self.binMessages.replace([...existMsgs, ...validMsgs]);
    },
    addBinMessage(msg: MessageSnapshotType) {
      self.binMessages.unshift(msg);
      self.totalBin++;
    },
    removeBinMessage(notificationId: string) {
      const messageToRemove = self.binMessages.find(
        message => message.notification_id === notificationId,
      );

      if (messageToRemove) {
        self.binMessages.remove(messageToRemove);
        console.log(messageToRemove, 'removed');
        self.totalBin--;
      }
    },
    setTotalBin(total: number) {
      self.totalBin = total;
    },
    addTotalBin() {
      self.totalBin++;
    },
  }));

export type MessageType = Instance<typeof MessageModel>;
export type MessageSnapshotType = SnapshotOut<typeof MessageModel>;
