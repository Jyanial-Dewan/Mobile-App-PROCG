// import messaging from '@react-native-firebase/messaging';
// import {ProcgURL} from '../../../App';
// import {api} from '../../common/api/api';
// import {httpRequest} from '../../common/constant/httpRequest';
// import {useRootStore} from '../../stores/rootStore';

// export async function allowPushNotification() {
//   const {userInfo, fcmTokenSave, selectedUrl} = useRootStore();
//   const url = selectedUrl || ProcgURL;

//   try {
//     // Get the token from Firebase messaging
//     const token = await messaging().getToken();

//     // Save token in the store
//     fcmTokenSave({fcmToken: token});

//     // Prepare the payload
//     const tokenPayload = {
//       token: token,
//       username: userInfo?.user_name, // Ensure userInfo is available
//     };

//     // Set up HTTP request parameters
//     const tokenParams = {
//       url: api.RegisterToken,
//       data: tokenPayload,
//       method: 'post',
//       baseURL: url,
//     };

//     // Send the token registration request
//     const res = await httpRequest(tokenParams, () => {});

//     // Handle response
//     if (res && res.status === 'success') {
//       console.log('Token registration successful', res);
//     } else {
//       console.error('Token registration failed', res);
//     }
//   } catch (error) {
//     // Handle any errors
//     console.error('Error in allowing push notification:', error);
//   }
// }
