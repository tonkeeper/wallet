import React, { useCallback } from 'react';
import { TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler';
import { usePrivacyStore } from '$store/zustand/privacy/usePrivacyStore';
import { Steezy } from '$styles';
import { Pressable, View } from '$uikit';
import { Haptics, isAndroid } from '$utils';
import { DarkTheme } from '$styled';
import { Text } from '@tonkeeper/uikit';

const TouchableComponent = isAndroid ? Pressable : TouchableHighlight;

export const ShowBalance: React.FC<{ amount: string }> = ({ amount }) => {
  const hideAmounts = usePrivacyStore((state) => state.actions.toggleHiddenAmounts);
  const isHidden = usePrivacyStore((state) => state.hiddenAmounts);

  const handleToggleHideAmounts = useCallback(() => {
    hideAmounts();
    Haptics.impactHeavy();
  }, [hideAmounts]);

  return (
    <View style={styles.container}>
      {isHidden ? (
        <View style={styles.starsContainer}>
          <TouchableComponent
            style={styles.touchable.static}
            underlayColor={DarkTheme.colors.backgroundHighlighted}
            onPress={handleToggleHideAmounts}
          >
            <Text type="num2" style={styles.stars.static}>
              {'* * *'}
            </Text>
          </TouchableComponent>
        </View>
      ) : (
        <TouchableOpacity activeOpacity={0.6} onPress={handleToggleHideAmounts}>
          <Text type="num2">{amount}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = Steezy.create(({ colors }) => ({
  container: {
    height: 36,
  },
  starsContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 100,
  },
  touchable: {
    paddingHorizontal: 16,
    borderRadius: 100,
  },
  stars: {
    paddingTop: 5.5,
  },
}));
