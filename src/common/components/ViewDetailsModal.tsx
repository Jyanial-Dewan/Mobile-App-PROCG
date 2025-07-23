import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS} from '../constant/Themes';

interface ViewDetailsProps {
  data: string;
  isVisible: boolean;
  setIsVisible: (visible: {id: number; visible: boolean}) => void;
}

const ViewDetailsModal = ({
  data,
  isVisible,
  setIsVisible,
}: ViewDetailsProps) => {
  return (
    <Modal
      transparent
      visible={isVisible}
      style={{flex: 1}}
      // animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent={true}>
      <TouchableWithoutFeedback
        onPress={() => setIsVisible({id: 0, visible: false})}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            onPress={() => {
              /* Do nothing, just prevent closing on content click */
            }}
            activeOpacity={1}
            style={styles.modalContent}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsHeaderText}>Details</Text>
              <TouchableOpacity
                onPress={() => setIsVisible({id: 0, visible: false})}>
                <Icon name="close" size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{flexGrow: 1}}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  /* Do nothing, just prevent closing on content click */
                }}>
                <Text style={styles.itemText}>{data}</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ViewDetailsModal;

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
    height: '85%',
    padding: 6,
    borderRadius: 8,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: COLORS.lightBlue,
  },
  detailsHeaderText: {color: COLORS.black, fontSize: 18},
  itemText: {
    color: COLORS.black,
    fontSize: 18,
    flexWrap: 'wrap',
    padding: 10,
  },
});
