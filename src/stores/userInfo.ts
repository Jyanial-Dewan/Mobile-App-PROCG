import {Instance, SnapshotOut, types} from 'mobx-state-tree';

const ProfilePictureModel = types.model('ProfilePictureModel', {
  original: types.string,
  thumbnail: types.string,
});

export const UserInfoStore = types.model('UserInfoStore', {
  isLoggedIn: types.maybeNull(types.boolean),
  user_id: types.maybeNull(types.number),
  // sub: types.maybeNull(types.string),
  user_type: types.maybeNull(types.string),
  user_name: types.maybeNull(types.string),
  email_address: types.maybeNull(types.string),
  first_name: types.maybeNull(types.string),
  last_name: types.maybeNull(types.string),
  middle_name: types.maybeNull(types.string),
  job_title: types.maybeNull(types.string),
  last_update_date: types.maybeNull(types.string),
  last_updated_by: types.maybeNull(types.number),
  creation_date: types.maybeNull(types.string),
  created_by: types.maybeNull(types.number),
  user_invitation_id: types.maybeNull(types.number),
  tenant_id: types.maybeNull(types.number),
  access_token: types.maybeNull(types.string),
  refresh_token: types.maybeNull(types.string),
  // issuedAt: types.maybeNull(types.string),
  profile_picture: ProfilePictureModel,
});

export type UserInfoStoreType = Instance<typeof UserInfoStore>;
export type UserInfoSnapshotType = SnapshotOut<typeof UserInfoStore>;
