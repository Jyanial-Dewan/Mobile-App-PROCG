import {getSnapshot, Instance, SnapshotOut, types} from 'mobx-state-tree';

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
    refreshing: types.optional(types.boolean, false),
  })
  .actions(self => ({
    setRefreshing(value: boolean) {
      self.refreshing = value;
    },
    saveAlerts(alerts: Array<AlertStoreSnapshotType>) {
      const alertsData = alerts.map(alert => AlertModel.create(alert));
      self.alerts.replace(alertsData);
    },
    saveNotificationAlerts(alerts: Array<AlertStoreSnapshotType>) {
      const alertsData = alerts.map(alert => AlertModel.create(alert));
      self.notificationAlerts.replace(alertsData);
      self.notificationAlertsCount = alertsData.length;
    },
    addAlert(alert: AlertStoreSnapshotType) {
      const alertData = AlertModel.create(alert);
      self.alerts.unshift(alertData);
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

    // readAlert(alert: AlertStoreSnapshotType) {
    //   const alertItem = self.notificationAlerts.find(
    //     item => item.alert_id === alert.alert_id,
    //   );
    //   if (alertItem) {
    //     self.notificationAlerts.remove(alertItem);
    //     self.notificationAlertsCount--;

    //     // remove reader from alerts

    //     self.alerts.forEach(item => {
    //       if (item.alert_id === alert.alert_id) {
    //         // Log for debugging
    //         // console.log('before readers:', item.readers);

    //         // Check if user_id exists in the readers and remove it
    //         const index = item.readers.indexOf(alert.user_id);
    //         if (index !== -1) {
    //           item.readers.splice(index, 1);
    //         }
    //       }
    //     });
    //   }
    // },
  }));

export type AlertsStoreType = Instance<typeof AlertModel>;
export type AlertStoreSnapshotType = SnapshotOut<typeof AlertModel>;
// export type AlertStoreSnapshotType = SnapshotOut<typeof AlertsStore>;
