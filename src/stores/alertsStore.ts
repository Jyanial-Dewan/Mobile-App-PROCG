import {Instance, SnapshotOut, types} from 'mobx-state-tree';

export const AlertModel = types.model('alertModel', {
  user_id: types.number,
  user_name: types.string,
  notification_id: types.string,
  alert_id: types.number,
  alert_name: types.string,
  description: types.string,
  readers: types.array(types.number),
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
  })
  .actions(self => ({
    saveAlerts(alerts: Array<AlertStoreSnapshotType>) {
      const alertsData = alerts.map(alert => AlertModel.create(alert));
      const notificationAlertsData = alerts
        .map(alert => {
          return !alert.readers.length ? AlertModel.create(alert) : null;
        })
        .filter(alert => alert !== null);
      console.log(
        alertsData,
        notificationAlertsData,
        'wwwwwwwwwwwwwwwwwwwwwwww',
      );
      // Replace the arrays
      self.alerts.replace(alertsData);
      self.notificationAlerts.replace(notificationAlertsData);
      self.notificationAlertsCount = notificationAlertsData.length;
    },
    addAlert(alert: AlertStoreSnapshotType) {
      const alertData = AlertModel.create(alert);
      self.alerts.unshift(alertData);
    },
    readAlert(alert_id: number) {
      const alertToRemove = self.notificationAlerts.find(
        alert => alert.alert_id === alert_id,
      );
      if (alertToRemove) {
        self.notificationAlerts.remove(alertToRemove);
      }
    },
  }));

export type AlertsStoreType = Instance<typeof AlertModel>;
export type AlertStoreSnapshotType = SnapshotOut<typeof AlertModel>;
// export type AlertStoreSnapshotType = SnapshotOut<typeof AlertsStore>;
