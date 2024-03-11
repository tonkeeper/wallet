import React, { ReactNode } from 'react';
import { Switch, StyleSheet, View } from 'react-native';
import { Highlight } from './Highlight/Highlight';
import { Text } from './Text/Text';

interface SwitchItemProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  value: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}

export const SwitchItem: React.FC<SwitchItemProps> = (props) => {
  const { icon, title, onChange, value, disabled, subtitle } = props;

  const handleToggle = React.useCallback(() => onChange(!value), [onChange, value]);

  return (
    <Highlight onPress={handleToggle} style={styles.container} isDisabled={disabled}>
      <View style={styles.row}>
        {icon}
        <View style={styles.titleContainer}>
          <Text
            variant="label1"
            numberOfLines={1}
            color="foregroundPrimary"
            lineHeight={24}
          >
            {title}
          </Text>
          {!!subtitle && (
            <Text color="foregroundSecondary" variant="body2" lineHeight={20}>
              {subtitle}
            </Text>
          )}
        </View>
        <Switch value={value} onChange={handleToggle} disabled={disabled} />
      </View>
    </Highlight>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
});
