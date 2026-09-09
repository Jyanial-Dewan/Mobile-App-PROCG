import {types, Instance, SnapshotOut, detach, clone} from 'mobx-state-tree';
export const AlertModel = types.model('alertModel', {
  user_id: types.number,
  user_name: types.string,
  notification_id: types.string,
  alert_id: types.number,
  alert_name: types.string,
  description: types.string,
  acknowledge: types.boolean,
  notification_status: types.string,
  created_by: types.number,
  creation_date: types.Date,
  last_updated_by: types.number,
  last_update_date: types.Date,
});

export const AlertsStore = types
  .model('alertsStore', {
    alerts: types.optional(types.array(AlertModel), []),
    notificationAlerts: types.optional(types.array(AlertModel), []),
    notificationAlertsCount: types.optional(types.number, 0),
    refreshing: types.optional(types.boolean, false),
  })
  .actions(self => ({
    setRefreshing(value: boolean) {
      self.refreshing = value;
    },

    initialAlerts(alerts: Array<AlertStoreSnapshotType>) {
      const initialAlerts = alerts.map(alert =>
        AlertModel.create({
          ...alert,
          creation_date: new Date(alert.creation_date),
          last_update_date: new Date(alert.last_update_date),
        }),
      );

      const incommingAlerts = new Set(
        initialAlerts.map(alert => alert.notification_id),
      );
      const existAlerts = self.alerts.filter(
        alert => !incommingAlerts.has(alert.notification_id),
      );
      const mergedAlerts = [...existAlerts, ...initialAlerts].sort(
        (a, b) => b.creation_date.getTime() - a.creation_date.getTime(),
      );
      self.alerts.replace(mergedAlerts);
    },

    saveAlerts(alerts: Array<AlertStoreSnapshotType>) {
      const validAlerts = alerts.map(alert =>
        AlertModel.create({
          ...alert,
          creation_date: new Date(alert.creation_date),
          last_update_date: new Date(alert.last_update_date),
        }),
      );

      const incommingAlerts = new Set(
        validAlerts.map(alert => alert.notification_id),
      );
      const existAlerts = self.alerts.filter(
        alert => !incommingAlerts.has(alert.notification_id),
      );
      self.alerts.replace([...existAlerts, ...validAlerts]);
    },
    saveNotificationAlerts(alerts: AlertStoreSnapshotType[]) {
      self.notificationAlerts.forEach(detach);

      const formattedAlerts = alerts?.map(alert => ({
        ...alert,
        creation_date: new Date(alert.creation_date),
        last_update_date: new Date(alert.last_update_date),
      }));

      const newAlerts = formattedAlerts?.map(alert =>
        AlertModel.create({
          ...alert,
          creation_date: new Date(alert.creation_date),
          last_update_date: new Date(alert.last_update_date),
        }),
      );

      self.notificationAlerts.replace(newAlerts);
    },
    addTotalAlertsCount(count: number) {
      self.notificationAlertsCount = count;
    },

    addAlert(alert: AlertStoreSnapshotType) {
      const alreadyExists = self.alerts.some(
        a => a.alert_id === alert.alert_id,
      );
      if (alreadyExists) {
        return;
      }

      const newAlert = AlertModel.create({
        ...alert,
        creation_date: new Date(alert.creation_date),
        last_update_date: new Date(alert.last_update_date),
      });

      self.alerts.unshift(newAlert);
      self.notificationAlerts.unshift(clone(newAlert));
      self.notificationAlertsCount++;
    },

    readAlert(alert_id: number) {
      const alert = self.alerts.find(a => a.alert_id === alert_id);
      if (alert) {
        alert.acknowledge = true;
      }

      const notificationAlert = self.notificationAlerts.find(
        a => a.alert_id === alert_id,
      );
      if (notificationAlert) {
        self.notificationAlerts.remove(notificationAlert);
        self.notificationAlertsCount--;
      }
    },
  }));

export type AlertsStoreType = Instance<typeof AlertsStore>;
export type AlertStoreSnapshotType = SnapshotOut<typeof AlertModel>;
