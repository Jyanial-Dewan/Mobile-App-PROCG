import React, {Dispatch, SetStateAction} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import SVGController from '../../common/components/SVGController';
interface SearchBarProps {
  customStyle?: any;
  value?: string;
  onChangeText?: Dispatch<SetStateAction<string>>;
  placeholder: string;
}
const SearchBar = (props: SearchBarProps) => {
  return (
    <>
      <View style={[styles.SectionStyle, props?.customStyle]}>
        <SVGController name="SEARCH" color="#D70F64" />

        <TextInput
          value={props?.value}
          style={{flex: 1, fontSize: 17}}
          placeholder={props.placeholder}
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
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: '#fff',
    // borderWidth: 0.5,
    // borderColor: 'transparent',
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 1,
    // },
    // shadowOpacity: 0.2,
    // shadowRadius: 1.41,

    // elevation: 2,
    width: '100%',
    // height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 10,
    paddingHorizontal: 10,
    gap: 10,
  },
});
