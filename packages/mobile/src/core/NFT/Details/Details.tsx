import React, { useCallback, useMemo } from 'react';
import * as S from './Details.style';
import { DetailsProps } from './Details.interface';
import { t } from '@tonkeeper/shared/i18n';
import { Highlight, Separator, Text } from '$uikit';
import Clipboard from '@react-native-community/clipboard';
import { getLocale } from '$utils';
import { openDAppBrowser } from '$navigation';
import { Toast } from '$store';
import { format } from 'date-fns';
import { Address } from '@tonkeeper/core';
import { getFlag } from '$utils/flags';
import { config } from '$config';
import { tk } from '$wallet';

export const Details: React.FC<DetailsProps> = ({
  tokenId,
  chain,
  contractAddress,
  standard,
  ownerAddress,
  expiringAt,
}) => {
  const handleOpenExplorer = useCallback(() => {
    openDAppBrowser(
      config.get('NFTOnExplorerUrl', tk.wallet.isTestnet).replace('%s', contractAddress),
    );
  }, [contractAddress]);

  const handlePress = useCallback(
    (item) => () => {
      Clipboard.setString(item.copyableValue || item.value);
      Toast.success(t('copied'));
    },
    [t],
  );

  const parsedOwnerAddress = Address.parse(ownerAddress, {
    bounceable: !getFlag('address_style_nobounce'),
  });

  const items = useMemo(() => {
    let result: { label: string; value: string; copyableValue?: string }[] = [];

    result.push({
      label: t('nft_owner_address'),
      value: ownerAddress ? parsedOwnerAddress.toShort() : '...',
      copyableValue: parsedOwnerAddress.toFriendly(),
    });

    if (expiringAt && expiringAt > 0) {
      result.push({
        label: t('dns_expiration_date'),
        value: format(expiringAt, 'dd MMM yyyy', { locale: getLocale() }),
      });
    }

    result.push({
      label: t('nft_contract_address'),
      value: Address.parse(contractAddress).toShort(),
      copyableValue: contractAddress,
    });

    if (tokenId) {
      result.push({
        label: t('nft_token_id'),
        value: tokenId.toString(),
      });
    }

    if (standard) {
      result.push({
        label: t('nft_standard'),
        value: standard,
      });
    }

    if (chain) {
      result.push({
        label: t('nft_chain'),
        value: chain,
      });
    }

    return result;
  }, [tokenId, chain, contractAddress, standard, ownerAddress, expiringAt]);

  return (
    <S.Container>
      <S.TitleWrapper>
        <Text variant="h3">{t('nft_details')}</Text>
        <S.OpenInExplorerButton onPress={handleOpenExplorer}>
          <Text variant="label1" color="accentPrimary">
            {t('nft_view_in_explorer')}
          </Text>
        </S.OpenInExplorerButton>
      </S.TitleWrapper>
      <S.Table>
        {items.map((item, i) => [
          i > 0 && <Separator key={'sep_' + item.label} />,
          <Highlight key={item.label} onPress={handlePress(item)}>
            <S.Item>
              <S.ItemLabelWrapper>
                <Text variant="body1" color="foregroundSecondary">
                  {item.label}
                </Text>
              </S.ItemLabelWrapper>
              <S.ItemValue>{item.value}</S.ItemValue>
            </S.Item>
          </Highlight>,
        ])}
      </S.Table>
    </S.Container>
  );
};
