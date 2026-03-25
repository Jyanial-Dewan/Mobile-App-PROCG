import {Instance, SnapshotOut, types} from 'mobx-state-tree';

const MFAMethodsModel = types.model('MFAMethods', {
  mfa_id: types.number,
  mfa_type: types.string,
});

export const MFAModel = types.model('MFAModel', {
  message: types.string,
  mfa_methods: types.array(MFAMethodsModel),
  mfa_required: types.boolean,
  mfa_token: types.string,
});

export const MFAStore = types
  .model('MFAStore', {
    mfaResponse: types.maybeNull(MFAModel),
    refreshing: types.optional(types.boolean, false),
  })
  .actions(self => ({
    setRefreshing(value: boolean) {
      self.refreshing = value;
    },

    setMfaResponse(response: typeof MFAModel.Type) {
      self.mfaResponse = MFAModel.create(response);
    },
  }));

export type MFAStoreType = Instance<typeof MFAStore>;
export type MFAStoreSnapshotType = SnapshotOut<typeof MFAStore>;
