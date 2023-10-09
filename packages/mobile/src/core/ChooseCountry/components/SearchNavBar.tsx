import React from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { SearchInput, Steezy, Text, TouchableOpacity } from '@tonkeeper/uikit';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '$hooks/useTheme';
import { goBack } from '$navigation/imperative';

export interface SearchNavBarProps {
  value: string;
  onChangeText: (value: string) => void;
  scrollY: SharedValue<number> | undefined;
}

export const SearchNavBar: React.FC<SearchNavBarProps> = (props) => {
  const theme = useTheme();
  const borderStyle = useAnimatedStyle(() => {
    return {
      borderBottomColor:
        props.scrollY && props.scrollY.value > 0 ? theme.colors.border : 'transparent',
    };
  });

  return (
    <Animated.View style={[styles.borderContainer.static, borderStyle]}>
      <Animated.View style={[styles.container.static]}>
        <SearchInput value={props.value} onChangeText={props.onChangeText} />
        <TouchableOpacity onPress={goBack}>
          <Text color="accentBlue" type="label1">
            {t('choose_country.cancel')}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = Steezy.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    marginBottom: 16,
    marginHorizontal: 16,
    marginTop: 16,
  },
  borderContainer: {
    zIndex: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: 'transparent',
  },
});
