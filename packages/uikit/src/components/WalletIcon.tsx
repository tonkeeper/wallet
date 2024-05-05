import { memo } from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';
import { WALLET_ICONS } from '../utils/walletIcons';
import { Icon, IconColors, IconNames } from './Icon';

interface WalletIconProps {
  value: string;
  emojiStyle?: StyleProp<TextStyle>;
  size?: number;
  color?: IconColors;
}

export const WalletIcon = memo<WalletIconProps>((props) => {
  if (WALLET_ICONS.includes(props.value)) {
    return <Icon size={props.size} name={props.value as IconNames} color={props.color} />;
  }

  return <Text style={props.emojiStyle}>{props.value}</Text>;
});
