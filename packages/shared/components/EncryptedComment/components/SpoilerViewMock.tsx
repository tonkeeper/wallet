import React, { FC, memo } from 'react';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Icon, Spacer, Steezy, Text, View } from '@tonkeeper/uikit';
import { TextProps } from '@tonkeeper/uikit/src/components/Text';
import { ViewProps } from 'react-native';
import { t } from '@tonkeeper/shared/i18n';

export interface SpoilerViewMockProps extends ViewProps {
  isOn?: boolean;
  withIcon?: boolean;
  mockTextType?: TextProps['type'];
  mockText?: string;
}

const SpoilerViewMockComponent: FC<SpoilerViewMockProps> = ({ children, ...props }) => {
  const isOn = props.isOn;
  const style = useAnimatedStyle(() => ({ opacity: withTiming(isOn ? 0 : 1) }), [isOn]);

  if (isOn) {
    return (
      <View style={styles.container}>
        {props.withIcon && <Icon name={'ic-lock-16'} color={'accentGreen'} />}
        <Spacer x={6} />
        <Text type={props.mockTextType ?? 'body2'}>
          {props.mockText ?? t('encryptedComments.encryptedComment')}
        </Text>
      </View>
    );
  }
  return <Animated.View style={style}>{children}</Animated.View>;
};

export const SpoilerViewMock = memo(SpoilerViewMockComponent);

const styles = Steezy.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
