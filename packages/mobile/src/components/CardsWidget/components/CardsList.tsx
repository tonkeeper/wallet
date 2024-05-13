import React, { memo, useCallback } from 'react';
import { AccountState, PrepaidCard } from '$wallet/managers/CardsManager';
import { List, Steezy, TonIcon, View } from '@tonkeeper/uikit';
import { formatter } from '@tonkeeper/shared/formatter';
import { MainStackRouteNames } from '$navigation';
import { useNavigation } from '@tonkeeper/router';
import { Image, Platform, Text } from 'react-native';
import { CryptoCurrencies } from '$shared/constants';
import { useGetTokenPrice } from '$hooks/useTokenPrice';
import { useUnlockVault } from '$core/ModalContainer/NFTOperations/useUnlockVault';
import { useHoldersEnroll } from '../../../screens/HoldersWebView/hooks/useHoldersEnroll';

const MC_LOGO_IMAGE = require('../../../../../uikit/assets/mc-logo.png');

const CARD_DESIGN_1 = require('../../../../../uikit/assets/cardDesigns/design-1.png');
const CARD_DESIGN_2 = require('../../../../../uikit/assets/cardDesigns/design-2.png');
const CARD_DESIGN_3 = require('../../../../../uikit/assets/cardDesigns/design-3.png');

export interface CardsListProps {
  accounts: AccountState[];
  prepaidCards: PrepaidCard[];
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
    (accountId, path: 'account' | 'card-prepaid' = 'account') =>
      () => {
        enroll(() =>
          nav.push(MainStackRouteNames.HoldersWebView, { path: `/${path}/${accountId}` }),
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
          disabled={!['PENDING_CONTRACT', 'ACTIVE'].includes(account.state)}
          leftContent={<TonIcon showDiamond />}
          onPress={openWebView(account.id)}
          value={`${formatter.fromNano(account.balance)} TON`}
          subvalue={getPrice(formatter.fromNano(account.balance)).formatted.totalFiat}
          subtitle={'Basic account'}
          title={account.name}
        >
          <View style={styles.cardsContainer}>
            {account.cards.map((card) => (
              <View key={card.lastFourDigits} style={[styles.cardIcon]}>
                <Image source={CARD_DESIGN_3} style={styles.cardCover.static} />
                <Text style={cardNumberStyle}>{card.lastFourDigits}</Text>
                <View style={styles.mastercardLogoContainer}>
                  <Image source={MC_LOGO_IMAGE} style={styles.mastercardLogo.static} />
                </View>
              </View>
            ))}
          </View>
        </List.Item>
      ))}
      {props.prepaidCards.map((card) => (
        <List.Item
          onPress={openWebView(card.id, 'card-prepaid')}
          leftContent={
            <View key={card.lastFourDigits} style={[styles.cardIcon]}>
              <Image source={CARD_DESIGN_3} style={styles.cardCover.static} />
              <Text style={cardNumberStyle}>{card.lastFourDigits}</Text>
              <View style={styles.mastercardLogoContainer}>
                <Image source={MC_LOGO_IMAGE} style={styles.mastercardLogo.static} />
              </View>
            </View>
          }
          value={card.fiatBalance}
          subtitle={'Prepaid card'}
          title={`* ${card.lastFourDigits}`}
        />
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
  cardCover: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 44,
    height: 30,
    borderRadius: 4,
  },
}));
