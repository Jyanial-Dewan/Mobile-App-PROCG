import {detach, Instance, SnapshotOut, types} from 'mobx-state-tree';

export const ActionItemsModel = types.model('ActionItemsModel', {
  action_item_id: types.number,
  action_item_name: types.string,
  user_id: types.number,
  user_name: types.string,
  description: types.string,
  status: types.string,
  notification_status: types.string,
  notification_id: types.string,
  created_by: types.number,
  creation_date: types.Date,
  last_updated_by: types.number,
  last_update_date: types.Date,
});
export const ActionItemsStore = types
  .model('ActionItemsStore', {
    actionItems: types.array(ActionItemsModel),
    refreshing: types.optional(types.boolean, false),
  })
  .actions(self => ({
    setRefreshing(value: boolean) {
      self.refreshing = value;
    },

    initialActionItems(items: Array<ActionItemsStoreSnapshotType>) {
      const newAlerts = items.map(actionItem =>
        ActionItemsModel.create({
          ...actionItem,
          creation_date: new Date(actionItem.creation_date),
          last_update_date: new Date(actionItem.last_update_date),
        }),
      );
      self.actionItems.replace(newAlerts);
    },

    saveActionItems(items: ActionItemsStoreSnapshotType[]) {
      const newAlerts = items.map(actionItem =>
        ActionItemsModel.create({
          ...actionItem,
          creation_date: new Date(actionItem.creation_date),
          last_update_date: new Date(actionItem.last_update_date),
        }),
      );

      self.actionItems.replace(newAlerts);
    },

    updateActionItem(actionItemId: number, status: string) {
      this.setRefreshing(true);
      self.actionItems.forEach(item => {
        if (item.action_item_id === actionItemId) {
          item.status = status;
        }
      });
    },
  }));

export type ActionItemsStoreType = Instance<typeof ActionItemsModel>;
export type ActionItemsStoreSnapshotType = SnapshotOut<typeof ActionItemsModel>;
