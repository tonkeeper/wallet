import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { t } from '$translation';
import { Modal } from '$libs/navigation';
import { push } from '$navigation';
import { SheetActions } from '$libs/navigation/components/Modal/Sheet/SheetsProvider';
import { Button, Icon, Text } from '$uikit';
import * as S from './AddressMismatch.style';
import { useWallet } from '$hooks';
import { useNavigation } from '$libs/navigation';
import { Ton } from '$libs/Ton';
import { compareAddresses, delay } from '$utils';
import { walletActions } from '$store/wallet';
import { useDispatch } from 'react-redux';
import { SelectableVersion } from '$shared/constants';

export const AddressMismatchModal = memo<{ source: string; onSwitchAddress: () => void }>(
  (props) => {
    const [allVersions, setAllVersions] = useState<null | { [key: string]: string }>(
      null,
    );
    const wallet = useWallet();
    const nav = useNavigation();
    const dispatch = useDispatch();

    useEffect(() => {
      wallet.ton.getAllAddresses().then((allAddresses) => setAllVersions(allAddresses));
    }, [wallet.ton]);

    const foundVersion = useMemo(() => {
      if (!allVersions) {
        return false;
      }
      let found = Object.entries(allVersions).find(([_, address]) =>
        compareAddresses(address, props.source),
      );
      if (!found) {
        return false;
      }
      return found[0];
    }, [allVersions, props.source]);

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
    if (!allVersions) {
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
                    address: Ton.formatAddress(props.source, { cut: true }),
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
