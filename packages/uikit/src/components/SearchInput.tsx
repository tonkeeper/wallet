import React, { useCallback } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Steezy, useTheme } from '../styles';
import { View } from './View';
import { TouchableOpacity } from './TouchableOpacity';
import { TextInput, TextInputProps } from './TextInput';
import { Icon } from './Icon';

export interface SearchInputProps extends TextInputProps {
  value: string;
  onChangeText: (value: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = (props) => {
  const inputStyle = Steezy.useStyle(styles.input);
  const colors = useTheme();

  const handlePressClear = useCallback(() => {
    props.onChangeText('');
  }, [props.onChangeText]);

  const clearButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: props.value ? 1 : 0,
    };
  }, [props.value]);

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={inputStyle}
        placeholder={t('choose_country.search')}
        placeholderTextColor={colors.textSecondary}
        autoFocus={true}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="go"
        selectTextOnFocus={true}
        selectionColor={colors.accentBlue}
        {...props}
      />
      <View style={styles.iconContainer}>
        <Icon name={'ic-magnifying-glass-16'} />
      </View>
      <Animated.View
        style={[styles.rightContent.static, clearButtonStyle]}
        pointerEvents={props.value ? 'auto' : 'none'}
      >
        <TouchableOpacity
          style={[styles.rightButton, styles.clearButton]}
          onPress={handlePressClear}
        >
          <Icon name="ic-xmark-circle-16" color="iconSecondary" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = Steezy.create(({ colors }) => ({
  inputContainer: {
    position: 'relative',
    height: 48,
    paddingRight: 16,
    flex: 1,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: colors.backgroundContent,
    borderRadius: 16,
    color: colors.textPrimary,
    fontSize: 16,
    paddingLeft: 44,
  },
  borderContainer: {
    zIndex: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: 'transparent',
  },
  iconContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 16,
    justifyContent: 'center',
  },
  rightButton: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
  },
  rightContent: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 4,
  },
  clearButton: {
    paddingHorizontal: 20,
    marginRight: 8,
  },
}));
