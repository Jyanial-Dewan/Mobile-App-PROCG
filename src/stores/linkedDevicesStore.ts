import {
  getSnapshot,
  Instance,
  SnapshotIn,
  SnapshotOut,
  types,
} from 'mobx-state-tree';

export const DeviceModel = types.model('deviceModel', {
  id: types.number,
  user_id: types.number,
  os: types.string,
  browser_name: types.string,
  device_type: types.string,
  browser_version: types.string,
  user_agent: types.string,
  is_active: types.number,
  added_at: types.string,
  ip_address: types.string,
  location: types.string,
  user: types.string,
});

export const DevicesStore = types
  .model('DevicesStore', {
    devices: types.array(DeviceModel),
  })
  .actions(self => ({
    setDevices(data: SnapshotIn<typeof DeviceModel>[]) {
      const validDevices = data.map(device => DeviceModel.create(device));
      self.devices.replace(validDevices);
    },
    addDevice(data: SnapshotIn<typeof DeviceModel>) {
      const previousDevice = self.devices.find(
        item => item.id === data.id && item.is_active === data.is_active,
      );
      if (!previousDevice) {
        self.devices.unshift(DeviceModel.create(data));
      } else {
        console.log('Device already exists', data.id);
        return [...self.devices, DeviceModel.create(data)];
      }
    },

    inactiveDevice(data: SnapshotIn<typeof DeviceModel>) {
      const device = self.devices.find(device => device.id === data.id);
      if (device) {
        device.is_active = 0;
      }
    },
  }))
  .views(self => ({
    get allDevices() {
      return self.devices.slice();
    },
    getDeviceById(id: number) {
      return self.devices.find(device => device.id === id);
    },
  }));

export type DevicesStoreType = Instance<typeof DevicesStore>;
export type DevicesStoreSnapshotType = SnapshotOut<typeof DevicesStore>;
