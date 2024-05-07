import React, { useCallback } from 'react';
import { TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler';
import { usePrivacyStore } from '$store/zustand/privacy/usePrivacyStore';
import { Steezy } from '$styles';
import { Pressable, View } from '$uikit';
import { Haptics, isAndroid } from '$utils';
import { Icon, Text, useTheme } from '@tonkeeper/uikit';
import { DangerLevel } from '@tonkeeper/shared/hooks';
import { useNavigation } from '@tonkeeper/router';
import { SettingsStackRouteNames } from '$navigation';
import { BatteryIcon } from '@tonkeeper/shared/components/BatteryIcon/BatteryIcon';

const TouchableComponent = isAndroid ? Pressable : TouchableHighlight;

const getColorByDangerLevel = (
  dangerLevel: DangerLevel,
): undefined | 'accentOrange' | 'accentRed' => {
  switch (dangerLevel) {
    case DangerLevel.Normal:
      return undefined;
    case DangerLevel.Medium:
      return 'accentOrange';
    case DangerLevel.High:
      return 'accentRed';
  }
};

export const ShowBalance: React.FC<{
  amount: string;
  dangerLevel: DangerLevel;
  isWatchOnly: boolean;
}> = ({ amount, dangerLevel, isWatchOnly }) => {
  const hideAmounts = usePrivacyStore((state) => state.actions.toggleHiddenAmounts);
  const isHidden = usePrivacyStore((state) => state.hiddenAmounts);
  const nav = useNavigation();

  const handleToggleHideAmounts = useCallback(() => {
    hideAmounts();
    Haptics.impactHeavy();
  }, [hideAmounts]);

  const handleNavigateToBackup = () => nav.navigate(SettingsStackRouteNames.Backup);
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {isHidden ? (
        <View style={styles.starsContainer}>
          <TouchableComponent
            style={styles.touchable.static}
            underlayColor={theme.backgroundHighlighted}
            onPress={handleToggleHideAmounts}
          >
            <Text type="num2" style={styles.stars.static}>
              {'* * *'}
            </Text>
          </TouchableComponent>
        </View>
      ) : (
        <TouchableOpacity activeOpacity={0.6} onPress={handleToggleHideAmounts}>
          <Text color={getColorByDangerLevel(dangerLevel)} type="num3">
            {amount}
          </Text>
        </TouchableOpacity>
      )}
      {!isWatchOnly && <BatteryIcon />}
      {dangerLevel !== DangerLevel.Normal && (
        <TouchableOpacity
          onPress={handleNavigateToBackup}
          activeOpacity={0.6}
          hitSlop={{ right: 20 }}
          style={styles.dangerButton.static}
        >
          <Icon
            name={'ic-information-circle-24'}
            color={getColorByDangerLevel(dangerLevel)}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = Steezy.create(({ colors }) => ({
  container: {
    flexDirection: 'row',
    height: 54,
    alignItems: 'center',
    gap: 8,
  },
  starsContainer: {
    height: 40,
    backgroundColor: colors.buttonSecondaryBackground,
    borderRadius: 100,
  },
  touchable: {
    paddingHorizontal: 16,
    borderRadius: 100,
  },
  stars: {
    paddingTop: 8,
  },
  dangerButton: {
    paddingTop: 21,
    paddingBottom: 11,
  },
}));
