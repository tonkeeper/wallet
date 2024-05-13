import React, { memo } from 'react';
import { View } from './View';
import { Steezy } from '../styles';
import { Icon } from './Icon';
import { Text } from './Text';
import { Image, ImageSourcePropType } from 'react-native';
import { TouchableOpacity } from './TouchableOpacity';

export interface HeaderSwitchProps {
  title: string;
  onPress?: () => void;
  icon: ImageSourcePropType;
}

export const HeaderSwitch = memo<HeaderSwitchProps>((props) => {
  return (
    <TouchableOpacity onPress={props.onPress}>
      <View style={styles.container}>
        <Image style={styles.image.static} source={props.icon} />
        <Text type="label2" color="buttonSecondaryForeground">
          {props.title}
        </Text>
        <Icon color="iconSecondary" name={'ic-switch-16'} />
      </View>
    </TouchableOpacity>
  );
});

const styles = Steezy.create(({ colors }) => ({
  container: {
    backgroundColor: colors.buttonSecondaryBackground,
    padding: 4,
    paddingRight: 8,
    borderRadius: 16,
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  image: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
}));
