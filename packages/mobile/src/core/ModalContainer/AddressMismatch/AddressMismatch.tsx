import React, { memo, useCallback, useMemo } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { Modal } from '@tonkeeper/uikit';

import { Button, Icon, Text } from '$uikit';
import * as S from './AddressMismatch.style';
import { useNavigation, SheetActions } from '@tonkeeper/router';
import { delay } from '$utils';
import { push } from '$navigation/imperative';
import { Address } from '@tonkeeper/shared/Address';
import { useWallets } from '@tonkeeper/shared/hooks';
import { tk } from '$wallet';

export const AddressMismatchModal = memo<{ source: string; onSwitchAddress: () => void }>(
  (props) => {
    const nav = useNavigation();
    const wallets = useWallets();

    const foundWallet = useMemo(() => {
      return wallets.find((wallet) => {
        return Address.compare(wallet.address.ton.raw, props.source);
      });
    }, [props.source, wallets]);

    const handleCloseModal = useCallback(() => nav.goBack(), [nav]);
    const handleSwitchWallet = useCallback(async () => {
      if (!foundWallet) {
        return;
      }
      nav.goBack();
      tk.switchWallet(foundWallet.identifier);
      await delay(100);
      props.onSwitchAddress();
    }, [foundWallet, nav, props]);

    return (
      <Modal>
        <Modal.Header />
        <Modal.Content>
          <S.Wrap>
            <Icon
              style={{ marginBottom: 12 }}
              name={'ic-exclamationmark-circle-84'}
              color="iconSecondary"
            />
            <Text textAlign="center" variant="h2" style={{ marginBottom: 4 }}>
              {foundWallet
                ? t('txActions.signRaw.addressMismatch.switchWallet.title', {
                    value: `${
                      foundWallet.config.emoji
                    } ${foundWallet.config.name.replaceAll(' ', ' ')}`,
                  })
                : t('txActions.signRaw.addressMismatch.wrongWallet.title')}
            </Text>
            <Text variant="body1" color="foregroundSecondary" textAlign="center">
              {foundWallet
                ? t('txActions.signRaw.addressMismatch.switchWallet.description', {
                    version: foundWallet,
                  })
                : t('txActions.signRaw.addressMismatch.wrongWallet.description', {
                    address: Address.parse(props.source).toShort(),
                  })}
            </Text>
          </S.Wrap>
        </Modal.Content>
        <Modal.Footer>
          <S.FooterWrap>
            {foundWallet ? (
              <Button
                style={{ marginBottom: 16 }}
                mode="primary"
                onPress={handleSwitchWallet}
              >
                {t('txActions.signRaw.addressMismatch.switchWallet.switch')}
              </Button>
            ) : null}
            <Button mode="secondary" onPress={handleCloseModal}>
              {foundWallet
                ? t('txActions.signRaw.addressMismatch.switchWallet.close')
                : t('txActions.signRaw.addressMismatch.wrongWallet.close')}
            </Button>
          </S.FooterWrap>
        </Modal.Footer>
      </Modal>
    );
  },
);

export const openAddressMismatchModal = async (
  onSwitchAddress: () => void,
  source: string,
) => {
  push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: AddressMismatchModal,
    path: 'AddressMismatch',
    params: { onSwitchAddress, source },
  });

  return true;
};
