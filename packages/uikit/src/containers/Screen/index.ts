import { ScreenLargeHeader } from './ScreenLargeHeader';
import { ScreenScrollView } from './ScreenScrollView';
import { ScreenScrollList } from './ScreenFlashList';
import { Screen as ScreenComponent } from './Screen';
import { ScreenContent } from './ScreenContent';
import { ScreenHeader } from './ScreenHeader';

export { ScreenScrollViewRef } from './ScreenScrollView';

export const Screen = Object.assign(ScreenComponent, {
  LargeHeader: ScreenLargeHeader,
  ScrollView: ScreenScrollView,
  FlashList: ScreenScrollList,
  Content: ScreenContent,
  Header: ScreenHeader,
});
