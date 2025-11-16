import {useForm} from 'react-hook-form';
import {StatusBar, StyleSheet, Text, View} from 'react-native';
import {RootStackScreenProps} from '../../navigations/RootStack';
import {api} from '../../common/api/api';
import {httpRequest} from '../../common/constant/httpRequest';
import {ProcgURL} from '../../../App';
import {useToast} from '../../common/components/CustomToast';
import {useEffect, useState} from 'react';
import ContainerNew from '../../common/components/Container';
import Column from '../../common/components/Column';
import CustomTextNew from '../../common/components/CustomText';
import CustomInputNew from '../../common/components/CustomInput';
import {COLORS} from '../../common/constant/Themes';
import CustomButtonNew from '../../common/components/CustomButton';
import MainHeader from '../../common/components/MainHeader';
import {decrypt} from '../../common/utility/general';

interface PayloadType {
  temporary_password: string;
  new_password: string;
}
interface IVerifyUser {
  valid: boolean;
  message: string;
  result: any;
}
const ResetPassword = ({
  navigation,
  route,
}: RootStackScreenProps<'ResetPassword'>) => {
  const {request_id, user_id, token} = route.params || {};
  const toaster = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [verifyUser, setVerifyUser] = useState<IVerifyUser | null>(null);
  const decryptedRequestId = decrypt(request_id);
  const decryptedUserId = decrypt(user_id);
  const decryptedToken = decrypt(token);

  useEffect(() => {
    const verifyUser = async () => {
      const params = {
        baseURL: ProcgURL,
        url: `${api.ForgotPassword}/verify?request_id=${decryptedRequestId}&token=${decryptedToken}`,
      };
      try {
        const res = await httpRequest(params, setIsLoading);
        setVerifyUser(res);
      } catch (error) {
        console.log(error);
      }
    };
    verifyUser();
  }, [decryptedToken, decryptedRequestId]);

  const {control, handleSubmit, setValue, watch} = useForm({
    defaultValues: {
      temporary_password: '',
      new_password: '',
    },
  });

  const newPassword = watch('new_password');

  const onSubmit = async (data: PayloadType) => {
    if (!token) {
      toaster.show({message: 'Invalid or expired reset link', type: 'error'});
      return;
    }
    const postData = {
      request_id: decryptedRequestId,
      temporary_password: data.temporary_password,
      password: data.new_password,
    };

    try {
      const params = {
        baseURL: ProcgURL,
        url: `${api.ResetPassword}/${decryptedUserId}`,
        data: postData,
        method: 'PUT',
        access_token: decryptedToken as string,
      };
      const res = await httpRequest(params, setIsLoading);
      if (res?.isSuccess) {
        toaster.show({message: res?.message, type: 'success'});
        navigation.navigate('Login');
      } else {
        toaster.show({
          message: res?.message || 'Failed to reset password',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toaster.show({
        message: 'An error occurred. Please try again.',
        type: 'error',
      });
    }
  };

  return (
    <ContainerNew
      edges={['top', 'left', 'right']}
      style={styles.container}
      header={<MainHeader routeName={'Reset Password'} />}
      footer={
        <>
          {verifyUser?.valid ? (
            <View style={styles.footer}>
              <CustomButtonNew
                disabled={isLoading}
                btnText="Submit"
                isLoading={isLoading}
                onBtnPress={handleSubmit(onSubmit)}
                btnstyle={styles.btn}
                btnTextStyle={styles.btnTxt}
              />
            </View>
          ) : null}
        </>
      }>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      {verifyUser?.valid ? (
        <>
          <View style={styles.headerText}>
            {/* <Text style={styles.title}>Forgot Password</Text> */}
            <Text style={styles.subTitle}>
              Enter your details to reset your password
            </Text>
          </View>
          <View style={styles.main}>
            <Column>
              <CustomTextNew
                text="Temporary Password"
                txtSize={16}
                txtWeight={'500'}
                padBottom={5}
              />
              <CustomInputNew
                setValue={setValue}
                control={control}
                name="temporary_password"
                placeholder="Enter your temporary password"
                // label="Enter your temporary password"
                rules={{
                  required: 'Temporary password is required',
                  minLength: {
                    value: 8,
                    message: 'User name must be at least 8 characters long',
                  },
                }}
              />
            </Column>
            <Column>
              <CustomTextNew
                text="New Password"
                txtSize={16}
                txtWeight={'500'}
                padBottom={5}
              />
              <CustomInputNew
                setValue={setValue}
                control={control}
                name="new_password"
                placeholder="Enter your new password"
                // label="Enter your new password"
                rules={{
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message: 'Email must be at least 8 characters long',
                  },
                }}
              />
            </Column>
            <Column>
              <CustomTextNew
                text="Confirm Password"
                txtSize={16}
                txtWeight={'500'}
                padBottom={5}
              />
              <CustomInputNew
                name="confirm_password"
                setValue={setValue}
                control={control}
                placeholder="Enter your confirm password"
                // label="Enter your confirm password"
                rules={{
                  required: 'Confirm password is required',
                  validate: {
                    match: (value: string) =>
                      value === newPassword || 'Passwords do not match',
                  },
                }}
              />
            </Column>
          </View>
        </>
      ) : (
        <>
          <Text>{verifyUser?.message}</Text>
        </>
      )}
    </ContainerNew>
  );
};
export default ResetPassword;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    marginHorizontal: 30,
    marginTop: 22,
    justifyContent: 'flex-start',
  },
  main: {
    marginHorizontal: 30,
    marginTop: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 10,
  },
  headerText: {
    marginHorizontal: 30,
    marginTop: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    color: COLORS.textNewColor,
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    color: COLORS.textNewColor,
    marginBottom: 10,
  },
  btn: {
    marginTop: 5,
    borderRadius: 100,
    justifyContent: 'center',
    paddingVertical: 9,
    width: '100%',
  },
  btnTxt: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: COLORS.white,
  },
  footer: {
    marginHorizontal: 30,
    marginBottom: 10,
  },
});
