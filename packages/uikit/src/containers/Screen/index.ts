import { ScreenLargeHeader } from './ScreenLargeHeader';
import { ScreenScrollView } from './ScreenScrollView';
import { ScreenScrollList } from './ScreenFlashList';
import { Screen as ScreenComponent } from './Screen';
import { ScreenContent } from './ScreenContent';
import { ScreenHeader } from './ScreenHeader';
import { ScreenSectionList } from './ScreenSectionList';
import { ScreenHeaderIndent } from './ScreenHeaderIndent';
import { ScreenButtonContainer } from './ScreenButtonContainer';
import { ScreenButtonSpacer } from './ScreenButtonSpacer';

export { ScreenScrollViewRef } from './ScreenScrollView';

export const Screen = Object.assign(ScreenComponent, {
  LargeHeader: ScreenLargeHeader,
  SectionList: ScreenSectionList,
  ScrollView: ScreenScrollView,
  FlashList: ScreenScrollList,
  Content: ScreenContent,
  Header: ScreenHeader,
  HeaderIndent: ScreenHeaderIndent,
  ButtonContainer: ScreenButtonContainer,
  ButtonSpacer: ScreenButtonSpacer,
});
