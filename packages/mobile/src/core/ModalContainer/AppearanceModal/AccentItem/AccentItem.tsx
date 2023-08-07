import { AccentModel } from '$styled';
import { Icon, TonDiamondIcon } from '$uikit';
import React, { FC, memo, useCallback } from 'react';
import {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as S from './AccentItem.style';
import { t } from '@tonkeeper/shared/i18n';

interface Props {
  accent: AccentModel;
  isLastAvailable?: boolean;
  selected?: boolean;
  onPress?: () => void;
}

export const ACCENT_ITEM_WIDTH = 132;

const AccentItemComponent: FC<Props> = (props) => {
  const { accent, selected, isLastAvailable, onPress } = props;

  const color = accent.colors.accentPrimary;

  const selectedValue = useDerivedValue(() => (selected ? 1 : 0), [selected]);
  const highlightedValue = useSharedValue(false);

  const selectedAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(selectedValue.value, { duration: 150 }),
  }));
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(highlightedValue.value ? 0.9 : 1) }],
  }));

  const handlePressIn = useCallback(() => {
    highlightedValue.value = true;
  }, [highlightedValue]);

  const handlePressOut = useCallback(() => {
    highlightedValue.value = false;
  }, [highlightedValue]);

  return (
    <S.Container>
      <S.Touchable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <TonDiamondIcon
          id={accent.id}
          nftIcon={accent.nftIcon}
          size={ACCENT_ITEM_WIDTH}
          disabled={!accent?.available}
          iconAnimatedStyle={iconAnimatedStyle}
          rounded={false}
        />
        <S.InfoContainer>
          <S.Name>{t(`appearance_accent_name.${accent.id}`)}</S.Name>
          <S.Dot color={color} />
        </S.InfoContainer>
        <S.SelectedIconContainer style={selectedAnimatedStyle}>
          <Icon name="ic-done-28" color="foregroundPrimary" />
        </S.SelectedIconContainer>
      </S.Touchable>
      {isLastAvailable ? <S.Divider /> : null}
    </S.Container>
  );
};

export const AccentItem = memo(AccentItemComponent);
