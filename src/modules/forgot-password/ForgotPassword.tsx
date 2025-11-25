import {useForm} from 'react-hook-form';
import {StatusBar, StyleSheet, Text, View} from 'react-native';
import {RootStackScreenProps} from '../../navigations/RootStack';
import {api} from '../../common/api/api';
import {httpRequest} from '../../common/constant/httpRequest';
import {ProcgURL} from '../../../App';
import {useState} from 'react';
import ContainerNew from '../../common/components/Container';
import Column from '../../common/components/Column';
import CustomTextNew from '../../common/components/CustomText';
import CustomInputNew from '../../common/components/CustomInput';
import {COLORS} from '../../common/constant/Themes';
import CustomDatePickerNew from '../../common/components/CustomDatePicker';
import CustomButtonNew from '../../common/components/CustomButton';
import MainHeader from '../../common/components/MainHeader';
import {useToast} from '../../common/components/CustomToast';

interface PayloadType {
  user_name: string;
  email_address: string;
  date_of_birth: string;
}

const ForgotPassword = ({
  navigation,
}: RootStackScreenProps<'ForgotPassword'>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmited, setIsSubmited] = useState(false);
  const toaster = useToast();

  const {control, handleSubmit, setValue} = useForm({
    defaultValues: {
      user_name: '',
      email_address: '',
      date_of_birth: '',
    },
  });

  const onSubmit = async (data: PayloadType) => {
    const postData = {
      user_name: data.user_name,
      email_address: data.email_address,
      date_of_birth: data.date_of_birth,
    };
    const params = {
      url: api.ForgotPassword,
      baseURL: ProcgURL,
      data: postData,
      method: 'POST',
    };

    const res = await httpRequest(params, setIsLoading);
    if (res) {
      setIsSubmited(res?.success);
      toaster.show({message: res?.message, type: 'success'});
    } else {
      setIsSubmited(false);
      toaster.show({message: res?.message, type: 'error'});
    }
  };

  return (
    <ContainerNew
      edges={['top', 'left', 'right']}
      style={styles.container}
      header={<MainHeader routeName={'Forgot Password'} />}
      footer={
        <>
          {isSubmited ? null : (
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
          )}
        </>
      }>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {isSubmited ? (
        <View style={styles.subHead}>
          <Text style={styles.subTitle}>
            Check your email for reset password link
          </Text>
        </View>
      ) : (
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
                text="Username"
                txtSize={16}
                txtWeight={'500'}
                padBottom={5}
              />
              <CustomInputNew
                setValue={setValue}
                control={control}
                name="user_name"
                placeholder="Enter your username"
                // label="Enter your username"
                rules={{
                  required: 'User name is required',
                  minLength: {
                    value: 3,
                    message: 'User name must be at least 3 characters long',
                  },
                }}
              />
            </Column>
            <Column>
              <CustomTextNew
                text="Email"
                txtSize={16}
                txtWeight={'500'}
                padBottom={5}
              />
              <CustomInputNew
                setValue={setValue}
                control={control}
                name="email_address"
                placeholder="Enter your email"
                // label="Enter your email"
                rules={{
                  required: 'Email is required',
                  minLength: {
                    value: 3,
                    message: 'Email must be at least 3 characters long',
                  },
                }}
              />
            </Column>
            <Column>
              <CustomTextNew
                text="Date of Birth"
                txtSize={16}
                txtWeight={'500'}
                padBottom={5}
              />
              <CustomDatePickerNew
                name="date_of_birth"
                setValue={setValue}
                control={control}
                // label="Enter your date of birth"
                rules={{
                  required: 'Date of birth is required',
                }}
              />
            </Column>
          </View>
        </>
      )}
    </ContainerNew>
  );
};
export default ForgotPassword;
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
  subHead: {
    marginHorizontal: 30,
    marginTop: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
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
