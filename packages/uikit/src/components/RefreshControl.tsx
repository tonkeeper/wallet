import {
  RefreshControl as NativeRefreshControl,
  RefreshControlProps,
} from 'react-native';
import { useTheme } from '../styles';
import { memo } from 'react';

export const RefreshControl = memo<RefreshControlProps>((props) => {
  const theme = useTheme();
  return (
    <NativeRefreshControl
      {...props}
      progressBackgroundColor={theme.constantWhite}
      tintColor={theme.iconPrimary}
    />
  );
});
