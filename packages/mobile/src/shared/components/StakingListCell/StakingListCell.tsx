import { useFiatValue } from '$hooks/useFiatValue';
import { CryptoCurrencies, Decimals } from '$shared/constants';
import { Steezy } from '$styles';
import { Spacer, Tag, Text, View } from '$uikit';
import { stakingFormatter } from '$utils/formatter';
import React, { FC, ReactNode, memo, useCallback } from 'react';
import { ImageRequireSource, TouchableHighlight } from 'react-native';
import { Source } from 'react-native-fast-image';
import * as S from './StakingListCell.style';
import { HideableAmount } from '$core/HideableAmount/HideableAmount';
import { JettonBalanceModel } from '$store/models';
import { t } from '@tonkeeper/shared/i18n';
import { Icon, Pressable, isAndroid, useTheme } from '@tonkeeper/uikit';
import { useBackgroundHighlighted } from '@tonkeeper/shared/hooks/useBackgroundHighlighted';
import Animated from 'react-native-reanimated';

interface Props {
  id: string;
  name: string;
  description?: string;
  balance?: string;
  stakingJetton?: JettonBalanceModel;
  icon?: ReactNode;
  iconSource?: Source | ImageRequireSource | null;
  isWidget?: boolean;
  isWidgetAccent?: boolean;
  isBuyTon?: boolean;
  numberOfLines?: number;
  isWithdrawal?: boolean;
  highestApy?: boolean | null;
  message?: string | ReactNode;
  onMessagePress?: () => void;
  onPress?: (id: string, name: string) => void;
}

const StakingListCellComponent: FC<Props> = (props) => {
  const {
    name,
    description,
    balance: balanceValue,
    stakingJetton,
    icon,
    iconSource,
    id,
    isWidget,
    isWidgetAccent,
    isBuyTon,
    numberOfLines,
    highestApy,
    message,
    onMessagePress,
    onPress,
  } = props;

  const theme = useTheme();

  const currency = stakingJetton ? stakingJetton.jettonAddress : CryptoCurrencies.Ton;

  const balance = useFiatValue(
    currency as CryptoCurrencies,
    stakingJetton ? stakingJetton.balance : balanceValue || '0',
    stakingJetton ? stakingJetton.metadata.decimals : Decimals[CryptoCurrencies.Ton],
    !!stakingJetton,
    'TON',
  );

  const handlePress = useCallback(() => {
    onPress?.(id, name);
  }, [id, name, onPress]);

  const { onPressOut, onPressIn, backgroundStyle } = useBackgroundHighlighted();

  const TouchableComponent = isAndroid ? Pressable : TouchableHighlight;

  return (
    <>
      <TouchableComponent
        onPressOut={onPressOut}
        onPressIn={onPressIn}
        onPress={handlePress}
        underlayColor={theme.backgroundContentTint}
      >
        <View>
          <S.Container>
            {icon}
            {!icon ? (
              <View
                style={[
                  styles.iconContainer,
                  isWidget && styles.widgetIconContainer,
                  isWidgetAccent && styles.widgetAccentIconContainer,
                ]}
              >
                {iconSource ? (
                  <S.Icon source={iconSource} />
                ) : (
                  <Icon
                    name={isBuyTon ? 'ic-creditcard-28' : 'ic-staking-28'}
                    color={isWidget ? 'iconPrimary' : 'iconSecondary'}
                  />
                )}
              </View>
            ) : null}
            <Spacer x={16} />
            <S.Content>
              <S.Row>
                <S.Title>{name}</S.Title>
                {highestApy ? (
                  <Tag type="positive">{t('staking.highest_apy')}</Tag>
                ) : null}
              </S.Row>
              <S.SubTitle numberOfLines={numberOfLines ?? 2}>{description}</S.SubTitle>
            </S.Content>
            <S.RightContainer>
              {balanceValue ? (
                <>
                  <HideableAmount variant="label1" numberOfLines={1} textAlign="right">
                    {stakingFormatter.format(balance.totalTon, { decimals: 2 })}{' '}
                    {balance.symbol}
                  </HideableAmount>
                  <HideableAmount
                    variant="body2"
                    color={'foregroundSecondary'}
                    numberOfLines={1}
                    textAlign="right"
                  >
                    {balance.formatted.totalFiat}
                  </HideableAmount>
                </>
              ) : (
                <Icon name="ic-chevron-right-16" />
              )}
            </S.RightContainer>
          </S.Container>
          {message ? (
            <View style={styles.messageContainer}>
              <Animated.View style={[styles.message.static, backgroundStyle]}>
                <TouchableHighlight
                  underlayColor={theme.backgroundHighlighted}
                  onPress={onMessagePress}
                  disabled={!onMessagePress}
                >
                  <View style={styles.massageInner}>
                    <Text variant="body2">{message}</Text>
                  </View>
                </TouchableHighlight>
              </Animated.View>
            </View>
          ) : null}
        </View>
      </TouchableComponent>
    </>
  );
};

export const StakingListCell = memo(StakingListCellComponent);

const styles = Steezy.create(({ colors }) => ({
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundContentTint,
    overflow: 'hidden',
  },
  widgetIconContainer: {
    backgroundColor: colors.accentGreen,
  },
  widgetAccentIconContainer: {
    backgroundColor: colors.accentBlue,
  },
  messageContainer: {
    alignItems: 'flex-start',
    paddingHorizontal: 16,
  },
  message: {
    borderRadius: 12,
    backgroundColor: colors.backgroundContentTint,
    marginLeft: 60,
    marginTop: -8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  massageInner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
}));
