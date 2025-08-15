import {getSnapshot, Instance, SnapshotOut, types} from 'mobx-state-tree';

export const AlertModel = types.model('alertModel', {
  user_id: types.number,
  user_name: types.string,
  notification_id: types.string,
  alert_id: types.number,
  alert_name: types.string,
  description: types.string,
  acknowledge: types.boolean,
  status: types.string,
  created_by: types.number,
  creation_date: types.Date,
  last_updated_by: types.number,
  last_update_date: types.Date,
});

export const AlertsStore = types
  .model('alertsStore', {
    alerts: types.optional(types.array(AlertModel), []),
    notificationAlerts: types.optional(types.array(AlertModel), []),
    notificationAlertsCount: types.number,
    refreshing: types.optional(types.boolean, false),
  })
  .actions(self => ({
    setRefreshing(value: boolean) {
      self.refreshing = value;
    },
    saveAlerts(alerts: Array<AlertStoreSnapshotType>) {
      const alertsData = alerts.map(alert =>
        AlertModel.create({
          ...alert,
          creation_date: new Date(alert.creation_date).getTime(),
          last_update_date: new Date(alert.last_update_date).getTime(),
        }),
      );
      self.alerts.replace(alertsData);
    },
    saveNotificationAlerts(alerts: Array<AlertStoreSnapshotType>) {
      const alertsData = alerts.map(alert =>
        AlertModel.create({
          ...alert,
          creation_date: new Date(alert.creation_date).getTime(),
          last_update_date: new Date(alert.last_update_date).getTime(),
        }),
      );
      self.notificationAlerts.replace(alertsData);
      self.notificationAlertsCount = alertsData.length;
    },
    addAlert(alert: AlertStoreSnapshotType) {
      const formatedAlert = {
        ...alert,
        creation_date: new Date(alert.creation_date).getTime(),
        last_update_date: new Date(alert.last_update_date).getTime(),
      };
      self.alerts.unshift(formatedAlert);
      self.notificationAlerts.unshift(formatedAlert);
      self.notificationAlertsCount++;
    },
    readAlert(alert_id: number) {
      const alert = self.notificationAlerts.find(
        alert => alert.alert_id === alert_id,
      );
      if (alert) {
        getSnapshot(alert);
        self.notificationAlerts.remove(alert);
        self.notificationAlertsCount--;
      }
    },
  }));

export type AlertsStoreType = Instance<typeof AlertModel>;
export type AlertStoreSnapshotType = SnapshotOut<typeof AlertModel>;
