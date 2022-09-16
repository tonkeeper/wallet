import { ScreenScrollView } from "./ScreenScrollView";
import { ScreenContainer } from "./ScreenContainer";
import { ScreenHeader } from "./ScreenHeader";

export const Screen = Object.assign(
  ScreenContainer, 
  {
    Header: ScreenHeader,
    ScrollView: ScreenScrollView,
    // Content: ScreenContent,
    // Footer: ScreenFooter, 
  }
);