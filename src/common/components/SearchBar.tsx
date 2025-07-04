import React from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';

const SearchBar = (props: any) => {
  return (
    <>
      <View style={[styles.SectionStyle, props?.customStyle]}>
        <Icon
          style={styles.ImageStyle}
          name="search1"
          size={20}
          // color="#D70F64"
          color="black"
        />

        <TextInput
          value={props?.value}
          style={{flex: 1, fontSize: 17}}
          placeholder={'Search'}
          underlineColorAndroid="transparent"
          onChangeText={props?.onChangeText}
        />
      </View>
    </>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  SectionStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
    width: '100%',
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 10,
  },

  ImageStyle: {
    padding: 10,
    margin: 5,
  },
});
