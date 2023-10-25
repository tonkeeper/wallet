import React, { useCallback, useRef, useState } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import {
  SearchInput,
  Spacer,
  Steezy,
  Text,
  TextInputRef,
  TouchableOpacity,
} from '@tonkeeper/uikit';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '$hooks/useTheme';
import { LayoutAnimation } from 'react-native';
import { NavBar } from '$uikit';

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

  const [focused, setFocused] = useState(false);

  const inputRef = useRef<TextInputRef>(null);

  const handleFocus = useCallback(() => {
    setFocused(true);
    LayoutAnimation.configureNext({
      ...LayoutAnimation.Presets.easeInEaseOut,
      duration: 200,
    });
  }, []);

  const handleBlur = useCallback(() => {
    setFocused(false);
    LayoutAnimation.configureNext({
      ...LayoutAnimation.Presets.easeInEaseOut,
      duration: 200,
    });
  }, []);

  const handleCancelPress = useCallback(() => {
    props.onChangeText('');
    inputRef.current?.blur();
  }, [props]);

  const searchActive = focused || props.value.length > 0;

  return (
    <Animated.View style={[styles.borderContainer.static, borderStyle]}>
      {!searchActive ? (
        <NavBar isModal isClosedButton hideBackButton forceBigTitle>
          {t('choose_country.title')}
        </NavBar>
      ) : (
        <Spacer y={16} />
      )}
      <Animated.View style={[styles.container.static]}>
        <SearchInput
          ref={inputRef}
          value={props.value}
          onChangeText={props.onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {searchActive ? (
          <>
            <Spacer x={16} />
            <TouchableOpacity onPress={handleCancelPress} style={styles.cancelContainer}>
              <Text color="accentBlue" type="label1">
                {t('choose_country.cancel')}
              </Text>
            </TouchableOpacity>
          </>
        ) : null}
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
  },
  borderContainer: {
    zIndex: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: 'transparent',
  },
  cancelContainer: {
    padding: 16,
    margin: -16,
  },
});
