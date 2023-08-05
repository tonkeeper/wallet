import React, { FC, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Loader } from '$uikit';
import * as S from './Marketplaces.style';
import { MarketplaceItem } from './MarketplaceItem/MarketplaceItem';
import { t } from '@tonkeeper/shared/i18n';
import { nftsSelector } from '$store/nfts';
import { BottomSheetRef } from '$uikit/BottomSheet/BottomSheet.interface';
import { delay, getDiamondsCollectionMarketUrl } from '$utils';
import { MarketplacesModalProps } from './Marketplaces.interface';
import { Modal, View } from '@tonkeeper/uikit';
import { push } from '$navigation/imperative';
import { SheetActions } from '@tonkeeper/router';

export const Marketplaces: FC<MarketplacesModalProps> = (props) => {
  const { accentKey } = props;

  const { isMarketplacesLoading, marketplaces: data } = useSelector(nftsSelector);

  const bottomSheetRef = React.useRef<BottomSheetRef>(null);
  const handleMarketplacePress = useCallback(async () => {
    bottomSheetRef.current?.close();
    await delay(300); // Close bottom sheet before system animation
  }, [bottomSheetRef]);

  const marketplaces = useMemo(() => {
    if (accentKey) {
      return data
        .filter((item) => ['getgems', 'tonDiamonds'].includes(item.id))
        .map((market) => ({
          ...market,
          marketplace_url: getDiamondsCollectionMarketUrl(market, accentKey),
        }));
    }

    return data;
  }, [accentKey, data]);

  function renderContent() {
    // don't show spinner if we have loaded marketplaces
    if (!marketplaces.length && isMarketplacesLoading) {
      return (
        <S.LoaderWrap>
          <Loader size="medium" />
        </S.LoaderWrap>
      );
    }

    return (
      <S.Contain>
        {marketplaces.map((item, idx, arr) => (
          <MarketplaceItem
            internalId={item.id}
            onPress={handleMarketplacePress}
            topRadius={idx === 0}
            bottomRadius={idx === arr.length - 1}
            key={item.id}
            title={item.title}
            description={item.description}
            iconUrl={item.icon_url}
            marketplaceUrl={item.marketplace_url}
          />
        ))}
      </S.Contain>
    );
  }

  return (
    <Modal>
      <Modal.Header title={t('nft_marketplaces_title')} />
      <Modal.Content safeArea>
        <View style={{ marginBottom: 16 }}>{renderContent()}</View>
      </Modal.Content>
    </Modal>
  );
};

export function openMarketplaces(props?: MarketplacesModalProps) {
  push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: Marketplaces,
    params: props,
    path: 'MARKETPLACES',
  });
}
