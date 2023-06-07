import { PagerViewContainer } from './PagerViewContainer';
import { PagerViewFlashList } from './PagerViewFlashList';
import { PageViewExternalHeader } from './PageViewExternalHeader';
import { PageViewExternalPage } from './PageViewExternalPage';

export const PagerView = Object.assign(PagerViewContainer, {
  Header: PageViewExternalHeader,
  FlashList: PagerViewFlashList,
  Page: PageViewExternalPage,
});
