export interface InlineKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  biometryEnabled?: boolean;
  onBiometryPress?: () => void;
}

export interface KeyProps {
  onPress?: () => void;
  disabled?: boolean;
}
