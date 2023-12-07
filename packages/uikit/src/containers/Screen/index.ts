import { ScreenKeyboardAwareScrollView } from './ScreenKeyboardAwareScrollView';
import { ScreenLargeHeader } from './ScreenLargeHeader';
import { ScreenScrollView } from './ScreenScrollView';
import { ScreenScrollList } from './ScreenFlashList';
import { Screen as ScreenComponent } from './Screen';
import { ScreenContent } from './ScreenContent';
import { ScreenHeader } from './ScreenHeader';
import { ScreenSectionList } from './ScreenSectionList';
import { ScreenHeaderIndent } from './ScreenHeaderIndent';

export { ScreenScrollViewRef } from './ScreenScrollView';

export const Screen = Object.assign(ScreenComponent, {
  KeyboardAwareScrollView: ScreenKeyboardAwareScrollView,
  HeaderIndent: ScreenHeaderIndent,
  LargeHeader: ScreenLargeHeader,
  SectionList: ScreenSectionList,
  ScrollView: ScreenScrollView,
  FlashList: ScreenScrollList,
  Content: ScreenContent,
  Header: ScreenHeader,
});
