import { Switch as NativeSwitch } from 'react-native';
import { useTheme } from '../styles';
import { memo } from 'react';
import { isAndroid } from '../utils';

interface SwitchProps {
  onChange: (value: boolean) => void;
  disabled?: boolean;
  value: boolean;
}

export const Switch = memo<SwitchProps>((props) => {
  const { onChange, value, disabled } = props;
  const theme = useTheme();

  return (
    <NativeSwitch
      {...(isAndroid && { thumbColor: theme.constantWhite })}
      trackColor={{ true: theme.accentBlue, false: theme.buttonTertiaryBackground }}
      onValueChange={onChange}
      disabled={disabled}
      value={value}
    />
  );
});
