import React, { memo, useCallback } from 'react';
import { AccountState } from '$wallet/managers/CardsManager';
import { List, Steezy, TonIcon, View } from '@tonkeeper/uikit';
import { formatter } from '@tonkeeper/shared/formatter';
import { MainStackRouteNames } from '$navigation';
import { useNavigation } from '@tonkeeper/router';
import { Image, Platform, Text } from 'react-native';
import { DarkTheme } from '@tonkeeper/uikit/src/styles/themes/dark';
import { CryptoCurrencies } from '$shared/constants';
import { useGetTokenPrice } from '$hooks/useTokenPrice';
import { useUnlockVault } from '$core/ModalContainer/NFTOperations/useUnlockVault';
import { useHoldersEnroll } from '../../../screens/HoldersWebView/hooks/useHoldersEnroll';

const MC_LOGO_IMAGE = require('../../../../../uikit/assets/mc-logo.png');

export interface CardsListProps {
  accounts: AccountState[];
}

const colorsForCardIconBackground = [
  DarkTheme.accentGreen,
  DarkTheme.accentOrange,
  DarkTheme.accentBlue,
  DarkTheme.accentRed,
  DarkTheme.accentPurple,
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
  const unlockVault = useUnlockVault();
  const enroll = useHoldersEnroll(unlockVault);
  const openWebView = useCallback(
    (accountId) => () => {
      enroll(() =>
        nav.push(MainStackRouteNames.HoldersWebView, { path: `/account/${accountId}` }),
      );
    },
    [enroll, nav],
  );
  const getTokenPrice = useGetTokenPrice();
  const getPrice = useCallback(
    (amount) => {
      return getTokenPrice(CryptoCurrencies.Ton, amount);
    },
    [getTokenPrice],
  );

  return (
    <List indent={false}>
      {props.accounts.map((account) => (
        <List.Item
          disabled={account.state !== 'ACTIVE'}
          leftContent={<TonIcon showDiamond />}
          onPress={openWebView(account.id)}
          value={`${formatter.fromNano(account.balance)} TON`}
          subvalue={getPrice(formatter.fromNano(account.balance)).formatted.totalFiat}
          subtitle={'Basic account'}
          title={account.name}
        >
          <View style={styles.cardsContainer}>
            {account.cards.map((card) => (
              <View
                key={card.lastFourDigits}
                style={[
                  styles.cardIcon,
                  { backgroundColor: getColorByFourDigits(card.lastFourDigits) },
                ]}
              >
                <Text style={cardNumberStyle}>{card.lastFourDigits}</Text>
                <View style={styles.mastercardLogoContainer}>
                  <Image source={MC_LOGO_IMAGE} style={styles.mastercardLogo.static} />
                </View>
              </View>
            ))}
          </View>
        </List.Item>
      ))}
    </List>
  );
});

export const styles = Steezy.create(({ colors }) => ({
  cardIcon: {
    height: 30,
    width: 44,
    borderRadius: 4,
  },
  cardNumber: {
    position: 'absolute',
    bottom: 3,
    fontWeight: 'bold',
    left: 4,
    fontFamily,
    fontSize: 8.5,
    lineHeight: 10,
    color: colors.constantWhite,
  },
  mastercardLogoContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 5,
  },
  mastercardLogo: {
    height: 6,
    width: 10,
  },
  cardsContainer: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 4,
  },
}));
