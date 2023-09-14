import React, { ReactNode, memo, useMemo } from 'react';
import { Steezy, StyleProp } from '$styles';
import { View, TouchableOpacity } from './StyledNativeComponents';
import { Text } from './Text/Text';
import { IconNames } from './Icon/generated.types';
import { ViewStyle } from 'react-native';
import { Icon } from './Icon/Icon';
import { getLocale } from '$translation';

interface IconButtonProps {
  title: string;
  iconName?: IconNames;
  icon?: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export const IconButton = memo<IconButtonProps>((props) => {
  const locale = useMemo(() => getLocale(), []);

  return (
    <View style={{ width: locale === 'ru' ? 80 : 72, opacity: props.disabled ? 0.5 : 1 }}>
      <TouchableOpacity
        onPress={props.onPress}
        activeOpacity={0.6}
        style={styles.container}
        disabled={props.disabled}
      >
        <View style={styles.iconContainer}>
          {props.iconName ? <Icon name={props.iconName} colorHex="#FFF" /> : null}
          {props.icon}
        </View>
        <Text variant="label3" color="textSecondary">
          {props.title}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = Steezy.create(({ colors }) => ({
  container: {
    paddingVertical: 8,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    marginBottom: 8,
    backgroundColor: colors.buttonTertiaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    flexDirection: 'row',
  },
}));
