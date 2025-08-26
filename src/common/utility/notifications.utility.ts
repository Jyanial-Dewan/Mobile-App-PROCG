import {UserSnapshotType} from '../../stores/usersStore';

export const renderUserName = (
  id: number | null | undefined,
  users: UserSnapshotType[],
) => {
  const user = users.find(usr => usr.user_id === id);

  return user?.user_name;
};

export const renderSlicedUsername = (
  id: number | null | undefined,
  users: UserSnapshotType[],
  limit: number,
) => {
  const user = users.find(usr => usr.user_id === id);

  if (user) {
    const userName = user?.user_name;
    return (
      userName.slice(0, limit) +
      `${user?.user_name.length > limit ? '...' : ''}`
    );
  }
};

export const renderProfilePicture = (
  id: number | null | undefined,
  users: UserSnapshotType[],
) => {
  const user = users.find(usr => usr.user_id === id);

  return user?.profile_picture.thumbnail;
};
