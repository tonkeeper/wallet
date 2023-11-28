import { Switch as NativeSwitch } from 'react-native';
import { useTheme } from '../styles';
import { memo } from 'react';

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
      trackColor={{ true: theme.accentBlue }}
      onValueChange={onChange}
      disabled={disabled}
      value={value}
    />
  );
});
