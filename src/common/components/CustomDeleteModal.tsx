import React from 'react';
import {Modal, Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import {COLORS, SIZES} from '../constant/Themes';
import SVGController from './SVGController';

interface props {
  total: number;
  children?: React.ReactNode;
  setIsModalShow: any;
  isModalShow: boolean;
  onPressCallApi?: any;
  modalText?: string;
  actionName: string;
  deleteText?: string;
  isDisabled?: boolean;
  onCancel?: any;
}
const CustomDeleteModal = ({
  total,
  children,
  setIsModalShow,
  isModalShow,
  onPressCallApi,
  onCancel,
  modalText,
  actionName,
  deleteText = 'Continue',
  isDisabled = false,
}: props) => {
  console.log(isModalShow, 'isModalShow');
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
                : styles.boxStyle
            }>
            <View style={styles.iconStyle}>
              <SVGController
                name={actionName}
                width={39}
                height={39}
                color={COLORS.white}
              />
            </View>
            {Platform.OS === 'ios' ? (
              <Text style={styles.confermationText}>
                Delete {total} Conversations?
              </Text>
            ) : (
              <Text style={styles.title}>
                Are you sure you want to {actionName}?
              </Text>
            )}
            {children}
          </View>

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
    position: 'relative',
    backgroundColor: 'white',
    paddingHorizontal: Platform.OS === 'android' ? 18 : 0,
    paddingVertical: Platform.OS === 'ios' ? 20 : 48,
    shadowColor: '#000',
    borderRadius: 5,
    width: '80%',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },

  boxStyle: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '20%',
    position: 'relative',
    borderRadius: 5,

    backgroundColor: '#FB1A2026',
  },
  iconStyle: {
    position: 'absolute',
    top: -35,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
    height: 65,
    width: 65,
    borderRadius: 50,
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
    fontSize: 14,
    fontWeight: '400',
    borderWidth: 1,
    borderColor: '#D3DCE7',
    backgroundColor: COLORS.primaryRed,
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelTxtStyle: {
    color: COLORS.primaryRed,
    fontSize: 14,
    fontWeight: '400',
    borderWidth: 1,
    borderColor: '#D3DCE7',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  textBottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
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
  paddingHorizontal30: {
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1B1F',
    textAlign: 'center',
  },
});
