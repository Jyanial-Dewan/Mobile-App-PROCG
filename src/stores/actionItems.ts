import {Instance, SnapshotOut, types} from 'mobx-state-tree';

export const ActionItemsModel = types.model('ActionItemsModel', {
  action_item_id: types.number,
  action_item_name: types.string,
  user_id: types.number,
  user_name: types.string,
  description: types.string,
  status: types.string,
  notification_id: types.string,
  created_by: types.number,
  creation_date: types.string,
  last_updated_by: types.number,
  last_update_date: types.string,
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

    saveActionItems(items: ActionItemsStoreType[]) {
      const alertsData = items.map(item => ActionItemsModel.create(item));
      self.actionItems.replace(alertsData);
    },
  }));

export type ActionItemsStoreType = Instance<typeof ActionItemsModel>;
export type ActionItemsStoreSnapshotType = SnapshotOut<typeof ActionItemsModel>;
