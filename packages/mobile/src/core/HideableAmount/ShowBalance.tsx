import React, { useCallback } from 'react';

import { TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Steezy } from '$styles';
import { Pressable, View } from '$uikit';
import { useTheme } from '$hooks/useTheme';
import { Haptics, isAndroid } from '$utils';
import { DarkTheme } from '$styled';
import { useHideableBalancesAnimation } from '@tonkeeper/shared/components/HideableBalancesAnimation';
import { tk } from '@tonkeeper/shared/tonkeeper';
import { AnimationDirection, HideableText } from '@tonkeeper/shared/components/HideableText';

const TouchableComponent = isAndroid ? Pressable : TouchableHighlight;

export const ShowBalance: React.FC<{ amount: string }> = ({ amount }) => {
  const animation = useHideableBalancesAnimation();
  const { colors } = useTheme();

  const handleToggleHideAmounts = useCallback(() => {
    tk.toggleBalances();
    Haptics.impactHeavy();
  }, []);

  const touchableOpacityStyle = useAnimatedStyle(() => {
    return {
      display: animation.value < 0.5 ? 'flex' : 'none',
    };
  }, []);

  const pressableStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: colors.backgroundSecondary,
      display: animation.value >= 0.5 ? 'flex' : 'none',
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={touchableOpacityStyle}>
        <TouchableOpacity activeOpacity={0.6} onPress={handleToggleHideAmounts}>
          <HideableText animationDirection={AnimationDirection.None} type="num2">
            {amount}
          </HideableText>
        </TouchableOpacity>
      </Animated.View>
      <Animated.View style={[pressableStyle, styles.starsContainer.static]}>
        <TouchableComponent
          style={styles.touchable.static}
          underlayColor={DarkTheme.colors.backgroundHighlighted}
          onPress={handleToggleHideAmounts}
        >
          <HideableText
            animationDirection={AnimationDirection.None}
            style={styles.stars.static}
            type="num2"
          >
            {amount}
          </HideableText>
        </TouchableComponent>
      </Animated.View>
    </View>
  );
};

const styles = Steezy.create({
  container: {
    height: 36,
  },
  starsContainer: {
    borderRadius: 100,
  },
  touchable: {
    paddingHorizontal: 16,
    borderRadius: 100,
  },
  stars: {
    paddingTop: 5.5,
  },
});
