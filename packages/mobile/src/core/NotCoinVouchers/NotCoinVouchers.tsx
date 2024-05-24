import React, { useCallback, useMemo } from 'react';
import * as S from './NotCoinVouchers.style';
import { PopupMenu, PopupMenuItem } from '$uikit';
import { useTokenPrice } from '$hooks/useTokenPrice';
import { openDAppBrowser } from '$navigation';

import { formatter } from '$utils/formatter';
import { useNavigation } from '@tonkeeper/router';
import { HideableAmount } from '$core/HideableAmount/HideableAmount';
import { t } from '@tonkeeper/shared/i18n';
import {
  ActionButtons,
  Icon,
  Screen,
  Spacer,
  Steezy,
  Toast,
  View,
} from '@tonkeeper/uikit';

import { config } from '$config';
import { useNftsState, useTokenApproval, useWallet } from '@tonkeeper/shared/hooks';
import { tk } from '$wallet';
import { Address } from '@tonkeeper/core';
import { Linking, useWindowDimensions } from 'react-native';
import { NFTCardItem } from '$core/Colectibles/NFTCardItem';
import { mapNewNftToOldNftData } from '$utils/mapNewNftToOldNftData';
import { checkBurnDate } from '$utils/notcoin';

const mockupCardSize = {
  width: 114,
  height: 166,
};

const numColumn = 3;
const heightRatio = mockupCardSize.height / mockupCardSize.width;

export const NotCoinVouchers: React.FC = () => {
  const nav = useNavigation();

  const approvalStatuses = useTokenApproval((state) => state.tokens);
  const nfts = useNftsState((s) =>
    Object.values(s.accountNfts).filter(
      (nft) =>
        !nft.sale &&
        nft.collection &&
        Address.compare(nft.collection.address, config.get('notcoin_nft_collection')),
    ),
  );

  const totalValue = nfts
    .reduce(
      (acc, nft) =>
        acc + parseInt(nft.metadata!.attributes[0].value.replace(',', '') ?? '0', 10),
      0,
    )
    .toString();

  const nftsToRender = useMemo(() => nfts.map(mapNewNftToOldNftData), [nfts]);

  const jettonPrice = useTokenPrice(config.get('notcoin_jetton_master'), totalValue);
  const wallet = useWallet();

  const isWatchOnly = wallet && wallet.isWatchOnly;

  const handleOpenExplorer = useCallback(async () => {
    openDAppBrowser(
      config
        .get('accountExplorer', tk.wallet.isTestnet)
        .replace('%s', config.get('notcoin_nft_collection')),
    );
  }, []);

  const handleBurn = useCallback(async () => {
    try {
      const isAvailable = await checkBurnDate();

      if (!isAvailable) {
        return;
      }

      nav.navigate('/burn-vouchers', { max: true });
    } catch (e) {
      if (e.message) {
        Toast.fail(e.message);
      }
    }
  }, [nav]);

  const handleTonkeeperPro = useCallback(async () => {
    try {
      const isAvailable = await checkBurnDate();

      if (!isAvailable) {
        return;
      }

      Linking.openURL(config.get('tonkeeper_pro_url')).catch(null);
    } catch (e) {
      if (e.message) {
        Toast.fail(e.message);
      }
    }
  }, []);

  const renderHeader = useMemo(() => {
    return (
      <S.HeaderWrap>
        <S.FlexRow>
          <S.JettonAmountWrapper>
            <HideableAmount variant="h2">
              {formatter.format(totalValue, {
                decimals: 9,
                currency: 'NOT',
                currencySeparator: 'wide',
              })}
            </HideableAmount>
            {jettonPrice.totalFiat ? (
              <HideableAmount
                style={{ marginTop: 2 }}
                variant="body2"
                color="foregroundSecondary"
              >
                {jettonPrice.formatted.totalFiat}
              </HideableAmount>
            ) : null}
          </S.JettonAmountWrapper>
          <S.Logo
            source={{
              uri: 'https://cache.tonapi.io/imgproxy/4KCMNm34jZLXt0rqeFm4rH-BK4FoK76EVX9r0cCIGDg/rs:fill:200:200:1/g:no/aHR0cHM6Ly9jZG4uam9pbmNvbW11bml0eS54eXovY2xpY2tlci9ub3RfbG9nby5wbmc.webp',
            }}
          />
        </S.FlexRow>
        <Spacer y={24} />
        <ActionButtons
          buttons={[
            {
              id: 'exchange',
              onPress: handleBurn,
              icon: 'ic-swap-horizontal-outline-28',
              title: t('notcoin.exchange'),
              disabled: isWatchOnly,
            },
            {
              id: 'exchange_all',
              onPress: handleTonkeeperPro,
              icon: 'ic-swap-horizontal-outline-28',
              title: t('notcoin.exchange_all'),
              disabled: isWatchOnly,
            },
          ]}
        />
      </S.HeaderWrap>
    );
  }, [
    handleBurn,
    handleTonkeeperPro,
    isWatchOnly,
    jettonPrice.formatted.totalFiat,
    jettonPrice.totalFiat,
    totalValue,
  ]);

  const dimensions = useWindowDimensions();

  const size = useMemo(() => {
    const width = (dimensions.width - 48) / numColumn;
    const height = width * heightRatio;

    return { width, height };
  }, [dimensions.width]);

  return (
    <Screen>
      <Screen.Header
        title={t('notcoin.not_vouchers')}
        rightContent={
          <PopupMenu
            items={[
              <PopupMenuItem
                waitForAnimationEnd
                shouldCloseMenu
                onPress={handleOpenExplorer}
                text={t('jetton_open_explorer')}
                icon={<Icon name="ic-globe-16" color="accentBlue" />}
              />,
            ]}
          >
            <S.HeaderViewDetailsButton onPress={() => null}>
              <Icon name="ic-ellipsis-16" color="iconPrimary" />
            </S.HeaderViewDetailsButton>
          </PopupMenu>
        }
      />
      <Screen.FlashList
        contentContainerStyle={styles.collectiblesContainer.static}
        data={nftsToRender}
        numColumns={3}
        ListHeaderComponent={renderHeader}
        columnWrapperStyle={styles.columnWrapper.static}
        renderItem={({ item }) => (
          <View style={size}>
            <NFTCardItem approvalStatuses={approvalStatuses} item={item} />
          </View>
        )}
      />
    </Screen>
  );
};

const styles = Steezy.create({
  collectiblesContainer: {
    marginHorizontal: 16,
    gap: 8,
  },
  nftElements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  columnWrapper: {
    gap: 8,
  },
});
