import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import {COLORS, IMAGES, SIZES} from '../../common/constant/Index';
const CustomLoading = () => {
  return (
    <Modal transparent animationType="fade" visible={true}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        {/* <View style={styles.center}>
          <Image style={styles.logo} source={IMAGES.AppLogo} />
        </View> */}
        <Text style={styles.loadingText}>Logging out...</Text>
      </View>
    </Modal>
  );
};

export default CustomLoading;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 18,
    color: 'black',
  },
  center: {
    justifyContent: Platform.OS === 'ios' ? 'flex-start' : 'center',
    paddingTop: Platform.OS === 'ios' ? SIZES.height / 2.6 : 0.001,
    backgroundColor: COLORS.white,
    borderRadius: 100,
    borderColor: COLORS.primary,
    borderWidth: 1,
    height: 150,
    width: 150,
    //create a loader circle
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  logo: {
    width: Platform.OS === 'ios' ? 90 : 100,
    height: Platform.OS === 'ios' ? 98 : 90,
    alignSelf: 'center',
  },
});
