import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React from 'react';
import {ProcgURL} from '../../../App';
import {useRootStore} from '../../stores/rootStore';
import {COLORS} from '../constant/Themes';
import CustomTextNew from './CustomText';
import Image from 'react-native-image-fallback';
import {
  renderProfilePicture,
  renderSlicedUsername,
} from '../utility/notifications.utility';

interface User {
  name: string;
  profile_picture: string;
}

interface ReceiversModalProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  recivers: number[] | undefined;
  isHandleX?: boolean;
}

const Receivers = ({
  showModal,
  setShowModal,
  recivers,
  isHandleX,
}: ReceiversModalProps) => {
  const {usersStore, userInfo, selectedUrl} = useRootStore();

  const url = selectedUrl || ProcgURL;

  const fallbacks = [require('../../assets/prifileImages/thumbnail.jpg')];

  return (
    <Modal transparent visible={showModal} animationType="fade">
      {/* Close modal when clicking outside */}
      <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          {/* Prevent modal from closing when clicking inside */}
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <ScrollView>
                {recivers?.map((recver, index) => (
                  <TouchableOpacity key={index} style={styles.listConatainer}>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 5,
                        alignItems: 'center',
                      }}>
                      <Image
                        style={styles.profileImage}
                        source={{
                          uri: `${url}/${renderProfilePicture(recver, usersStore.users)}`,
                          headers: {
                            Authorization: `Bearer ${userInfo?.access_token}`,
                          },
                        }}
                        fallback={fallbacks}
                      />
                      <CustomTextNew
                        txtColor={COLORS.headerText}
                        text={renderSlicedUsername(
                          recver,
                          usersStore.users,
                          15,
                        )}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default Receivers;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '65%',
    padding: 6,
    borderRadius: 10,
    maxHeight: 350,
    position: 'absolute',
    top: 110,
    right: 20, // Ensures scrollability
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: 'red',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 50,
  },
  listConatainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // backgroundColor: COLORS.lightBackground,
    marginBottom: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
