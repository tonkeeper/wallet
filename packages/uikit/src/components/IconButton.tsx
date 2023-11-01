import { TouchableOpacity } from './TouchableOpacity';
import React, { memo, useCallback } from 'react';
import { useRouter } from '@tonkeeper/router';
import { Steezy, StyleProp } from '../styles';
import { ViewStyle } from 'react-native';
import { IconNames, Icon } from './Icon';
import { View } from './View';
import { Text } from './Text';

type IconButtonSize = 'large';

interface IconButtonProps {
  horizontalIndent?: 'large' | 'small';
  style?: StyleProp<ViewStyle>;
  size?: IconButtonSize;
  onPress?: () => void;
  navigate?: string;
  iconName: IconNames;
  title: string;
}

export const IconButton = memo<IconButtonProps>((props) => {
  const { horizontalIndent = 'small', navigate, onPress } = props;
  const isSmallWidth = horizontalIndent === 'small';
  const router = useRouter();

  const handlePress = useCallback(() => {
    if (navigate) {
      router.navigate(navigate);
    } else {
      onPress?.();
    }
  }, [onPress, navigate]);

  return (
    <View style={isSmallWidth ? styles.smallWidth : styles.largeWidth}>
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        activeOpacity={0.6}
      >
        <View style={styles.iconContainer}>
          {props.iconName && <Icon name={props.iconName} colorHex="#FFF" />}
        </View>
        <Text numberOfLines={1} type="label3" color="textSecondary">
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
  },
  largeWidth: {
    width: 80,
  },
  smallWidth: {
    width: 72,
  },
}));
