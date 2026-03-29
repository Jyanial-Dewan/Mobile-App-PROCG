import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {useState, useEffect} from 'react';
import {httpRequest} from '../../common/constant/httpRequest';
import {ProcgURL2} from '../../../App';
import {api} from '../../common/api/api';
import {useRootStore} from '../../stores/rootStore';
import {DashboardData, DashboardSection} from '../../types/home/homedashboard';
import {dynamicColorFunc} from '../../common/constant/dynamicColorFunc';
import CustomFlatList from '~/common/components/CustomFlatList';

const StatCard = ({
  title,
  value,
}: {
  title: string;
  value: number | string | undefined;
}) => {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: dynamicColorFunc(title).container,
          borderColor: dynamicColorFunc(title).border,
        },
      ]}>
      <Text style={{color: 'gray'}}>{title}</Text>
      <Text style={{color: dynamicColorFunc(title).text}}>{value}</Text>
    </View>
  );
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
          isConsole: true,
          isConsoleParams: true,
        },
        setIsLoading,
      );
      setdata(response);
    })();
  }, []);

  return (
    <View style={{flex: 1}}>
      {/* Summary Cards */}
      <CustomFlatList data={Object.keys(data)} RenderItems={} numColumns={2} />
      <View style={{padding: 10, gap: 6, flexDirection: 'column'}}>
        <StatCard title="Total Async Tasks" value={data?.async_tasks.total} />
        <StatCard title="Active Tasks" value={data?.async_tasks.active} />
        <StatCard
          title="Total Scheduled Tasks"
          value={data?.scheduled_tasks.total}
        />
        <StatCard title="Total Users" value={data?.users.total} />
      </View>
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
    height: size, // Optional: makes items square
    padding: 5,
  },
});
