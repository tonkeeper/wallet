import { useDimensions, useTranslator } from '$hooks';
import { openMarketplaces } from '$navigation';
import { mainActions, accentSelector, accentTonIconSelector } from '$store/main';
import { NFTModel, TonDiamondMetadata } from '$store/models';
import { nftsSelector } from '$store/nfts';
import {
  AccentKey,
  AccentModel,
  AccentNFTIcon,
  AppearanceAccents,
  getAccentIdByDiamondsNFT,
} from '$styled';
import { BottomSheet } from '$uikit';
import { checkIsTonDiamondsNFT, ns } from '$utils';
import React, {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ListRenderItem } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { AccentItem, ACCENT_ITEM_WIDTH } from './AccentItem/AccentItem';
import { AppearanceBottomSheetProps } from './AppearanceBottomSheet.interface';
import * as S from './AppearanceBottomSheet.style';
import { CustomButton } from './CustomButton/CustomButton';

const AppearanceBottomSheetComponent: FC<AppearanceBottomSheetProps> = (props) => {
  const { selectedAccentNFTAddress } = props;

  const [isClosed, setClosed] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const {
    window: { width: windowWidth },
  } = useDimensions();

  const t = useTranslator();

  const dispatch = useDispatch();

  const { myNfts } = useSelector(nftsSelector);
  const currentAccent = useSelector(accentSelector);
  const accentTonIcon = useSelector(accentTonIconSelector);

  const diamondNFTs = useMemo(
    () => Object.values(myNfts).filter(checkIsTonDiamondsNFT),
    [myNfts],
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
      if (accentTonIcon) {
        return item.nftIcon?.uri === accentTonIcon.uri;
      }

      return item.id === currentAccent;
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
    dispatch(mainActions.setAccent(selectedAccent.id));
    dispatch(mainActions.setTonCustomIcon(selectedAccent?.nftIcon || null));

    setClosed(true);
  }, [dispatch, selectedAccent]);

  const openDiamondsNFTCollection = useCallback(() => {
    if (selectedAccent) {
      openMarketplaces({ accentKey: selectedAccent.id });
    }
  }, [selectedAccent]);

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
    <BottomSheet title={t('appearance_title')} triggerClose={isClosed}>
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
          isUnavailableAccent={!isReadyToChange}
          accents={accents}
          selectedAccentIndex={selectedAccentIndex}
          onPress={isReadyToChange ? changeAccent : openDiamondsNFTCollection}
        >
          {buttonText}
        </CustomButton>
      </S.ButtonContainer>
    </BottomSheet>
  );
};

export const AppearanceBottomSheet = memo(AppearanceBottomSheetComponent);
