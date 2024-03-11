import { useNavigation, SheetActions } from '@tonkeeper/router';
import { Modal } from '@tonkeeper/uikit';
import { push } from '$navigation/imperative';
import { t } from '$translation';
import { Icon, List, Spacer, Text, TransitionOpacity } from '$uikit';
import { memo, useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as S from '../../../core/ModalContainer/NFTOperations/NFTOperations.styles';
import { useExpiringDomains } from '$store/zustand/domains/useExpiringDomains';
import { formatter } from '$utils/formatter';
import { useFiatValue } from '$hooks/useFiatValue';
import { CryptoCurrencies, Decimals } from '$shared/constants';
import { copyText } from '$hooks/useCopyText';
import { useUnlockVault } from '$core/ModalContainer/NFTOperations/useUnlockVault';
import { RenewAllProgressButton } from './RenewAllProgressButton';
import { Base64, delay, triggerNotificationSuccess } from '$utils';
import { debugLog } from '$utils/debugLog';
import { Toast } from '$store/zustand/toast';
import { Ton } from '$libs/Ton';
import TonWeb from 'tonweb';
import { useSelector } from 'react-redux';
import {
  checkIsInsufficient,
  openInsufficientFundsModal,
} from '$core/ModalContainer/InsufficientFunds/InsufficientFunds';
import BigNumber from 'bignumber.js';
import { tk } from '$wallet';
import { Address } from '@tonkeeper/core';
import { walletWalletSelector } from '$store/wallet';

enum States {
  INITIAL,
  PROGRESS,
  SUCCESS,
  ERROR,
}

export const СonfirmRenewAllDomains = memo((props) => {
  const [state, setState] = useState(States.INITIAL);
  const nav = useNavigation();
  const domains = useExpiringDomains((state) => state.items);
  const remove = useExpiringDomains((state) => state.actions.remove);
  const unlock = useUnlockVault();
  const [current, setCurrent] = useState(0);
  const wallet = useSelector(walletWalletSelector)!;

  const [count] = useState(domains.length);
  const [amount] = useState(0.02 * count);

  const fiatValue = useFiatValue(
    CryptoCurrencies.Ton,
    String(amount),
    Decimals[CryptoCurrencies.Ton],
  );

  const handleConfirm = useCallback(async () => {
    const amount = Ton.toNano('0.02');
    const totalAmount = new BigNumber(amount)
      .multipliedBy(new BigNumber(domains.length))
      .toString();
    const checkResult = await checkIsInsufficient(totalAmount, tk.wallet);
    if (checkResult.insufficient) {
      return openInsufficientFundsModal({ totalAmount, balance: checkResult.balance });
    }

    const unlocked = await unlock();
    const secretKey = await unlocked.getTonPrivateKey();
    try {
      setState(States.PROGRESS);
      const divider = 4;
      for (let i = 0; i < Math.ceil(domains.length / divider); i++) {
        const tonWallet = wallet.vault.tonWallet;
        const seqno = await wallet.ton.getSeqno(await wallet.ton.getAddress());
        const signingMessage = (tonWallet as any).createSigningMessage(seqno);

        const part = domains.slice(i * divider, i * divider + divider);
        for (let iPart = 0; iPart < part.length; iPart++) {
          const index = i * divider + iPart;
          const domain = domains[index];
          setCurrent(index + 1);

          const payload = new TonWeb.boc.Cell();
          payload.bits.writeUint(0x4eb1f0f9, 32);
          payload.bits.writeUint(0, 64);
          payload.bits.writeUint(0, 256);

          const order = TonWeb.Contract.createCommonMsgInfo(
            TonWeb.Contract.createInternalMessageHeader(
              new Address(domain.dns_item.address).toRaw({ bounceable: true }),
              amount,
            ),
            undefined,
            payload,
          );

          signingMessage.bits.writeUint8(3);
          signingMessage.refs.push(order);
        }

        const tx = TonWeb.Contract.createMethod(
          tonWallet.provider,
          (tonWallet as any).createExternalMessage(
            signingMessage,
            secretKey,
            seqno,
            !secretKey,
          ),
        );

        const queryMsg = await tx.getQuery();
        const boc = Base64.encodeBytes(await queryMsg.toBoc(false));
        await tk.wallet.tonapi.blockchain.sendBlockchainMessage(
          { boc },
          { format: 'text' },
        );
        tk.wallet.activityList.reload();

        await delay(15000);

        for (let iPart = 0; iPart < part.length; iPart++) {
          const index = i * divider + iPart;
          const domain = domains[index];
          remove(domain.dns_item.address);
        }
      }

      setState(States.SUCCESS);
      triggerNotificationSuccess();
      await delay(1750);

      nav.goBack();
      Toast.show(t('domains_renewed'));
    } catch (err) {
      debugLog(err);
      setState(States.ERROR);
    }
  }, [setCurrent]);

  const fiatAmount = `≈ ${fiatValue.fiat}`;
  const formattedAmount = formatter.format(amount, {
    currency: 'TON',
    currencySeparator: 'wide',
  });

  return (
    <Modal>
      <Modal.Header title={t('confirm_renew_all_domains_title')} />
      <Modal.Content>
        <List>
          <List.Item
            onPress={() => copyText(formattedAmount)}
            titleStyle={styles.listItemTitle}
            title={
              <Text variant="body1" color="textSecondary">
                {t('txActions.amount')}
              </Text>
            }
            value={formattedAmount}
            subvalue={fiatAmount}
          />
          <List.Item
            onPress={() => copyText(t('dns_addresses', { count }))}
            titleStyle={styles.listItemTitle}
            title={
              <Text variant="body1" color="textSecondary">
                {t('txActions.signRaw.recipient')}
              </Text>
            }
            value={t('dns_addresses', { count })}
          />
        </List>
      </Modal.Content>
      <Modal.Footer>
        <View style={S.styles.footer}>
          <TransitionOpacity
            style={S.styles.transitionContainer}
            isVisible={state === States.INITIAL}
            entranceAnimation={false}
          >
            <View style={S.styles.footerButtons}>
              <S.ActionButton mode="secondary" onPress={() => nav.goBack()}>
                {t('cancel')}
              </S.ActionButton>
              <Spacer x={16} />
              <S.ActionButton onPress={() => handleConfirm()}>
                {t('nft_confirm_operation')}
              </S.ActionButton>
            </View>
          </TransitionOpacity>
          <TransitionOpacity
            style={S.styles.transitionContainer}
            isVisible={state === States.PROGRESS}
            entranceAnimation={false}
          >
            <View style={styles.footer}>
              <RenewAllProgressButton total={count} current={current} />
            </View>
          </TransitionOpacity>
          <TransitionOpacity
            style={S.styles.transitionContainer}
            isVisible={state === States.SUCCESS}
          >
            <View style={S.styles.center}>
              <View style={S.styles.iconContainer}>
                <Icon name="ic-checkmark-circle-32" color="accentPositive" />
              </View>
              <Text variant="label2" color="accentPositive">
                {t('nft_operation_success')}
              </Text>
            </View>
          </TransitionOpacity>
          <TransitionOpacity
            style={S.styles.transitionContainer}
            isVisible={state === States.ERROR}
          >
            <View style={S.styles.center}>
              <View style={S.styles.iconContainer}>
                <Icon color="accentNegative" name="ic-exclamationmark-circle-32" />
              </View>
              <Text
                color="accentNegative"
                textAlign="center"
                variant="label2"
                numberOfLines={2}
              >
                {t('error_occurred')}
              </Text>
            </View>
          </TransitionOpacity>
        </View>
      </Modal.Footer>
    </Modal>
  );
});

export function openСonfirmRenewAllDomains() {
  push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: СonfirmRenewAllDomains,
    params: {},
    path: 'ConfirmRenewAll',
  });
}

const styles = StyleSheet.create({
  listItemTitle: {
    alignSelf: 'flex-start',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});
