import React, { memo, useCallback, useMemo } from 'react';
import { t } from '$translation';
import { Modal } from '$libs/navigation';
import { openExploreTab, push } from '$navigation';
import { SheetActions } from '$libs/navigation/components/Modal/Sheet/SheetsProvider';
import { Button, Icon, Text } from '$uikit';
import * as S from './InsufficientFunds.style';
import { useNavigation } from '$libs/navigation';
import { debugLog, delay, formatAmountAndLocalize, fromNano, truncateDecimal } from '$utils';
import BigNumber from 'bignumber.js';
import { CryptoCurrencies, Decimals } from '$shared/constants';
import { Ton } from '$libs/Ton';
import { Tonapi } from '$libs/Tonapi';
import { store } from '$store';
import { formatter } from '$utils/formatter';

export interface InsufficientFundsParams {
    /**
     * Total transaction amount (in nanotons). Required to render description
     */
    totalAmount: string | number;
    /**
     * Current wallet balance (in nanotons). Required to render description
     */
    balance: string | number;
    /**
     * Token's decimals
     */
    decimals?: number;
     /**
     * Token's ticker
     */
     currency?: string;
}

export const InsufficientFundsModal = memo<InsufficientFundsParams>(
  (props) => {
    const { 
      totalAmount,
      balance,
      currency = 'TON',
      decimals = 9,
    } = props;
    const nav = useNavigation();
    const formattedAmount = useMemo(() => formatter.format(fromNano(totalAmount, decimals), { decimals }), [totalAmount, decimals]);
    const formattedBalance = useMemo(() => formatter.format(fromNano(balance, decimals), { decimals }), [totalAmount, decimals]);

    const handleOpenRechargeWallet = useCallback(async () => {
        nav.goBack();
        await delay(550);
        nav.openModal('Exchange');
    }, []);

    const handleOpenDappBrowser = useCallback(async () => {
        nav.goBack();
        await delay(550);
        openExploreTab('defi');
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
                    currency,
                })}
                {currency === 'TON' && (
                  t('txActions.signRaw.insufficientFunds.withFees')
                )}
                {t('txActions.signRaw.insufficientFunds.yourBalance', {
                    balance: formattedBalance,
                    currency,
                })}
            </Text>
          </S.Wrap>
        </Modal.Content>
        <Modal.Footer>
          <S.FooterWrap>
              <Button
                style={{ marginBottom: 16 }}
                mode="secondary"
                onPress={currency === 'TON' ? handleOpenRechargeWallet : handleOpenDappBrowser}
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
