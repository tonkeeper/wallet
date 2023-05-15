import { ScreenScrollView } from './ScreenScrollView';
import { ScreenContainer } from './ScreenContainer';
import { ScreenHeader } from './ScreenHeader';
import { ScreenScrollList } from './ScreenFlashList';

export const Screen = Object.assign(ScreenContainer, {
  Header: ScreenHeader,
  ScrollView: ScreenScrollView,
  FlashList: ScreenScrollList,
  // DraggableFlashList: ScreenDraggableFlashList,
  // Content: ScreenContent,
  // Footer: ScreenFooter,
});
