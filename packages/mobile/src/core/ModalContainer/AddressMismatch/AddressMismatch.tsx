import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { Modal } from '@tonkeeper/uikit';

import { Button, Icon, Text } from '$uikit';
import * as S from './AddressMismatch.style';
import { useWallet } from '$hooks/useWallet';
import { useNavigation, SheetActions } from '@tonkeeper/router';
import { delay } from '$utils';
import { walletActions } from '$store/wallet';
import { useDispatch } from 'react-redux';
import { SelectableVersion } from '$shared/constants';
import { push } from '$navigation/imperative';
import { Address } from '@tonkeeper/shared/Address';
import { useNewWallet } from '@tonkeeper/shared/hooks/useWallet';

export const AddressMismatchModal = memo<{ source: string; onSwitchAddress: () => void }>(
  (props) => {
    const allAddresses = useNewWallet((state) => state.ton.allAddresses);
    const nav = useNavigation();
    const dispatch = useDispatch();

    const foundVersion = useMemo(() => {
      if (!allAddresses) {
        return false;
      }
      let found = Object.entries(allAddresses).find(([_, address]) =>
        Address.compare(address.raw, props.source),
      );
      if (!found) {
        return false;
      }
      return found[0];
    }, [allAddresses, props.source]);

    const handleCloseModal = useCallback(() => nav.goBack(), [nav]);
    const handleSwitchVersion = useCallback(async () => {
      if (!foundVersion) {
        return;
      }
      nav.goBack();
      dispatch(walletActions.switchVersion(foundVersion as SelectableVersion));
      await delay(100);
      props.onSwitchAddress();
    }, [dispatch, foundVersion, nav, props]);

    // Wait to get all versions
    if (!allAddresses) {
      return null;
    }

    return (
      <Modal>
        <Modal.Header />
        <Modal.Content>
          <S.Wrap>
            <Icon style={{ marginBottom: 12 }} name={'ic-exclamationmark-circle-84'} />
            <Text textAlign="center" variant="h2" style={{ marginBottom: 4 }}>
              {foundVersion
                ? t('txActions.signRaw.addressMismatch.wrongVersion.title')
                : t('txActions.signRaw.addressMismatch.wrongWallet.title')}
            </Text>
            <Text variant="body1" color="foregroundSecondary" textAlign="center">
              {foundVersion
                ? t('txActions.signRaw.addressMismatch.wrongVersion.description', {
                    version: foundVersion,
                  })
                : t('txActions.signRaw.addressMismatch.wrongWallet.description', {
                    address: Address.parse(props.source).toShort(),
                  })}
            </Text>
          </S.Wrap>
        </Modal.Content>
        <Modal.Footer>
          <S.FooterWrap>
            {foundVersion ? (
              <Button
                style={{ marginBottom: 16 }}
                mode="primary"
                onPress={handleSwitchVersion}
              >
                {t('txActions.signRaw.addressMismatch.wrongVersion.switch')}
              </Button>
            ) : null}
            <Button mode="secondary" onPress={handleCloseModal}>
              {foundVersion
                ? t('txActions.signRaw.addressMismatch.wrongVersion.close')
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
