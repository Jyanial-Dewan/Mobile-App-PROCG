import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import SelectDropdown from 'react-native-select-dropdown';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
interface Props {
  isDisabled?: boolean;
  width: number;
  height: number;
  defaultValue?: string;
  data: any;
  handleSelectedStatus: (status: string) => void;
  border?: boolean;
  search?: boolean;
}
const SelectStatusDropDown = ({
  isDisabled = false,
  width,
  height,
  defaultValue,
  data,
  handleSelectedStatus,
  border = false,
  search = false,
}: Props) => {
  const defaultItem = data.find((item: any) => item.title === defaultValue);
  return (
    <SelectDropdown
      disabled={isDisabled}
      data={data}
      // search={search}
      onSelect={(selectedItem, index) => {
        handleSelectedStatus(selectedItem.value);
      }}
      defaultValue={defaultItem}
      renderButton={(selectedItem, isOpened) => {
        return (
          <View
            style={[
              styles.dropdownButtonStyle,
              {
                width,
                height,
                borderBlockColor: border ? '#7b7b7bff' : '',
                borderWidth: border ? 0.5 : 0,
              },
            ]}>
            {selectedItem && (
              <Icon
                name={selectedItem.icon}
                style={styles.dropdownButtonIconStyle}
              />
            )}
            <Text style={styles.dropdownButtonTxtStyle}>
              {(selectedItem && selectedItem.title) || defaultValue}
            </Text>
            <Icon
              name={isOpened ? 'menu-up' : 'menu-down'}
              style={styles.dropdownButtonArrowStyle}
            />
          </View>
        );
      }}
      renderItem={(item, index, isSelected) => {
        return (
          <View
            style={{
              ...styles.dropdownItemStyle,
              ...(isSelected && {backgroundColor: '#D2D9DF'}),
            }}>
            <Icon name={item.icon} style={styles.dropdownItemIconStyle} />
            <Text style={styles.dropdownItemTxtStyle}>{item.title}</Text>
          </View>
        );
      }}
      showsVerticalScrollIndicator={false}
      dropdownStyle={styles.dropdownMenuStyle}
    />
  );
};

export default SelectStatusDropDown;

const styles = StyleSheet.create({
  dropdownButtonStyle: {
    // width: 170,
    // height: 50,
    backgroundColor: '#fff',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#151E26',
  },
  dropdownButtonArrowStyle: {
    fontSize: 28,
    color: '#000',
  },
  dropdownButtonIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
  dropdownMenuStyle: {
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#151E26',
  },
  dropdownItemIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
});
