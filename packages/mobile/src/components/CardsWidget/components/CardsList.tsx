import React, { memo, useCallback } from 'react';
import { AccountState, CardKind } from '$wallet/managers/CardsManager';
import { Icon, List, Steezy, View } from '@tonkeeper/uikit';
import { formatter } from '@tonkeeper/shared/formatter';
import { MainStackRouteNames } from '$navigation';
import { useNavigation } from '@tonkeeper/router';
import { Platform, Text } from 'react-native';
import { BlueTheme } from '@tonkeeper/uikit/src/styles/themes/blue';
import { CryptoCurrencies } from '$shared/constants';
import { useGetTokenPrice } from '$hooks/useTokenPrice';
import { capitalizeFirstLetter } from '@tonkeeper/shared/utils/date';

export interface CardsListProps {
  accounts: AccountState[];
}

const colorsForCardIconBackground = [
  BlueTheme.accentGreen,
  BlueTheme.accentOrange,
  BlueTheme.accentBlue,
  BlueTheme.accentRed,
  BlueTheme.accentPurple,
];

function getColorByFourDigits(fourDigits: string | null | undefined) {
  const sumOfDigits =
    fourDigits
      ?.split('')
      .map(Number)
      .reduce((acc, val) => acc + val, 0) ?? 0;

  return colorsForCardIconBackground[sumOfDigits % colorsForCardIconBackground.length];
}

const fontFamily = Platform.select({
  ios: 'SFMono-Bold',
  android: 'RobotoMono-Bold',
});

export const CardsList = memo<CardsListProps>((props) => {
  const cardNumberStyle = Steezy.useStyle(styles.cardNumber);
  const nav = useNavigation();
  const openWebView = useCallback(() => {
    nav.push(MainStackRouteNames.HoldersWebView);
  }, [nav]);
  const getTokenPrice = useGetTokenPrice();

  const getPrice = useCallback(
    (amount) => {
      return getTokenPrice(CryptoCurrencies.Ton, amount);
    },
    [getTokenPrice],
  );

  return (
    <List indent={false}>
      {props.accounts.map((account) =>
        account.cards.map((card) => (
          <List.Item
            leftContent={
              <View
                style={[
                  styles.cardIcon,
                  { backgroundColor: getColorByFourDigits(card.lastFourDigits) },
                ]}
              >
                <Text style={cardNumberStyle}>{card.lastFourDigits}</Text>
                {card.kind === CardKind.VIRTUAL && (
                  <Icon style={styles.cloudIcon.static} name={'ic-cloud-12'} />
                )}
              </View>
            }
            onPress={openWebView}
            value={`${formatter.fromNano(account.balance)} TON`}
            subvalue={getPrice(formatter.fromNano(account.balance)).formatted.totalFiat}
            subtitle={capitalizeFirstLetter(card.kind)}
            title={`Card *${card.lastFourDigits}`}
          />
        )),
      )}
    </List>
  );
});

export const styles = Steezy.create(({ colors }) => ({
  cardIcon: {
    height: 44,
    width: 30,
    borderRadius: 4,
    paddingTop: 3,
    paddingBottom: 2,
  },
  cardNumber: {
    fontFamily,
    textAlign: 'center',
    fontSize: 8.5,
    lineHeight: 10,
    color: colors.constantWhite,
  },
  cloudIcon: {
    position: 'absolute',
    bottom: 2,
    right: 4,
  },
}));
