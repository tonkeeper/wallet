export interface InternalNotificationProps {
  title: string;
  caption: string;
  onClose?: () => void;
  onPress?: () => void;
  action?: string;
  mode: 'danger' | 'warning' | 'neutral' | 'positive' | 'tertiary';
}
