import React, {useCallback} from 'react';
import {ActivityIndicator, FlatList, StyleSheet} from 'react-native';
import {COLORS} from '../constant/Themes';

interface Props {
  key?: any;
  keyExtractor: any;
  data: any;
  isLoading?: boolean;
  setCurrentPage?: any;
  RenderItems: any;
  contentContainerStyle?: any;
  currentPage?: any;
  horizontal?: boolean;
  numColumns?: number;
  showHorizontalScrollIndicator?: boolean;
  headerComponent?: any;
  emptyItem?: any;
  isStickyHeader?: boolean;
  hasMore?: number;
  refreshing?: boolean;
  onRefresh?: any;
}
const CustomFlatListThree: React.FC<Props> = ({
  data = [],
  key,
  keyExtractor,
  isLoading,
  setCurrentPage,
  RenderItems,
  contentContainerStyle = {},
  currentPage,
  horizontal,
  numColumns,
  showHorizontalScrollIndicator,
  headerComponent,
  emptyItem,
  isStickyHeader = false,
  hasMore,
  refreshing,
  onRefresh,
}: Props) => {
  const renderMoreDataLoader = () => {
    return (
      isLoading && <ActivityIndicator size="large" color={COLORS.primary} />
    );
  };
  const onEndReached = () => {
    // data?.length >= currentPage * 30 && setCurrentPage((prev: any) => prev + 1);
    if (hasMore === undefined || hasMore < 5) {
      return;
    }
    if (!isLoading && hasMore) {
      setCurrentPage((prev: any) => prev + 1);
    }
    console.log(currentPage, 'current Page');
  };

  // const keyExtractor = useCallback((item: any) => item?.id?.toString(), []);

  return (
    <FlatList
      key={key}
      showsVerticalScrollIndicator={false}
      horizontal={horizontal}
      showsHorizontalScrollIndicator={showHorizontalScrollIndicator}
      contentContainerStyle={[
        contentContainerStyle,
        {
          ...styles.main,
          paddingBottom: contentContainerStyle?.paddingBottom,
        },
      ]}
      ListHeaderComponent={headerComponent}
      stickyHeaderIndices={isStickyHeader ? [0] : undefined}
      initialNumToRender={10}
      removeClippedSubviews={false}
      data={data}
      renderItem={RenderItems}
      numColumns={numColumns}
      keyExtractor={keyExtractor}
      ListFooterComponent={renderMoreDataLoader}
      onEndReached={() => currentPage && onEndReached()}
      onEndReachedThreshold={0.1}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      ListEmptyComponent={emptyItem}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

export default CustomFlatListThree;

const styles = StyleSheet.create({
  main: {
    paddingBottom: 20,
  },
});
