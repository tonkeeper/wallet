import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as S from './NFT.style';
import { NavBar, PopupMenu, PopupMenuItem, Text } from '$uikit';
import Animated, {
  FadeOut,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { ImageWithTitle } from '$core/NFT/ImageWithTitle/ImageWithTitle';
import {
  checkIsTelegramNumbersNFT,
  checkIsTonDiamondsNFT,
  ns,
  ONE_YEAR_MILISEC,
} from '$utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '@tonkeeper/shared/i18n';
import { Properties } from '$core/NFT/Properties/Properties';
import { Details } from '$core/NFT/Details/Details';
import { NFTProps } from '$core/NFT/NFT.interface';
import { TonDiamondFeature } from './TonDiamondFeature/TonDiamondFeature';
import { NFTModel, TonDiamondMetadata } from '$store/models';
import { useFlags } from '$utils/flags';
import { LinkingDomainButton } from './LinkingDomainButton';
import { navigation, useNavigation } from '@tonkeeper/router';
import { AppStackRouteNames, openDAppBrowser } from '$navigation';
import { RenewDomainButton, RenewDomainButtonRef } from './RenewDomainButton';
import { Toast } from '$store';
import { useExpiringDomains } from '$store/zustand/domains/useExpiringDomains';
import { usePrivacyStore } from '$store/zustand/privacy/usePrivacyStore';
import { ProgrammableButtons } from '$core/NFT/ProgrammableButtons/ProgrammableButtons';
import { Address, DNS, KnownTLDs } from '@tonkeeper/core';
import { NftItem, TrustType } from '@tonkeeper/core/src/TonAPI';
import { tk } from '$wallet';
import { CustomNftItem } from '@tonkeeper/core/src/TonAPI/CustomNftItems';
import { mapNewNftToOldNftData } from '$utils/mapNewNftToOldNftData';
import { useNftsState, useTokenApproval, useWallet } from '@tonkeeper/shared/hooks';
import { config } from '$config';
import { checkBurnDate } from '$utils/notcoin';
import { Button, Icon, Spacer, Steezy, TouchableOpacity, View } from '@tonkeeper/uikit';
import { openSuspiciousNFTDetails } from '@tonkeeper/shared/modals/SuspiciousNFTDetailsModal';
import {
  TokenApprovalStatus,
  TokenApprovalType,
} from '$wallet/managers/TokenApprovalManager';

const unverifiedTokenHitSlop = { top: 4, left: 4, bottom: 4, right: 4 };

export const NFT: React.FC<NFTProps> = ({ oldNftItem, route }) => {
  const { address: nftAddress } = route?.params?.keyPair || {};

  const flags = useFlags(['disable_nft_markets', 'disable_apperance']);
  const hiddenAmounts = usePrivacyStore((state) => state.hiddenAmounts);
  const nav = useNavigation();
  const wallet = useWallet();
  const nftFromHistory = useNftsState(
    (state) => {
      if (!nftAddress) {
        return null;
      }

      const loadedNft = state.accountNfts[Address.parse(nftAddress).toRaw()];

      return loadedNft
        ? mapNewNftToOldNftData(loadedNft, wallet.address.ton.friendly)
        : null;
    },
    [nftAddress, wallet],
  );
  const [nft, setNft] = useState(nftFromHistory ?? (oldNftItem as NFTModel));

  const [expiringAt, setExpiringAt] = useState(0);
  const [lastFill, setLastFill] = useState(0);

  const setOwnerAddress = React.useCallback(
    (options: { ownerAddress: string }) => {
      if (!nft.ownerAddress) {
        const updatedNft = { ...nft, ownerAddress: options.ownerAddress };
        tk.wallet.nfts.updateNftOwner(
          Address.parse(nft.address).toRaw(),
          Address.parse(options.ownerAddress).toRaw(),
        );
        setNft(updatedNft);
      }
    },
    [nft],
  );

  const approvalStatuses = useTokenApproval((state) => state.tokens);
  const approvalIdentifier = Address.parse(
    nft?.collection?.address ?? nftAddress ?? nft?.address,
  ).toRaw();
  const nftApprovalStatus = approvalStatuses[approvalIdentifier];

  const isTG = DNS.getTLD(nft.dns || nft.name) === KnownTLDs.TELEGRAM;
  const isDNS = !!nft.dns && !isTG;
  const isTonDiamondsNft = checkIsTonDiamondsNFT(nft);
  const isNumbersNft = checkIsTelegramNumbersNFT(nft);

  const getDNSLastFillTime = useCallback(async (): Promise<number> => {
    const data = await tk.wallet.tonapi.blockchain.execGetMethodForBlockchainAccount({
      accountId: nft.address,
      methodName: 'get_last_fill_up_time',
    });

    return data.decoded.last_fill_up_time;
  }, [nft.address]);

  useEffect(() => {
    tk.wallet.nfts
      .fetchByAddress(nft.address)
      .then((data) => {
        setNft(mapNewNftToOldNftData(data, wallet.address.ton.friendly));
      })
      .catch(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isDNS) {
      getDNSLastFillTime().then((utime) => {
        const timeInMilisec = utime * 1000;
        setExpiringAt(timeInMilisec + ONE_YEAR_MILISEC);
        setLastFill(timeInMilisec);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renewDomainButtonRef = useRef<RenewDomainButtonRef>(null);
  const expiringDomains = useExpiringDomains((s) => s.actions);

  const handleRenewDNSSend = useCallback(() => {
    const timer = setInterval(async () => {
      const utime = await getDNSLastFillTime();
      const timeInMilisec = utime * 1000;
      if (timeInMilisec !== lastFill) {
        setExpiringAt(timeInMilisec + ONE_YEAR_MILISEC);
        setLastFill(timeInMilisec);
        renewDomainButtonRef.current?.renewUpdated();
        Toast.show(t('dns_renew_toast_success'));
        expiringDomains.remove(nft.address);

        clearInterval(timer);
      }
    }, 5000);
  }, [expiringDomains, getDNSLastFillTime, lastFill, nft.address]);

  const scrollTop = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const { bottom: bottomInset } = useSafeAreaInsets();

  const isOnSale = useMemo(() => !!nft.sale, [nft.sale]);
  const isCurrentAddressOwner = useMemo(
    () =>
      !isOnSale && wallet && Address.compare(nft.ownerAddress, wallet.address.ton.raw),
    [isOnSale, nft.ownerAddress, wallet],
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
    nav.push(AppStackRouteNames.NFTSend, {
      nftAddress: nft.address,
    });
  }, [nav, nft.address]);

  const lottieUri = isTonDiamondsNft ? nft.metadata?.lottie : undefined;

  const videoUri = isTonDiamondsNft ? nft.metadata?.animation_url : undefined;

  const title = useMemo(() => {
    if (isDNS) {
      return nft.dns;
    }

    return nft.name || Address.toShort(nft.address);
  }, [isDNS, nft.dns, nft.name, nft.address]);

  const isWatchOnly = wallet && wallet.isWatchOnly;

  const handleBurn = useCallback(async () => {
    try {
      const isAvailable = await checkBurnDate();

      if (!isAvailable) {
        return;
      }

      nav.navigate('/burn-vouchers');
    } catch (e) {
      if (e.message) {
        Toast.fail(e.message);
      }
    }
  }, [nav]);

  const handleNewApproveStatus = useCallback(
    (approvalStatus: TokenApprovalStatus) => () => {
      const address = Address.parse(nft.collection?.address ?? nft.address).toRaw();

      tk.wallet.tokenApproval.updateTokenStatus(
        address,
        approvalStatus,
        nft.collection ? TokenApprovalType.Collection : TokenApprovalType.Token,
      );

      if (approvalStatus === TokenApprovalStatus.Spam) {
        if (!tk.wallet.isTestnet) {
          fetch(`${config.get('scamEndpoint')}/report/${nft.address}`, {
            method: 'POST',
          }).catch((e) => console.warn(e));
        }
        Toast.success(
          t(`suspicious.status_update.spam.${nft.collection ? 'collection' : 'nft'}`),
        );
        nav.goBack();
      }

      if (approvalStatus === TokenApprovalStatus.Declined) {
        Toast.success(
          t(`suspicious.status_update.hidden.${nft.collection ? 'collection' : 'nft'}`),
        );
        nav.goBack();
      }
    },
    [nav, nft.address, nft.collection],
  );

  const handleOpenExplorer = useCallback(async () => {
    openDAppBrowser(
      config.get('accountExplorer', wallet.isTestnet).replace('%s', nft.address),
    );
  }, [nft.address, wallet.isTestnet]);

  const isTrusted = nft.trust === TrustType.Whitelist;
  const isManuallyApproved = nftApprovalStatus?.current === TokenApprovalStatus.Approved;

  return (
    <S.Wrap>
      <NavBar
        isModal
        rightContent={
          <PopupMenu
            width={276}
            items={[
              <PopupMenuItem
                waitForAnimationEnd
                shouldCloseMenu
                onPress={handleNewApproveStatus(TokenApprovalStatus.Declined)}
                text={t(`nft_actions.hide.${nft.collection ? 'collection' : 'nft'}`)}
                icon={<Icon name="ic-eye-disable-16" color="accentBlue" />}
              />,
              <PopupMenuItem
                waitForAnimationEnd
                shouldCloseMenu
                onPress={handleNewApproveStatus(TokenApprovalStatus.Spam)}
                text={t('nft_actions.hide_and_report')}
                icon={<Icon name="ic-block-16" color="accentBlue" />}
              />,
              <PopupMenuItem
                waitForAnimationEnd
                shouldCloseMenu
                onPress={handleOpenExplorer}
                text={t('nft_actions.view_on_explorer')}
                icon={<Icon name="ic-globe-16" color="accentBlue" />}
              />,
            ]}
          >
            <TouchableOpacity activeOpacity={0.24} style={styles.rightNavButton}>
              <Icon color="iconPrimary" name={'ic-ellipsis-16'} />
            </TouchableOpacity>
          </PopupMenu>
        }
        scrollTop={scrollTop}
        subtitle={
          !isTrusted && (
            <TouchableOpacity
              onPress={() =>
                openSuspiciousNFTDetails({
                  handleNewApproveStatus,
                  isApprovedNow: isManuallyApproved,
                })
              }
              hitSlop={unverifiedTokenHitSlop}
              style={styles.subtitleContainer}
            >
              <Text
                variant="body2"
                color={isManuallyApproved ? 'textSecondary' : 'accentOrange'}
              >
                {t('suspiciousNFTDetails.title')}
              </Text>
              <Spacer x={4} />
              <View style={styles.iconContainer}>
                <Icon
                  name="ic-information-circle-12"
                  color={isManuallyApproved ? 'iconSecondary' : 'accentOrange'}
                />
              </View>
            </TouchableOpacity>
          )
        }
        subtitleProps={{ color: 'accentOrange' }}
        titleProps={{ numberOfLines: 1 }}
      >
        {hiddenAmounts ? '* * * *' : title}
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
          {!isTrusted && !isManuallyApproved && (
            <Animated.View
              exiting={FadeOut.duration(200)}
              style={styles.reportButtonsContainer.static}
            >
              <Button
                onPress={handleNewApproveStatus(TokenApprovalStatus.Spam)}
                style={styles.flex.static}
                stretch
                color="orange"
                size="medium"
                title={t('suspicious.buttons.report')}
              />
              <Button
                onPress={handleNewApproveStatus(TokenApprovalStatus.Approved)}
                color="secondary"
                style={styles.flex.static}
                stretch
                size="medium"
                title={t('suspicious.buttons.not_spam')}
              />
            </Animated.View>
          )}
          {nft.name || nft.collection?.name || nft.content.image.baseUrl ? (
            <ImageWithTitle
              copyableTitle={isNumbersNft}
              uri={nft.content.image.baseUrl}
              lottieUri={lottieUri}
              videoUri={videoUri}
              title={(!isTG && nft.dns) || nft.name}
              collection={isDNS ? 'TON DNS' : nft.collection?.name}
              isVerified={isDNS || nft.trust === TrustType.Whitelist}
              description={!hiddenAmounts ? nft.description : '* * *'}
              collectionDescription={!hiddenAmounts && nft.collection?.description}
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
          {!isWatchOnly && isTonDiamondsNft && !flags.disable_apperance ? (
            <TonDiamondFeature nft={nft as NFTModel<TonDiamondMetadata>} />
          ) : null}
          {!isWatchOnly && !wallet.isLedger ? (
            <S.ButtonWrap>
              {nft.ownerAddress && (
                <Button
                  style={{ marginBottom: ns(16) }}
                  onPress={handleTransferNft}
                  disabled={
                    !isCurrentAddressOwner ||
                    (nft.metadata as { render_type: string }).render_type === 'hidden'
                  }
                  size="large"
                  title={isDNS ? t('nft_transfer_dns') : t('nft_transfer_nft')}
                />
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
                  disabled={!isCurrentAddressOwner}
                  onLink={setOwnerAddress}
                  ownerAddress={nft.ownerAddress}
                  domainAddress={nft.address}
                  domain={nft.dns! || nft.name!}
                  isTGUsername={isTG}
                />
              )}
              {isDNS && (
                <RenewDomainButton
                  disabled={!isCurrentAddressOwner}
                  ref={renewDomainButtonRef}
                  ownerAddress={nft.ownerAddress}
                  domainAddress={nft.address}
                  expiringAt={expiringAt}
                  loading={expiringAt === 0}
                  onSend={handleRenewDNSSend}
                />
              )}
              {nft.marketplaceURL && !flags.disable_nft_markets ? (
                <Button
                  style={{ marginBottom: ns(16) }}
                  onPress={handleOpenInMarketplace}
                  size="large"
                  color="secondary"
                  title={t('nft_open_in_marketplace')}
                />
              ) : null}
              {isCurrentAddressOwner &&
              nft.collection &&
              Address.compare(
                nft.collection.address,
                config.get('notcoin_nft_collection'),
              ) &&
              config.get('notcoin_burn') ? (
                <Button
                  onPress={handleBurn}
                  color="secondary"
                  title={t('notcoin.exchange_to_not')}
                />
              ) : (
                <ProgrammableButtons
                  disabled={!isCurrentAddressOwner}
                  nftAddress={nft.address}
                  isApproved={nft.trust === TrustType.Whitelist}
                  buttons={nft.metadata.buttons}
                />
              )}
            </S.ButtonWrap>
          ) : null}
          {!hiddenAmounts && <Properties properties={nft.attributes} />}
          <Details
            ownerAddress={nft.ownerAddressToDisplay || nft.ownerAddress}
            contractAddress={nft.address}
            expiringAt={expiringAt}
          />
        </Animated.ScrollView>
      </S.ContentWrap>
    </S.Wrap>
  );
};

export async function openNftModal(nftAddress: string, nftItem?: NftItem) {
  const openModal = (nftItem: CustomNftItem) => {
    // TODO: change me
    const oldNftItem = mapNewNftToOldNftData(nftItem, tk.wallet.address.ton.friendly);
    navigation.push('NFTItemDetails', { oldNftItem });
  };

  try {
    const cachedNftItem = tk.wallet.nfts.getCachedByAddress(nftAddress, nftItem);
    if (cachedNftItem) {
      openModal(cachedNftItem);
    } else {
      Toast.loading();
      const item = await tk.wallet.nfts.fetchByAddress(nftAddress);
      openModal(item);
      Toast.hide();
    }
  } catch (err) {
    console.log(err);
    Toast.fail('Error load nft');
  }
}

const styles = Steezy.create(({ colors }) => ({
  subtitleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  rightNavButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: colors.buttonSecondaryBackground,
  },
  iconContainer: {
    marginTop: 2,
  },
  reportButtonsContainer: {
    zIndex: 500,
    marginTop: 8,
    marginBottom: 16,
    gap: 8,
    flexDirection: 'row',
  },
  flex: {
    flex: 1,
  },
}));
