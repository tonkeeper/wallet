import { Steezy } from '$styles';
import React, { FC, memo } from 'react';
import { View } from '../StyledNativeComponents';
import { Text } from '../Text/Text';
import { StyleSheet } from 'react-native';
import { TonThemeColor } from '$styled';

export type TagType = 'default' | 'accent' | 'warning' | 'positive';

interface Props {
  type?: TagType;
  children: string;
}

const getTextColor = (type: TagType): TonThemeColor => {
  switch (type) {
    case 'accent':
      return 'accentPrimary';
    case 'warning':
      return 'accentOrange';
    case 'positive':
      return 'accentPositive';
    case 'default':
    default:
      return 'textSecondary';
  }
};

const TagComponent: FC<Props> = (props) => {
  const { type = 'default', children } = props;

  const textColor = getTextColor(type);

  return (
    <View style={styles.container}>
      <View style={[styles.background, styles[type]]} />
      <Text variant="body4Caps" color={textColor}>
        {children}
      </Text>
    </View>
  );
};

export const Tag = memo(TagComponent);

const styles = Steezy.create(({ colors }) => ({
  container: {
    height: 20,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginLeft: 6,
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.16,
  },
  default: {
    backgroundColor: colors.backgroundContentTint,
    opacity: 1,
  },
  accent: {
    backgroundColor: colors.accentBlue,
  },
  warning: {
    backgroundColor: colors.accentOrange,
  },
  positive: {
    backgroundColor: colors.accentGreen,
  },
}));
