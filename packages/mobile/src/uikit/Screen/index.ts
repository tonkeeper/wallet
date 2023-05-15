import { ScreenScrollView } from './ScreenScrollView';
import { ScreenContainer } from './ScreenContainer';
import { ScreenHeader } from './ScreenHeader';
import { ScreenScrollList } from './ScreenFlashList';
import { ScreenDraggableFlashList } from '$uikit/Screen/ScreenDraggableFlashList';

export const Screen = Object.assign(ScreenContainer, {
  Header: ScreenHeader,
  ScrollView: ScreenScrollView,
  FlashList: ScreenScrollList,
  DraggableFlashList: ScreenDraggableFlashList,
  // Content: ScreenContent,
  // Footer: ScreenFooter,
});
