import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDimensions } from '$hooks/useDimensions';
import { NFTModel, TonDiamondMetadata } from '$store/models';
import {
  AccentKey,
  AccentModel,
  AccentNFTIcon,
  AppearanceAccents,
  getAccentIdByDiamondsNFT,
} from '$styled';
import { checkIsTonDiamondsNFT, delay, ns } from '$utils';
import { ListRenderItem } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { AccentItem, ACCENT_ITEM_WIDTH } from './AccentItem/AccentItem';
import { AppearanceModalProps } from './AppearanceModal.interface';
import * as S from './AppearanceModal.style';
import { CustomButton } from './CustomButton/CustomButton';
import { t } from '@tonkeeper/shared/i18n';
import { Modal, View } from '@tonkeeper/uikit';
import { SheetActions, useNavigation } from '@tonkeeper/router';
import { push } from '$navigation/imperative';
import { useNftsState, useWallet } from '@tonkeeper/shared/hooks';
import { mapNewNftToOldNftData } from '$utils/mapNewNftToOldNftData';
import { BrowserStackRouteNames, TabsStackRouteNames } from '$navigation';
import { tk } from '$wallet';
import { Address } from '@tonkeeper/shared/Address';

const AppearanceModal = memo<AppearanceModalProps>((props) => {
  const { selectedAccentNFTAddress } = props;
  const nav = useNavigation();

  const flatListRef = useRef<FlatList>(null);

  const {
    window: { width: windowWidth },
  } = useDimensions();

  const { accountNfts, selectedDiamond } = useNftsState();
  const wallet = useWallet();

  const diamondNFTs = useMemo(
    () =>
      Object.values(accountNfts)
        .map((item) => mapNewNftToOldNftData(item, wallet.address.ton.friendly))
        .filter(checkIsTonDiamondsNFT),
    [accountNfts, wallet],
  );

  const getNFTIcon = useCallback((nft: NFTModel<TonDiamondMetadata>) => {
    const size =
      nft.attributes.find((item) => item.trait_type === 'Size')?.value.toLowerCase() ||
      '';

    return { uri: nft.metadata.image_diamond, size } as AccentNFTIcon;
  }, []);

  const accents = useMemo(() => {
    const accentsKeys = Object.keys(AppearanceAccents);

    const nftsAccents: AccentModel[] = diamondNFTs.map((nft) => ({
      ...AppearanceAccents[getAccentIdByDiamondsNFT(nft)],
      available: true,
      nftIcon: getNFTIcon(nft),
      nft,
    }));

    const otherAccents = Object.values(AppearanceAccents)
      .map((accent) => ({
        ...accent,
        available: accent.id === AccentKey.default,
      }))
      .filter((accent) => nftsAccents.findIndex((item) => item.id === accent.id) === -1);

    return [...nftsAccents, ...otherAccents].sort((a, b) => {
      if (a?.available && !b?.available) {
        return -1;
      }
      if (!a?.available && b?.available) {
        return 1;
      }

      return accentsKeys.indexOf(a.id) - accentsKeys.indexOf(b.id);
    });
  }, [diamondNFTs, getNFTIcon]);

  const [selectedAccentIndex, setSelectedAccentIndex] = useState<number>(() => {
    if (selectedAccentNFTAddress) {
      const nft = diamondNFTs.find((item) => item.address === selectedAccentNFTAddress);

      if (nft) {
        const nftIcon = getNFTIcon(nft);

        return accents.findIndex(
          (item) =>
            item.colors.accentPrimary === nft.metadata.theme.main &&
            item.nftIcon?.uri === nftIcon.uri,
        );
      }
    }

    const index = accents.findIndex((item) => {
      if (selectedDiamond && item.nft) {
        return Address.compare(item.nft.address, selectedDiamond.address);
      }

      return false;
    });

    return index !== -1 ? index : 0;
  });

  const selectedAccent = accents[selectedAccentIndex];

  const isReadyToChange = selectedAccent?.available;

  const renderItem: ListRenderItem<AccentModel> = useCallback(
    ({ item, index }) => {
      return (
        <AccentItem
          accent={item}
          onPress={() => setSelectedAccentIndex(index)}
          selected={selectedAccentIndex === index}
          isLastAvailable={item?.available && !accents[index + 1]?.available}
        />
      );
    },
    [accents, selectedAccentIndex],
  );

  const buttonText = isReadyToChange
    ? t('appearance_confirm')
    : t('nft_open_in_marketplace');

  const changeAccent = useCallback(() => {
    tk.wallet.nfts.setSelectedDiamond(selectedAccent.nft?.address ?? null);

    nav.goBack();
  }, [nav, selectedAccent]);

  const openDiamondsNFTCollection = useCallback(async () => {
    if (selectedAccent) {
      nav.goBack();
      await delay(300);
      nav.navigate(TabsStackRouteNames.BrowserStack);
      nav.push(BrowserStackRouteNames.Category, { categoryId: 'nft' });
    }
  }, [nav, selectedAccent]);

  useEffect(() => {
    setTimeout(() => {
      flatListRef?.current?.scrollToOffset({
        offset:
          (ACCENT_ITEM_WIDTH + ns(12)) * selectedAccentIndex +
          ns(16) -
          windowWidth / 2 +
          ACCENT_ITEM_WIDTH / 2,
      });
    }, 0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal>
      <Modal.Header title={t('appearance_title')} />
      <Modal.Content safeArea>
        <View style={{ marginBottom: 16 }}>
          <S.Description>{t('appearance_description')}</S.Description>
          <FlatList
            ref={flatListRef}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => `${item.id}_${item.nftIcon?.uri || 'local'}`}
            contentContainerStyle={{ paddingHorizontal: ns(16) }}
            ItemSeparatorComponent={S.Divider}
            horizontal={true}
            data={accents}
            renderItem={renderItem}
          />
          <S.ButtonContainer>
            <CustomButton
              accents={accents}
              selectedAccentIndex={selectedAccentIndex}
              onPress={isReadyToChange ? changeAccent : openDiamondsNFTCollection}
            >
              {buttonText}
            </CustomButton>
          </S.ButtonContainer>
        </View>
      </Modal.Content>
    </Modal>
  );
});

export function openAppearance(props?: AppearanceModalProps) {
  push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: AppearanceModal,
    params: props,
    path: 'APPEARANCE',
  });
}
