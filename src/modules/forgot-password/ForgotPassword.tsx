import {useForm} from 'react-hook-form';
import {StatusBar, StyleSheet, Text, View} from 'react-native';
import {RootStackScreenProps} from '../../navigations/RootStack';
import {api} from '../../common/api/api';
import {httpRequest} from '../../common/constant/httpRequest';
import {ProcgURL2} from '../../../App';
import {useToast} from '../../common/components/CustomToast';
import {useState} from 'react';
import {IJobTitle, ITenantsTypes} from '../../types/tenants/tenantsTypes';
import ContainerNew from '../../common/components/Container';
import Column from '../../common/components/Column';
import CustomTextNew from '../../common/components/CustomText';
import CustomInputNew from '../../common/components/CustomInput';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../../common/constant/Themes';
import CustomDatePickerNew from '../../common/components/CustomDatePicker';
import CustomButtonNew from '../../common/components/CustomButton';
import {date_formater} from '../../common/services/dateFormater';
import {_todayDate} from '../../common/services/todayDate';
interface PayloadType {
  user_name: string;
  email_address: string;
  date_of_birth: string;
}

const ForgotPassword = ({
  navigation,
}: RootStackScreenProps<'ForgotPassword'>) => {
  const [tenants, setTenants] = useState<ITenantsTypes[]>([]);
  const [jobTitles, setJobTitles] = useState<IJobTitle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tenantName, setTenantName] = useState('Select your tenant');
  const [jobTitleName, setJobTitleName] = useState('Select your job Title');

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
      url: api.Users,
      baseURL: ProcgURL2,
      data: postData,
      method: 'POST',
    };

    // const res = await httpRequest(params, setIsLoading);
    // if (res?.success) {
    //   setCreatedUserId(res?.data?.user_id);
    //   toaster.show({message: res?.data?.message, type: 'success'});
    // } else {
    //   toaster.show({message: res?.data?.message, type: 'error'});
    // }
  };
  const handleGoBack = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Login',
        },
      ],
    });
  };

  return (
    <ContainerNew edges={['top', 'left', 'right']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <Icon name="arrow-left" size={24} color="#9CA3AFBF" />
        </TouchableOpacity>
      </View>
      <View style={styles.main}>
        <Column>
          <CustomTextNew
            text="Username"
            txtSize={16}
            txtWeight={'500'}
            padBottom={14}
          />
          <CustomInputNew
            setValue={setValue}
            control={control}
            name="user_name"
            label="Enter your username"
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
            padBottom={14}
          />
          <CustomInputNew
            setValue={setValue}
            control={control}
            name="email_address"
            label="Enter your email"
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
            padBottom={14}
          />
          <CustomDatePickerNew
            name="date_of_birth"
            setValue={setValue}
            control={control}
            label="Enter your date of birth"
            rules={{
              required: 'Date of birth is required',
            }}
          />
        </Column>
        <CustomButtonNew
          disabled={isLoading}
          btnText="Submit"
          isLoading={isLoading}
          onBtnPress={handleSubmit(onSubmit)}
          btnstyle={styles.btn}
          btnTextStyle={styles.btnTxt}
        />
      </View>
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
    // i want center
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    marginHorizontal: 30,
    marginTop: 22,
    // i want center
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    marginTop: 22,
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
});
