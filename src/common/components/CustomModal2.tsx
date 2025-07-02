import {Modal, StyleSheet, TouchableWithoutFeedback, View} from 'react-native';
import React from 'react';
import {COLORS} from '../constant/Themes';

interface CustomModal2Props {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
  top: number;
  right: number;
}

const CustomModal2 = ({
  showModal,
  setShowModal,
  children,
  top,
  right,
}: CustomModal2Props) => {
  return (
    <Modal transparent visible={showModal} animationType="fade">
      {/* Close modal when clicking outside */}
      <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          {/* Prevent modal from closing when clicking inside */}
          <TouchableWithoutFeedback>
            <View style={[styles.modalContent, {top}, {right}]}>
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CustomModal2;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.lightBackground,
    width: '90%',
    padding: 6,
    borderRadius: 8,
    maxHeight: 500,
    // position: 'absolute',
    // Ensures scrollability
  },
});
