import React from 'react';
import {ActivityIndicator, FlatList, StyleSheet} from 'react-native';
import {COLORS} from '../constant/Themes';

interface Props {
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
  isStickyHeader?: boolean;
}
const ConnectionList: React.FC<Props> = ({
  data = [],
  isLoading,
  setCurrentPage,
  RenderItems,
  contentContainerStyle = {},
  currentPage,
  horizontal,
  numColumns,
  showHorizontalScrollIndicator,
  headerComponent,
  isStickyHeader = false,
}: Props) => {
  const renderMoreDataLoader = () => {
    return (
      isLoading && <ActivityIndicator size="large" color={COLORS.primary} />
    );
  };
  const onEndReached = () => {
    data?.length >= currentPage * 30 && setCurrentPage((prev: any) => prev + 1);
  };
  return (
    <FlatList
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
      initialNumToRender={100}
      removeClippedSubviews={false}
      data={data}
      renderItem={RenderItems}
      numColumns={numColumns}
      keyExtractor={(_, index) => index.toString()}
      ListFooterComponent={renderMoreDataLoader}
      onEndReached={() => currentPage && onEndReached()}
      onEndReachedThreshold={0.1}
    />
  );
};

export default ConnectionList;

const styles = StyleSheet.create({
  main: {
    paddingBottom: 20,
  },
});
