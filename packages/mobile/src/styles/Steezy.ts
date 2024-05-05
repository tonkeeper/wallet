import {
  createSteezy,
  createDynamicStyleVars,
  createMediaStyleVars,
} from '@bogoslavskiy/react-native-steezy';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ns } from '$utils';
import { useTheme } from '@tonkeeper/uikit';

export const media = createMediaStyleVars({
  isTablet: {
    minWidth: 706,
  },
});

const corners = {
  extraExtraSmall: 4,
  extraSmall: 8,
  small: 12,
  medium: 16,
  large: 20,
  full: (size: number) => size / 2,
};

export const variables = createDynamicStyleVars(() => {
  const safeArea = useSafeAreaInsets();
  const theme = useTheme();

  return {
    safeArea,
    colors: theme,
    radius: corners,
    corners,
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
