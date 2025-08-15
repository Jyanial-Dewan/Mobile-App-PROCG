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
  creation_date: types.string,
  last_updated_by: types.number,
  last_update_date: types.string,
});

export const AlertsStore = types
  .model('alertsStore', {
    alerts: types.array(AlertModel),
    notificationAlerts: types.array(AlertModel),
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
          creation_date: alert.creation_date,
          last_update_date: alert.last_update_date,
        }),
      );
      self.alerts.replace(alertsData);
    },
    saveNotificationAlerts(alerts: Array<AlertStoreSnapshotType>) {
      const alertsData = alerts.map(alert => AlertModel.create(alert));
      self.notificationAlerts.replace(alertsData);
      self.notificationAlertsCount = alertsData.length;
    },
    addAlert(alert: AlertStoreSnapshotType) {
      self.alerts.unshift(alert);
      self.notificationAlerts.unshift(alert);
      self.notificationAlertsCount++;
    },
    readAlert(alert_id: number) {
      const notificationAlertItem = self.notificationAlerts.find(
        alert => alert.alert_id === alert_id,
      );
      if (notificationAlertItem) {
        getSnapshot(notificationAlertItem);
        self.notificationAlerts.remove(notificationAlertItem);
        self.notificationAlertsCount--;
      }
    },
  }));

export type AlertsStoreType = Instance<typeof AlertModel>;
export type AlertStoreSnapshotType = SnapshotOut<typeof AlertModel>;
