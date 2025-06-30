import React from 'react';
import {Modal, Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import {COLORS, SIZES} from '../constant/Themes';

interface props {
  total: number;
  setIsModalShow: any;
  isModalShow: boolean;
  onPressCallApi?: any;
  modalText?: string;
  deleteMessage?: string;
  deleteText?: string;
  isDisabled?: boolean;
  onCancel?: any;
}
const CustomDeleteModal = ({
  total,
  setIsModalShow,
  isModalShow,
  onPressCallApi,
  onCancel,
  modalText,
  deleteMessage,
  deleteText = 'Continue',
  isDisabled = false,
}: props) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isModalShow}
      onRequestClose={() => {
        setIsModalShow(!isModalShow);
      }}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View
            style={
              Platform.OS === 'ios'
                ? styles.paddingHorizontal30
                : styles.paddingHorizontal0
            }>
            {Platform.OS === 'ios' ? (
              <Text style={styles.confermationText}>
                Delete {total} Conversations?
              </Text>
            ) : (
              <Text style={styles.title}>
                {deleteMessage ? deleteMessage : 'Delete Notification'}
              </Text>
            )}
            {/* <Text style={styles.modalText}>{modalText}</Text> */}
          </View>
          <View style={styles.itemListWrapper}></View>

          {Platform.OS === 'android' ? (
            <View style={styles.textBottom}>
              <Pressable onPress={() => onCancel()}>
                <Text style={[styles.cancelTxtStyle, styles.paddingRight]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                disabled={isDisabled}
                onPress={() => {
                  onPressCallApi();
                  setIsModalShow(!isModalShow);
                }}>
                <Text style={styles.textStyle}>{deleteText}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.cancelTxt}>
              <Pressable onPress={() => setIsModalShow(!isModalShow)}>
                <Text style={styles.cancelDelTxt}>Cancel</Text>
              </Pressable>
              <View style={styles.horizontalDevider} />
              <Pressable
                disabled={isDisabled}
                onPress={() => {
                  onPressCallApi();
                  setIsModalShow(!isModalShow);
                }}>
                <Text style={styles.cancelDelTxt}>{deleteText}</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default CustomDeleteModal;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.50)',
  },

  modalView: {
    backgroundColor: 'white',
    paddingHorizontal: Platform.OS === 'android' ? 20 : 0,
    paddingVertical: Platform.OS === 'ios' ? 20 : 20,
    shadowColor: '#000',
    borderRadius: 4,
    width: '90%',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  modalText: {
    fontSize: 14,
    lineHeight: 28,
    letterSpacing: 0.25,
    color: COLORS.black,
    textAlign: Platform.OS === 'ios' ? 'center' : 'auto',
    // paddingBottom: Platform.OS === 'ios' ? 24 : 0,
  },
  textStyle: {
    color: COLORS.white,
    padding: 7,
    backgroundColor: COLORS.black,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  cancelTxtStyle: {
    color: COLORS.black,
    padding: 7,
  },
  textBottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    // marginTop: 30,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 1.25,
    // paddingBottom: 10,
  },
  paddingRight: {
    marginRight: 20,
  },
  confermationText: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    paddingBottom: 6,
  },
  cancelTxt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingHorizontal: SIZES.width / 10,
    borderTopColor: COLORS.offDay,
  },
  cancelDelTxt: {
    fontSize: 17,
    lineHeight: 22,
    color: COLORS.primary,
    padding: 12,
    fontWeight: '600',
  },
  horizontalDevider: {
    width: 1,
    backgroundColor: COLORS.offDay,
  },
  paddingHorizontal0: {
    paddingHorizontal: 0,
  },
  paddingHorizontal30: {
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '500',
    color: '#1C1B1F',
  },
  itemListWrapper: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 5,
    marginBottom: 10,
  },
});
