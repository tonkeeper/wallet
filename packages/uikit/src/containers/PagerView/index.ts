import { PagerViewScrollView } from './PagerScrollView';
import { PagerViewContainer } from './PagerViewContainer';
import { PagerViewFlashList } from './PagerViewFlashList';
import { PageViewExternalHeader } from './PageViewExternalHeader';
import { PageViewExternalPage } from './PageViewExternalPage';

export { PagerViewRef, PagerViewSelectedEvent } from './PagerViewContainer';

export const PagerView = Object.assign(PagerViewContainer, {
  Header: PageViewExternalHeader,
  ScrollView: PagerViewScrollView,
  FlashList: PagerViewFlashList,
  Page: PageViewExternalPage,
});
