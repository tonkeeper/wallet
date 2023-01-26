import React, { memo, useCallback, useMemo } from 'react';
import { t } from '$translation';
import { Modal } from '$libs/navigation';
import { push } from '$navigation';
import { SheetActions } from '$libs/navigation/components/Modal/Sheet/SheetsProvider';
import { Button, Icon, Text } from '$uikit';
import * as S from './InsufficientFunds.style';
import { useNavigation } from '$libs/navigation';
import { debugLog, delay, formatAmountAndLocalize, truncateDecimal } from '$utils';
import BigNumber from 'bignumber.js';
import { CryptoCurrencies, Decimals } from '$shared/constants';
import { Ton } from '$libs/Ton';
import { Tonapi } from '$libs/Tonapi';
import { store } from '$store';

export interface InsufficientFundsParams {
    /**
     * Total transaction amount (in nanotons). Required to render description
     */
    totalAmount: string | number;
    /**
     * Current wallet balance (in nanotons). Required to render description
     */
    balance: string | number;
}

export const InsufficientFundsModal = memo<InsufficientFundsParams>(
  (props) => {
    const nav = useNavigation();
    const formattedAmount = useMemo(() => truncateDecimal(new BigNumber(Ton.fromNano(props.totalAmount)).toString(), 2, false, true), [props.totalAmount]);
    const formattedBalance = useMemo(() => truncateDecimal(new BigNumber(Ton.fromNano(props.balance)).toString(), 2, false, true), [props.balance]);

    const handleOpenRechargeWallet = useCallback(async () => {
        nav.goBack();
        await delay(550);
        nav.openModal('Exchange');
    }, []);

    return (
      <Modal>
        <Modal.Header />
        <Modal.Content>
          <S.Wrap>
            <Icon style={{ marginBottom: 12 }} name={'ic-exclamationmark-circle-84'} />
            <Text textAlign="center" variant="h2" style={{ marginBottom: 4 }}>
              {t('txActions.signRaw.insufficientFunds.title')}
            </Text>
            <Text variant="body1" color="foregroundSecondary" textAlign="center">
                {t('txActions.signRaw.insufficientFunds.toBePaid', {
                    amount: formattedAmount,
                    balance: formattedBalance,
                    currency: 'TON',
                })}
            </Text>
          </S.Wrap>
        </Modal.Content>
        <Modal.Footer>
          <S.FooterWrap>
                <Button
                    style={{ marginBottom: 16 }}
                    mode="primary"
                    onPress={handleOpenRechargeWallet}
                >
                {t('txActions.signRaw.insufficientFunds.rechargeWallet')}
              </Button>
          </S.FooterWrap>
        </Modal.Footer>
      </Modal>
    );
  },
);

export async function checkIsInsufficient(amount: string | number) {
  try {
    const wallet = store.getState().wallet.wallet;
    const address = await wallet.ton.getAddress();
    const { balance } = await Tonapi.getWalletInfo(address);
    if (
      new BigNumber(amount).gt(new BigNumber(balance))
    ) {
        return { insufficient: true, balance };
      }
  } catch (e) {
    debugLog('[checkIsInsufficient]: error', e);
  }
  return { insufficient: false };
}

export const openInsufficientFundsModal = async (params: InsufficientFundsParams) => {
  push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: InsufficientFundsModal,
    path: 'InsufficientFunds',
    params,
  });

  return true;
};
