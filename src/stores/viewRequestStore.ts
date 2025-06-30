import axios from 'axios';
import {flow, Instance, SnapshotOut, types} from 'mobx-state-tree';
import {api} from '../common/api/api';

import {useRootStore} from './rootStore';

export const viewRequestModel = types.model('RequestModel', {
  request_id: types.number,
  timestamp: types.string,
  status: types.string,
  user_task_name: types.maybeNull(types.string),
  user_schedule_name: types.maybeNull(types.string),
  parameters: types.maybeNull(types.optional(types.map(types.integer), {})),
  result: types.maybeNull(types.map(types.union(types.string, types.number))),
});

export const viewRequestStore = types
  .model('RequestStore', {
    requests: types.array(viewRequestModel),
    loading: types.optional(types.boolean, false),
  })
  .actions(self => ({
    getRequests: flow(function* (page: number, limit: number, url: string) {
      self.loading = true;
      console.log(`${url}${api.getViewRequest}/${page}/${limit}`);
      try {
        const res = yield axios.get(
          `${url}${api.getViewRequest}/${page}/${limit}`,
        );
        if (page === 1) {
          self.requests.replace(res.data.items);
        } else {
          const newUniqueRequests = res.data.items.filter(
            (req: any) =>
              !self.requests.some((r: any) => r.request_id === req.request_id),
          );
          self.requests.push(...newUniqueRequests);
        }
      } catch (error) {
        console.error('Failed to fetch requests:', error);
      } finally {
        self.loading = false;
      }
    }),
  }));

export type viewRequestType = Instance<typeof viewRequestModel>;
export type viewRequestSnapshotType = SnapshotOut<typeof viewRequestModel>;
