import React, { useCallback, useMemo } from 'react';
import * as S from './Details.style';
import { DetailsProps } from './Details.interface';
import { useTranslator } from '$hooks';
import { Highlight, Separator, Text } from '$uikit';
import Clipboard from '@react-native-community/clipboard';
import { toastActions } from '$store/toast';
import { useDispatch } from 'react-redux';
import { maskifyTonAddress } from '$utils';
import { getServerConfig } from '$shared/constants';
import { openDAppBrowser } from '$navigation';

export const Details: React.FC<DetailsProps> = ({
  tokenId,
  chain,
  contractAddress,
  standard,
  ownerAddress,
}) => {
  const dispatch = useDispatch();
  const t = useTranslator();

  const handleOpenExplorer = useCallback(() => {
    openDAppBrowser(getServerConfig('NFTOnExplorerUrl').replace('%s', contractAddress));
  }, [contractAddress]);

  const handlePress = useCallback(
    (item) => () => {
      Clipboard.setString(item.copyableValue || item.value);
      dispatch(toastActions.success(t('copied')));
    },
    [dispatch, t],
  );

  const items = useMemo(() => {
    let result: { label: string; value: string; copyableValue?: string }[] = [];

    result.push({
      label: t('nft_owner_address'),
      value: maskifyTonAddress(ownerAddress),
      copyableValue: ownerAddress,
    });

    result.push({
      label: t('nft_contract_address'),
      value: maskifyTonAddress(contractAddress),
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
  }, [t, tokenId, chain, contractAddress, standard, ownerAddress]);

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
