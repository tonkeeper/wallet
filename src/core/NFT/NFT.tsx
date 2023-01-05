import React, { useCallback, useMemo, useRef, useState } from 'react';
import * as S from './NFT.style';
import { Button, Icon, NavBar, Text } from '$uikit';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { ImageWithTitle } from '$core/NFT/ImageWithTitle/ImageWithTitle';
import { checkIsTonDiamondsNFT, compareAddresses, maskifyTonAddress, ns } from '$utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslator } from '$hooks';
import { Properties } from '$core/NFT/Properties/Properties';
import { Details } from '$core/NFT/Details/Details';
import { About } from '$core/NFT/About/About';
import { NFTProps } from '$core/NFT/NFT.interface';
import { useNFT } from '$hooks/useNFT';
import { Platform, Share, View, TouchableOpacity } from 'react-native';
import { TonDiamondFeature } from './TonDiamondFeature/TonDiamondFeature';
import { useDispatch, useSelector } from 'react-redux';
import { walletAddressSelector } from '$store/wallet';
import { NFTModel, TonDiamondMetadata } from '$store/models';
import { useFlags } from '$utils/flags';
import { LinkingDomainButton } from './LinkingDomainButton';
import { nftsActions } from '$store/nfts';
import { useNavigation } from '$libs/navigation';
import { dnsToUsername } from '$utils/dnsToUsername';
import { openDAppBrowser } from '$navigation';

export const NFT: React.FC<NFTProps> = ({ route }) => {
  const flags = useFlags(['disable_nft_markets', 'disable_apperance']);

  const dispatch = useDispatch();
  const nav = useNavigation();
  const address = useSelector(walletAddressSelector);
  const nftFromHistory = useNFT(route.params.keyPair);

  const [nft, setNft] = useState(nftFromHistory);

  const setOwnerAddress = React.useCallback(
    (options: { ownerAddress: string }) => {
      if (!nft.ownerAddress) {
        const updatedNft = { ...nft, ownerAddress: options.ownerAddress };
        dispatch(nftsActions.setNFT({ nft: updatedNft }));
        setNft(updatedNft);
      }
    },
    [nft],
  );

  const isTG = (nft.dns || nft.name)?.endsWith('.t.me');
  const isDNS = !!nft.dns && !isTG;
  const isTonDiamondsNft = checkIsTonDiamondsNFT(nft);

  const t = useTranslator();
  const scrollTop = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const { bottom: bottomInset } = useSafeAreaInsets();
  const canTransfer = useMemo(
    () => compareAddresses(nft.ownerAddress, address.ton),
    [nft.ownerAddress, address.ton],
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollTop.value = event.contentOffset.y;
    },
  });

  const handleOpenInMarketplace = useCallback(() => {
    if (!nft.marketplaceURL) {
      return;
    }
    openDAppBrowser(nft.marketplaceURL);
  }, [nft.marketplaceURL]);

  const handleOpenFragment = useCallback(() => {
    openDAppBrowser('https://fragment.com');
  }, []);

  const handleTransferNft = useCallback(() => {
    nav.openModal('NFTTransferInputAddress', {
      nftAddress: nft.address,
    });
  }, [nft.address]);

  const handleShare = useCallback(() => {
    if (!nft.marketplaceURL) {
      return;
    }
    Share.share({
      url: nft.marketplaceURL,
      title: nft.name,
      message: Platform.OS === 'android' ? nft.marketplaceURL : undefined,
    });
  }, [nft.marketplaceURL, nft.name]);

  const isOnSale = useMemo(() => !!nft.sale, [nft.sale]);

  const lottieUri = isTonDiamondsNft ? nft.metadata?.lottie : undefined;

  const videoUri = isTonDiamondsNft ? nft.metadata?.animation_url : undefined;

  const title = useMemo(() => {
    if (isTG) {
      return dnsToUsername(nft.name);
    }

    if (isDNS) {
      return nft.dns;
    }

    return nft.name || maskifyTonAddress(nft.address);
  }, [isDNS, isTG, nft.dns, nft.name, nft.address]);

  return (
    <S.Wrap>
      <NavBar
        rightContent={
          nft.marketplaceURL && (
            <Button
              onPress={handleShare}
              size="navbar_icon"
              mode="secondary"
              before={<Icon name="ic-share-16" color="foregroundPrimary" />}
            />
          )
        }
        isModal
        scrollTop={scrollTop}
        titleProps={{ numberOfLines: 1 }}
      >
        {title}
      </NavBar>
      <S.ContentWrap>
        <Animated.ScrollView
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          ref={scrollRef}
          contentContainerStyle={{
            paddingHorizontal: ns(16),
            paddingBottom: bottomInset,
          }}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          {nft.name || nft.collection?.name || nft.content.image.baseUrl ? (
            <ImageWithTitle
              uri={isDNS ? undefined : nft.content.image.baseUrl}
              lottieUri={lottieUri}
              videoUri={videoUri}
              title={isTG ? dnsToUsername(nft.name) : nft.dns || nft.name}
              collection={isDNS ? 'TON DNS' : nft.collection?.name}
              isVerified={isDNS || nft.isApproved}
              description={nft.description}
              isOnSale={isOnSale}
              bottom={
                isTG ? (
                  <View style={{ marginTop: ns(8), flexDirection: 'row' }}>
                    <Text variant="body2" color="foregroundSecondary">
                      {t('username_issued_by_telegram')}
                    </Text>
                    <TouchableOpacity activeOpacity={0.6} onPress={handleOpenFragment}>
                      <Text variant="body2" color="accentPrimary">
                        {t('username_manage_name_button')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null
              }
            />
          ) : null}
          {nft.collection ? (
            <About
              collection={isDNS ? 'TON DNS' : nft.collection.name}
              description={isDNS ? t('nft_about_dns') : nft.collection.description}
            />
          ) : null}
          {isTonDiamondsNft && !flags.disable_apperance ? (
            <TonDiamondFeature nft={nft as NFTModel<TonDiamondMetadata>} />
          ) : null}
          <S.ButtonWrap>
            {nft.ownerAddress && (
              <Button
                style={{ marginBottom: ns(16) }}
                onPress={handleTransferNft}
                disabled={!canTransfer}
                size="large"
              >
                {isDNS ? t('nft_transfer_dns') : t('nft_transfer_nft')}
              </Button>
            )}
            {isOnSale ? (
              <S.OnSaleText>
                <Text variant="body2" color="foregroundSecondary">
                  {isDNS ? t('dns_on_sale_text') : t('nft_on_sale_text')}
                </Text>
              </S.OnSaleText>
            ) : null}
            {(isDNS || isTG) && (
              <LinkingDomainButton
                disabled={isOnSale}
                onLink={setOwnerAddress}
                ownerAddress={nft.ownerAddress}
                domainAddress={nft.address}
                domain={nft.dns! || nft.name!}
                isTGUsername={isTG}
              />
            )}
            {nft.marketplaceURL && !flags.disable_nft_markets ? (
              <Button
                style={{ marginBottom: ns(16) }}
                mode={'secondary'}
                onPress={handleOpenInMarketplace}
                size="large"
              >
                {t('nft_open_in_marketplace')}
              </Button>
            ) : null}
          </S.ButtonWrap>
          <Properties properties={nft.attributes} />
          <Details
            ownerAddress={nft.ownerAddressToDisplay || nft.ownerAddress}
            contractAddress={nft.address}
          />
        </Animated.ScrollView>
      </S.ContentWrap>
    </S.Wrap>
  );
};
