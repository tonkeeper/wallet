import React, { memo, useCallback } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { Modal } from '@tonkeeper/uikit';

import { Button, Icon, Text } from '$uikit';
import * as S from './AddressMismatch.style';
import { useNavigation, SheetActions } from '@tonkeeper/router';
import { delay } from '$utils';
import { push } from '$navigation/imperative';
import { Address } from '@tonkeeper/shared/Address';

export const AddressMismatchModal = memo<{ source: string; onSwitchAddress: () => void }>(
  (props) => {
    const nav = useNavigation();

    // MULTIWALLET TODO
    const foundVersion = false;

    const handleCloseModal = useCallback(() => nav.goBack(), [nav]);
    const handleSwitchWallet = useCallback(async () => {
      if (!foundVersion) {
        return;
      }
      nav.goBack();
      // tk.updateWallet({ version: foundVersion });
      await delay(100);
      props.onSwitchAddress();
    }, [foundVersion, nav, props]);

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
                onPress={handleSwitchWallet}
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
