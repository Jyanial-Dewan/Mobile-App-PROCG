import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  ScrollView,
} from 'react-native';

import ContainerNew from '../../common/components/Container';
import MainHeader from '../../common/components/MainHeader';
import Entypo from 'react-native-vector-icons/Entypo';
import {COLORS} from '../../common/constant/Themes';
import SVGController from '../../common/components/SVGController';
import {useRootStore} from '../../stores/rootStore';
import {useNavigation} from '@react-navigation/native';
import {observer} from 'mobx-react-lite';

const MenuMainIndex = observer(() => {
  const {menuStore} = useRootStore();
  const menuData = menuStore.menu;
  const [openMenus, setOpenMenus] = useState<{[key: string]: boolean}>({});
  const navigation = useNavigation();

  const toggleMenu = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenMenus(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderMenuItems = (
    children: any[],
    parentKey: string,
    level: number = 1,
  ) => {
    return children
      .slice(0, children.length + 1)
      .sort((a, b) => a.order - b.order)
      .map((item: any) => {
        const itemKey = `${parentKey}-${item.id}`;

        const isExpandable = item.children && item.children.length > 0;

        return (
          <View key={item.id} style={styles.menuItem}>
            <TouchableOpacity
              onPress={() => {
                if (isExpandable) {
                  toggleMenu(itemKey);
                } else if (item.routeName) {
                  navigation.navigate(item.routeName);
                }
              }}
              style={[
                styles.menuItemHeader,
                // isExpandable && {backgroundColor: COLORS.lightGray7},
              ]}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 5,
                }}>
                {isExpandable && (
                  <SVGController
                    name={
                      openMenus[`${parentKey}-${item.id}`]
                        ? 'Circle-Chevron-Down'
                        : 'Circle-Chevron-Right'
                    }
                    color={COLORS.black}
                  />
                )}
                {!isExpandable && (
                  <SVGController name="Circle-Dot" color={COLORS.black} />
                )}
                <Text
                  style={[styles.menuText, {marginLeft: isExpandable ? 0 : 6}]}>
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>

            {isExpandable && openMenus[itemKey] && (
              <View
                style={[
                  styles.submenuContainer,
                  {
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                  }, // indent deeper levels
                ]}>
                {renderMenuItems(item.children, itemKey, level + 1)}
              </View>
            )}
          </View>
        );
      });
  };

  return (
    <ContainerNew header={<MainHeader routeName="Menu" />}>
      <ScrollView contentContainerStyle={styles.container}>
        {menuData
          .slice()
          .sort((a, b) => a.order - b.order)
          .map(menu => {
            const itemKey = `${menu.id}`;
            return (
              <View key={menu.id} style={styles.menuContainer}>
                <TouchableOpacity
                  style={styles.menuHeader}
                  onPress={() => toggleMenu(itemKey)}>
                  <SVGController
                    name={
                      openMenus[itemKey]
                        ? 'Circle-Chevron-Down'
                        : 'Circle-Chevron-Right'
                    }
                    color={COLORS.black}
                  />
                  <Text style={styles.menuTitle}>{menu.name}</Text>
                </TouchableOpacity>
                {openMenus[itemKey] && (
                  <View style={styles.menuItemsContainer}>
                    {renderMenuItems(menu.children, itemKey)}
                  </View>
                )}
              </View>
            );
          })}
      </ScrollView>
    </ContainerNew>
  );
});

export default MenuMainIndex;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 8,
  },
  menuHeader: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.lightBackground,
    borderRadius: 8,
    gap: 5,
  },

  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    maxWidth: '90%',
  },
  menuItemsContainer: {
    paddingLeft: 20,
    paddingVertical: 8,
  },
  menuItem: {
    paddingVertical: 8,
  },
  menuItemHeader: {
    width: '100%',
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
  },
  menuText: {
    fontSize: 14,
    color: '#495057',
  },
  submenuContainer: {
    paddingLeft: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
