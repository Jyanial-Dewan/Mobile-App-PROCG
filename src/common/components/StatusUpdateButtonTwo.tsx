// import React, {Dispatch, SetStateAction, useRef, useState} from 'react';
// import {
//   ActivityIndicator,
//   FlatList,
//   Modal,
//   Pressable,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   View,
// } from 'react-native';
// import {COLORS} from '../constant/Themes';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import {observer} from 'mobx-react-lite';
// import CustomBottomSheetNew from './CustomBottomSheet';
// import CustomTextNew from './CustomText';
// import CustomButtonNew from './CustomButton';
// import {ActionItemsStoreSnapshotType} from '../../stores/actionItems';

// interface Props extends React.ComponentProps<typeof Pressable> {
//   item: ActionItemsStoreSnapshotType;
//   refRBSheetStatusUpdate: any;

//   // item: itemsStoreSnapshotType;
//   // disabled?: boolean;
//   // bgColor?: string;
//   // btnstyle?: {};
//   // onBtnPress?: () => void;
//   // btnTextStyle?: {};
//   // btnText?: string;
//   // isLoading?: boolean;
//   // center?: boolean;
//   handleStatusUpdate: (action_item_id: number, status: string) => void;
// }
// const StatusUpdateButtonTwo: React.FC<Props> = ({
//   item,
//   refRBSheetStatusUpdate,
//   handleStatusUpdate,
// }: Props) => {
//   const [selectedStatusForUpdate, setSelectedStatusForUpdate] = useState('');
//   const [isModalShow, setIsModalShow] = useState(false);
//   const status = [
//     {
//       id: 0,
//       label: 'New',
//       value: 'NEW',
//     },
//     {
//       id: 1,
//       label: 'In Progress',
//       value: 'IN PROGRESS',
//     },
//     {
//       id: 2,
//       label: 'Completed',
//       value: 'COMPLETED',
//     },
//   ];
//   const handlePress = (status: string) => {
//     if (status === item.status) return;
//     handleStatusUpdate(item?.action_item_id, status);
//     setIsModalShow(false);
//   };

//   const currentIndex = Math.max(
//     0,
//     status.findIndex(s => s.label.toLowerCase() === item.status.toLowerCase()),
//   );

//   return (
//     <>
//       <CustomBottomSheetNew
//         refRBSheet={refRBSheetStatusUpdate}
//         sheetHeight={330}
//         onClose={() => setSelectedStatusForUpdate('')}>
//         <View style={{padding: 10, gap: 10}}>
//           {/* action item name */}
//           <CustomTextNew
//             text={'Update Status'}
//             txtColor={COLORS.black}
//             txtStyle={{fontSize: 20, fontWeight: 'bold'}}
//           />
//           {/* status items */}
//           <View>
//             {status.map((statusItem: any, index: number) => {
//               const isActive = index === currentIndex;
//               const isCompleted = index < currentIndex;

//               return (
//                 <TouchableOpacity
//                   key={index}
//                   onPress={() =>
//                     setSelectedStatusForUpdate((prev: string) => {
//                       if (prev === statusItem.value) {
//                         return '';
//                       } else {
//                         return statusItem.value;
//                       }
//                     })
//                   }
//                   style={[
//                     statusItem.value.toLowerCase() ===
//                     selectedStatusForUpdate.toLowerCase()
//                       ? {borderColor: COLORS.green}
//                       : {borderColor: '#767676ff'},
//                     {
//                       flexDirection: 'row',
//                       alignItems: 'center',
//                       gap: 10,
//                       borderWidth: 1,
//                       padding: 10,
//                       borderRadius: 5,
//                       marginBottom: 5,
//                     },
//                     (isActive || isCompleted) && {
//                       borderColor: '#16a34a',
//                       backgroundColor: '#fff',
//                     },
//                   ]}>
//                   {(isActive || isCompleted) && (
//                     <Icon name="check" size={16} color={'#16a34a'} />
//                   )}
//                   <CustomTextNew
//                     text={statusItem.label}
//                     txtColor={COLORS.black}
//                     txtSize={20}
//                   />
//                 </TouchableOpacity>
//               );
//             })}
//           </View>
//           {/* button here */}
//           <View
//             style={{
//               marginTop: 10,
//               flexDirection: 'row',
//               justifyContent: 'space-between',
//             }}>
//             <CustomButtonNew
//               disabled={false}
//               btnText={'Cancel'}
//               // isLoading={false}
//               onBtnPress={() => refRBSheetStatusUpdate.current?.close()}
//               btnstyle={styles.btn}
//             />
//             <CustomButtonNew
//               disabled={false}
//               btnText={'Update'}
//               // isLoading={false}
//               onBtnPress={() =>
//                 handleStatusUpdate(item.action_item_id, selectedStatusForUpdate)
//               }
//               btnstyle={styles.btn}
//             />
//           </View>
//         </View>
//       </CustomBottomSheetNew>
//     </>
//   );
// };

// export default observer(StatusUpdateButtonTwo);

// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.3)',
//     justifyContent: 'flex-end',
//     alignItems: 'flex-end',
//   },

//   modalContent: {
//     backgroundColor: 'white',
//     width: 290,
//     padding: 6,
//     borderRadius: 10,
//     maxHeight: 60,
//     position: 'absolute',
//     bottom: 45,
//     right: 0,
//     zIndex: 99999,
//     borderBlockColor: '#b1b1b1ff',
//     borderWidth: 0.5,
//   },
//   btnText: {
//     color: COLORS.white,
//     fontWeight: '500',
//     fontSize: 14,
//     textAlign: 'center',
//   },
//   btnStyle: {
//     paddingVertical: 12,
//     borderRadius: 6,
//     justifyContent: 'center',
//   },
//   btnContentWrapperView: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     alignItems: 'center',
//   },
//   loadingStyle: {transform: [{scaleX: 0.8}, {scaleY: 0.8}], paddingLeft: 10},

//   circle: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     borderWidth: 2,
//     borderColor: '#878787',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#fff',
//   },
//   // line: {
//   //   height: 2,
//   //   width: 40,
//   //   backgroundColor: '#ccc',
//   //   marginHorizontal: 4,
//   // },
//   label: {
//     marginTop: 4,
//     fontSize: 12,
//     color: COLORS.black,
//   },
//   stepperRow: {
//     position: 'relative',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     minWidth: 280, // optional, keeps good spacing
//     paddingHorizontal: 8,
//   },
//   track: {
//     position: 'absolute',
//     left: 14, // = circle radius -> line starts at circle center
//     right: 25, // = circle radius -> line ends at circle center
//     top: 14, // vertically center with circle
//     height: 2,
//     backgroundColor: '#ccc',
//   },
//   trackFill: {
//     position: 'absolute',
//     left: 0,
//     height: 2,
//     backgroundColor: '#16a34a',
//   },
//   step: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     zIndex: 1, // keep circles above the track
//   },
//   btn: {
//     width: '45%',
//     borderRadius: 100,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: COLORS.newGray,
//   },
// });
