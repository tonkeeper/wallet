import React, { memo } from 'react';
import { Steezy, StyleProp } from '$styles';
import { View, TouchableOpacity } from './StyledNativeCompoenets';
import { Text } from './Text/Text';
import { IconNames } from './Icon/generated.types';
import { ViewStyle } from 'react-native';
import { Icon } from './Icon/Icon';

interface IconButtonProps {
  title: string;
  iconName: IconNames;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const IconButton = memo<IconButtonProps>((props) => {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      activeOpacity={0.6}
      style={styles.container}
    > 
      <View style={styles.iconContainer}>
        <Icon name={props.iconName} colorHex="#FFF" />
      </View>
      <Text variant="label3" color="textSecondary">
        {props.title}
      </Text>
    </TouchableOpacity>
  );
});

const styles = Steezy.create(({ colors }) => ({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 14,
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
}));
