import axios from 'axios';
import {flow, Instance, SnapshotOut, types} from 'mobx-state-tree';
import {api} from '../common/api/api';

export const viewRequestModel = types.model('RequestModel', {
  request_id: types.number,
  timestamp: types.Date,
  status: types.string,
  user_task_name: types.maybeNull(types.string),
  user_schedule_name: types.maybeNull(types.string),
  // parameters: types.maybeNull(types.optional(types.map(types.integer), {})),
  // result: types.maybeNull(
  //   types.union(
  //     types.map(types.union(types.string, types.number)),
  //     types.array(types.frozen()),
  //   ),
  // ),
  parameters: types.maybeNull(types.map(types.frozen())),
  result: types.maybeNull(types.frozen()),
  // result: types.maybeNull(
  //   types.map(types.union(types.string, types.number, types.boolean)),
  // ),
});

export const viewRequestStore = types
  .model('RequestStore', {
    requests: types.array(viewRequestModel),
    loading: types.optional(types.boolean, false),
  })
  .actions(self => ({
    getRequests: flow(function* (
      page: number,
      limit: number,
      url: string,
      accessToken: string,
    ) {
      try {
        self.loading = true;
        const res = yield axios.get(
          `${url}${api.getViewRequest}/${page}/${limit}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        if (page === 1) {
          const formattedRequests = res.data.items.map((req: any) => ({
            ...req,
            timestamp: new Date(req.timestamp),
          }));
          self.requests.replace(formattedRequests);
        } else {
          const newUniqueRequests = res.data.items.filter(
            (req: any) =>
              !self.requests.some((r: any) => r.request_id === req.request_id),
          );
          const formattedRequests = newUniqueRequests.map((req: any) => ({
            ...req,
            timestamp: new Date(req.timestamp),
          }));
          self.requests.push(...formattedRequests);
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
