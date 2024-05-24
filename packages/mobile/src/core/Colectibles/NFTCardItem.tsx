import { t } from '@tonkeeper/shared/i18n';
import { openNFT } from '$navigation';
import { Steezy } from '$styles';
import { Icon, Pressable, View } from '$uikit';
import { checkIsTonDiamondsNFT } from '$utils';
import { useFlags } from '$utils/flags';
import _ from 'lodash';
import React, { memo, useCallback, useMemo } from 'react';
import * as S from './NFTCardItem.style';
import { useExpiringDomains } from '$store/zustand/domains/useExpiringDomains';
import { AnimationDirection, HideableAmount } from '$core/HideableAmount/HideableAmount';
import { HideableImage } from '$core/HideableAmount/HideableImage';
import { Address } from '@tonkeeper/shared/Address';
import { DNS, KnownTLDs } from '@tonkeeper/core';
import { Text, useTheme } from '@tonkeeper/uikit';
import { NFTModel } from '$store/models';
import { TrustType } from '@tonkeeper/core/src/TonAPI';
import {
  ApprovalStatus,
  TokenApprovalStatus,
} from '$wallet/managers/TokenApprovalManager';

interface NFTCardItemProps {
  item: NFTModel;
  onPress?: () => void;
  approvalStatuses: Record<string, ApprovalStatus>;
}

export const NFTCardItem = memo<NFTCardItemProps>((props) => {
  const { item, approvalStatuses } = props;

  const flags = useFlags(['disable_apperance']);

  const expiringDomains = useExpiringDomains((state) => state.domains);
  const isTonDiamondsNft = checkIsTonDiamondsNFT(item);
  const isOnSale = useMemo(() => !!item.sale, [item.sale]);

  const approvalIdentifier = Address.parse(
    item.collection?.address ?? item.address,
  ).toRaw();
  const nftApprovalStatus = approvalStatuses[approvalIdentifier];

  const isTG = DNS.getTLD(item.dns || item.name) === KnownTLDs.TELEGRAM;
  const isDNS = !!item.dns && !isTG;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleOpenNftItem = useCallback(
    _.throttle(() => openNFT({ currency: item.currency, address: item.address }), 1000),
    [item],
  );

  const title = useMemo(() => {
    if (isDNS) {
      return item.dns;
    }

    return item.name || Address.toShort(item.address);
  }, [isDNS, item.dns, item.name, item.address]);

  const nftRawAddress = useMemo(() => Address.parse(item.address).toRaw(), []);

  const theme = useTheme();

  return (
    <Pressable
      underlayColor={theme.backgroundContentTint}
      backgroundColor={theme.backgroundContent}
      style={styles.container}
      onPress={handleOpenNftItem}
    >
      <HideableImage uri={item.content.image.baseUrl} style={styles.image.static}>
        <S.OnSaleBadge>
          {isOnSale && <Icon name="ic-sale-badge-32" colorless />}
        </S.OnSaleBadge>
        <S.Badges>
          {isTonDiamondsNft && !flags.disable_apperance ? (
            <S.AppearanceBadge>
              <Icon name="ic-appearance-16" color="iconPrimary" />
            </S.AppearanceBadge>
          ) : null}
        </S.Badges>
        {expiringDomains[nftRawAddress] && (
          <S.FireBadge>
            <Icon name="ic-fire-badge-32" colorless />
          </S.FireBadge>
        )}
      </HideableImage>
      <View style={styles.info}>
        <HideableAmount
          animationDirection={AnimationDirection.Left}
          stars="* * * *"
          variant="label2"
          numberOfLines={1}
        >
          {title}
        </HideableAmount>
        {item.trust === TrustType.None &&
        nftApprovalStatus?.current !== TokenApprovalStatus.Approved ? (
          <Text numberOfLines={1} color={'accentOrange'} type="body3">
            {t('suspicious.label.short')}
          </Text>
        ) : (
          <HideableAmount
            animationDirection={AnimationDirection.Left}
            variant="body3"
            color="textSecondary"
            numberOfLines={1}
          >
            {isDNS
              ? 'TON DNS'
              : item?.collection
              ? item.collection.name || t('nft_unnamed_collection')
              : t('nft_single_nft')}
          </HideableAmount>
        )}
      </View>
    </Pressable>
  );
});

const styles = Steezy.create(({ colors, corners }) => ({
  container: {
    position: 'relative',
    flex: 1,
    backgroundColor: colors.backgroundContent,
    borderRadius: corners.medium,
    overflow: 'hidden',
  },
  info: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  blur: {
    zIndex: 3,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 50,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    background: colors.backgroundTertiary,
  },
}));
