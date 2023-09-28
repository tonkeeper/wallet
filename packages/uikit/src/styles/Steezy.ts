import { createSteezy, createDynamicStyleVars, createMediaStyleVars } from '@bogoslavskiy/react-native-steezy';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme } from './themes/dark';
import { corners } from './constants';
import { ns } from '../utils';

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
