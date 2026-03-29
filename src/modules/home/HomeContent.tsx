import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {useState, useEffect} from 'react';
import {httpRequest} from '../../common/constant/httpRequest';
import {ProcgURL2} from '../../../App';
import {api} from '../../common/api/api';
import {useRootStore} from '../../stores/rootStore';
import {DashboardData, DashboardSection} from '../../types/home/homedashboard';
import {dynamicColorFunc} from '../../common/constant/dynamicColorFunc';
import {convertToTitleCase} from '../../common/utility/general';
import CustomFlatListThree from '../../common/components/CustomFlatListThree';
import {formateDateTime} from '../../common/services/dateFormater';
import DefaultLoading from '../../common/components/DefaultLoading';

const renderItem1 = ({
  item,
}: {
  item: {key: string; value: DashboardSection};
}) => (
  <View
    style={[
      styles.itemContainer,
      {
        backgroundColor: dynamicColorFunc(convertToTitleCase(item?.key))
          .container,
      },
    ]}>
    <Text style={{color: 'gray', fontWeight: 'bold'}}>
      {formatTitle(item?.key, true)}
    </Text>
    <Text
      style={{
        color: dynamicColorFunc(convertToTitleCase(item?.key)).text,
      }}>
      {item?.value?.total}
    </Text>
    {/* {item.value.active !== undefined && (
        <Text style={{color: dynamicColorFunc(item.key).text}}>
          Active: {item.value.active}
        </Text>
      )} */}
  </View>
);
const renderItem2 = ({item}: {item: any}) => (
  <View>
    <View
      style={{
        width: '100%',
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 5,
      }}
    />
    <View
      style={{
        flexDirection: 'row',
        // justifyContent: 'space-between',
        gap: 10,
      }}>
      <Text style={{color: 'black'}}>{item?.id}</Text>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 10,
        }}>
        <Text style={{color: 'black'}}>{item?.name}</Text>
        <Text style={{color: 'black'}}>
          {formateDateTime(item?.creation_date as any).datePart}
        </Text>
      </View>
    </View>
  </View>
);

const formatTitle = (key: string, addTotal: boolean = false) => {
  if (key === 'async_tasks' && addTotal) return 'Total Async Tasks';
  if (key === 'scheduled_tasks' && addTotal) return 'Total Scheduled Tasks';
  if (key === 'users' && addTotal) return 'Total Users';

  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};
const numColumns = 2.5;
const size = Dimensions.get('window').width / numColumns;

const HomeContent = () => {
  const {userInfo} = useRootStore();
  const [data, setdata] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const response = await httpRequest(
        {
          url: api.Dashboard,
          baseURL: ProcgURL2,
          access_token: userInfo?.access_token,
          // isConsole: true,
          // isConsoleParams: true,
        },
        setIsLoading,
      );
      setdata(response);
    })();
  }, []);
  // console.log(Object.keys(data || {}), 'eeeee');
  const allowedKeys = ['async_tasks', 'scheduled_tasks', 'workflows', 'users'];

  const filteredSections = Object.entries(data || {})
    .filter(([key]) => allowedKeys.includes(key))
    .map(([key, value]) => ({
      key,
      value,
    }));

  if (isLoading) {
    return <DefaultLoading />;
  }
  return (
    <View style={{flex: 1, marginTop: 10}}>
      <CustomFlatListThree
        horizontal={false}
        data={data ? filteredSections : []}
        keyExtractor={(item: any) => item?.key}
        headerComponent={
          <>
            {/* Summary Cards */}
            <CustomFlatListThree
              horizontal={true}
              keyExtractor={(item: any) => item?.key}
              data={data ? filteredSections : []}
              contentContainerStyle={{
                paddingVertical: 20,
                paddingHorizontal: 10,
                gap: 10,
                overflow: 'hidden',
                // backgroundColor: '#f5f5f599',
              }}
              showHorizontalScrollIndicator={false}
              RenderItems={renderItem1}
            />
          </>
        }
        RenderItems={({
          item,
        }: {
          item: {key: string; value: DashboardSection};
        }) => (
          <View
            style={[
              {
                padding: 10,
                margin: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#e0e0e0',
              },
            ]}>
            <Text style={{color: 'gray', fontWeight: 'bold'}}>
              Recent {formatTitle(item?.key)}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                // justifyContent: 'space-between',
                gap: 20,
              }}>
              <Text style={{color: 'black'}}>ID</Text>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: 10,
                }}>
                <Text style={{color: 'black'}}>Name</Text>
                <Text style={{color: 'black'}}>Created</Text>
              </View>
            </View>

            {(item?.value?.items || []).map((innerItem: any) => (
              <View key={innerItem?.id}>
                {renderItem2({item: innerItem})}
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
};
export default HomeContent;
const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  grid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    padding: 16,
  },
  itemContainer: {
    width: size,
    // height: size,
    padding: 10,
    borderRadius: 8,
    borderWidth: 0.5,
    gap: 5,
    borderColor: '#e0e0e0',
    // backgroundColor: '#8b1515ff',
  },
});
