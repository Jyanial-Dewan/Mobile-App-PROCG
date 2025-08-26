import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React from 'react';
import CustomBottomSheetNew from './CustomBottomSheet';
import CustomTextNew from './CustomText';
import {convertDate} from '../services/DateConverter';
import Column from './Column';
import {COLORS} from '../constant/Themes';
interface Props {
  refRBSheetViewDetails: any;
  title: string;
  dateAndTime?: any;
  description: string;
  setSelectedItem: (item: any) => void;
}
const ViewDetailsBottomSheet = ({
  refRBSheetViewDetails,
  title,
  dateAndTime,
  description,
  setSelectedItem,
}: Props) => {
  return (
    <CustomBottomSheetNew
      refRBSheet={refRBSheetViewDetails}
      sheetHeight={600}
      onClose={() => setSelectedItem(undefined)}>
      <TouchableWithoutFeedback>
        <View>
          <ScrollView
            style={[styles.itemContainer]}
            contentContainerStyle={{flexGrow: 1}}
            showsVerticalScrollIndicator={false}>
            <TouchableOpacity activeOpacity={1}>
              <CustomTextNew
                text={title}
                style={{
                  fontSize: 15,
                  fontWeight: 'bold',
                  color: COLORS.black,
                  marginTop: 5,
                }}
              />
              <CustomTextNew
                text={convertDate(dateAndTime as any)}
                style={{
                  fontSize: 15,
                  fontWeight: 'bold',
                  color: COLORS.black,
                  marginTop: 5,
                }}
              />
              <Column colStyle={styles.colStyle}>
                <CustomTextNew
                  text={description}
                  txtColor={COLORS.blackish}
                  txtSize={14}
                />
              </Column>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </CustomBottomSheetNew>
  );
};

export default ViewDetailsBottomSheet;

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 15,
    marginBottom: 10,
    // elevation: 1,
  },
  colStyle: {
    // borderBottomColor: COLORS.borderBottom,
    // borderBottomWidth: 2,
    marginBottom: 10,
    paddingVertical: 5,
  },
});
