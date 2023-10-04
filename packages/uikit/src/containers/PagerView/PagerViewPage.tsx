import { PageIndexContext } from './hooks/usePageIndex';
import { View } from 'react-native';
import { memo } from 'react';

interface PagerViewPageProps {
  children: React.ReactNode;
  index: number;
}

export const PagerViewPage = memo<PagerViewPageProps>((props) => {
  const { children, index } = props;

  return (
    <View key={`pager-view-page-${index}`}>
      <PageIndexContext.Provider value={index}>{children}</PageIndexContext.Provider>
    </View>
  );
});
