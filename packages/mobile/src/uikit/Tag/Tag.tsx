import { Steezy } from '$styles';
import React, { FC, memo } from 'react';
import { View } from '../StyledNativeComponents';
import { StyleSheet } from 'react-native';
import { Text } from '@tonkeeper/uikit';
import { TextColors } from '@tonkeeper/uikit/src/components/Text/Text';

export type TagType =
  | 'default'
  | 'accent'
  | 'warning'
  | 'warningLight'
  | 'positive'
  | 'purple';

interface Props {
  type?: TagType;
  children: string;
  withLeftSpacing?: boolean;
}

const getTextColor = (type: TagType): TextColors => {
  switch (type) {
    case 'accent':
      return 'accentBlue';
    case 'warning':
      return 'accentOrange';
    case 'warningLight':
      return 'constantBlack';
    case 'positive':
      return 'accentGreen';
    case 'purple':
      return 'accentPurple';
    case 'default':
    default:
      return 'textSecondary';
  }
};

const TagComponent: FC<Props> = (props) => {
  const { type = 'default', children, withLeftSpacing = true } = props;

  const textColor = getTextColor(type);

  return (
    <View style={[styles.container, !withLeftSpacing && styles.withoutMargin]}>
      <View style={[styles.background, styles[type]]} />
      <Text type="body4" color={textColor} style={styles.text.static}>
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
  withoutMargin: {
    marginLeft: 0,
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
  warningLight: {
    backgroundColor: colors.accentOrange,
    opacity: 1,
  },
  positive: {
    backgroundColor: colors.accentGreen,
  },
  purple: {
    backgroundColor: colors.accentPurple,
  },
  text: {
    textTransform: 'uppercase',
  },
}));
