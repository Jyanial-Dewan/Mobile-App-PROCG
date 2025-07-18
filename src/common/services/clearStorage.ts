import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import {mmkv} from '../../stores/rootStore';

export const clearAllStorage = async () => {
  mmkv.clearAll();

  const asyncStorageKeys = await AsyncStorage.getAllKeys();
  if (asyncStorageKeys?.length > 0) {
    if (Platform.OS === 'android') {
      await AsyncStorage.clear();
    }
    if (Platform.OS === 'ios') {
      await AsyncStorage.multiRemove(asyncStorageKeys);
    }
  }
};
