import { ScreenLargeHeader } from "./ScreenLargeHeader";
import { ScreenScrollView } from "./ScreenScrollView";
import { ScreenScrollList } from "./ScreenFlashList";
import { ScreenContainer } from "./ScreenContainer";
import { ScreenContent } from './ScreenContent';
import { ScreenHeader } from "./ScreenHeader";

// export { ScreenHeaderHeight } from './ScreenHeader';

export const Screen = Object.assign(ScreenContainer, { 
  LargeHeader: ScreenLargeHeader,
  ScrollView: ScreenScrollView,
  FlashList: ScreenScrollList,
  Content: ScreenContent,
  Header: ScreenHeader,
});
