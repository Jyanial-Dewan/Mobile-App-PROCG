import {Instance, SnapshotOut, types} from 'mobx-state-tree';

const MenuItemModel = types.model('MenuItemModel', {
  id: types.identifier,
  name: types.string,
  order: types.number,
  routeName: types.maybeNull(types.string),
  children: types.optional(
    types.array(types.late((): any => MenuItemModel)),
    [],
  ),
});

export const MenuStore = types
  .model('MenuStore', {
    menu: types.array(MenuItemModel),
  })
  .actions(self => ({
    saveMobileMenu(menus: MenuSnapshotType[]) {
      try {
        const validMenus = menus.map(menu => MenuItemModel.create(menu));
        self.menu.replace(validMenus);
      } catch (err) {
        console.error('Menu parsing error:', err);
      }
    },
  }));

export type MenuType = Instance<typeof MenuItemModel>;
export type MenuSnapshotType = SnapshotOut<typeof MenuItemModel>;
