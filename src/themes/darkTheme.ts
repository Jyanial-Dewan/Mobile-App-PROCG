import {DarkTheme as RNDarkTheme, Theme} from '@react-navigation/native';
import {MD3DarkTheme as PaperDarkTheme} from 'react-native-paper';

const DarkTheme: Theme = {
  ...RNDarkTheme,
  colors: {
    ...RNDarkTheme.colors,
    ...PaperDarkTheme,
    primary: 'red',
    text: 'black',
  },
};

export default DarkTheme;
