import { createSteezy, createDynamicStyleVars, createMediaStyleVars } from "@bogoslavskiy/react-native-steezy";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ns } from "$utils";
import { DarkTheme } from "./DarkTheme";
import { RADIUS } from "$styled";

export const media = createMediaStyleVars({
  isTablet: {
    minWidth: 706,
  },
});

export const variables = createDynamicStyleVars(() => {
  const safeArea = useSafeAreaInsets();

  return {
    safeArea,
    colors: DarkTheme,
    radius: RADIUS
  };
});

export const Steezy = createSteezy({
  media,
  variables,
  modificators: {
    width: ns,
    height: ns,

    paddingLeft: ns,
    paddingRight: ns,
    paddingTop: ns,
    paddingBottom: ns,
    paddingVertical: ns,
    paddingHorizontal: ns,

    marginLeft: ns,
    marginRight: ns,
    marginTop: ns,
    marginBottom: ns,
    marginVertical: ns,
    marginHorizontal: ns,
  },
});
