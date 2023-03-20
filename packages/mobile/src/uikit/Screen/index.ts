import { ScreenScrollView } from "./ScreenScrollView";
import { ScreenContainer } from "./ScreenContainer";
import { ScreenHeader } from "./ScreenHeader";
import { ScreenScrollList } from "./ScreenScrollList";

export const Screen = Object.assign(
  ScreenContainer, 
  {
    Header: ScreenHeader,
    ScrollView: ScreenScrollView,
    FlashList: ScreenScrollList,
    // Content: ScreenContent,
    // Footer: ScreenFooter, 
  }
);