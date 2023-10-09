import { PagerViewTabBarItem } from './PagerViewTabBarItem';
import { PagerViewScrollView } from './PagerScrollView';
import { PagerViewFlatList } from './PagerViewFlatList';
import { PagerViewProvider } from './PagerViewProvider';
import { PagerViewHeader } from './PagerViewHeader';
import { PagerViewTabBar } from './PagerViewTabBar';
import { PagerViewPages } from './PagerViewPages';
import { PagerViewPage } from './PagerViewPage';

export { usePagerViewSteps } from './hooks/usePagerViewSteps';

export const PagerView = Object.assign(PagerViewProvider, {
  TabBarItem: PagerViewTabBarItem,
  ScrollView: PagerViewScrollView,
  FlatList: PagerViewFlatList,
  TabBar: PagerViewTabBar,
  Header: PagerViewHeader,
  Pages: PagerViewPages,
  Page: PagerViewPage,
});
