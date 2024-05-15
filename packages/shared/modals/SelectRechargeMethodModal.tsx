import React, { memo, useCallback, useMemo } from 'react';
import { Icon, List, Modal, TonIcon } from '@tonkeeper/uikit';
import { t } from '../i18n';
import { navigation, SheetActions, useNavigation } from '@tonkeeper/router';
import { useExternalState } from '../hooks/useExternalState';
import { tk } from '@tonkeeper/mobile/src/wallet';
import { formatter } from '../formatter';
import { useBatteryRechargeMethods } from '../query/hooks';
import { useJettonBalances } from '@tonkeeper/mobile/src/hooks/useJettonBalances';
import { compareAddresses } from '@tonkeeper/mobile/src/utils/address';
import { Address } from '@tonkeeper/core';

export interface SelectRechargeMethodModalParams {
  selectedJettonMaster: string | undefined;
  onSelectJettonMaster: (selected: string | undefined) => void;
}

export const SelectRechargeMethodModal = memo<SelectRechargeMethodModalParams>(
  (props) => {
    const { goBack } = useNavigation();
    const balances = useExternalState(tk.wallet.balances.state);
    const { methods } = useBatteryRechargeMethods();
    const { enabled } = useJettonBalances();

    const filteredJettonBalances = useMemo(
      () =>
        enabled.filter(
          (jettonBalance) =>
            methods.findIndex((method) =>
              compareAddresses(method.jetton_master, jettonBalance.jettonAddress),
            ) !== -1,
        ),
      [],
    );

    const handleSelectJettonMaster = useCallback(
      (selected: string | undefined) => () => {
        props.onSelectJettonMaster(selected);
        goBack();
      },
      [],
    );

    return (
      <Modal>
        <Modal.Header title={t('battery.recharge_by_crypto.tokens')} />
        <Modal.Content safeArea>
          <List>
            {filteredJettonBalances.map((jettonBalance) => (
              <List.Item
                key={jettonBalance.jettonAddress}
                picture={jettonBalance.metadata.image}
                subtitle={formatter.format(jettonBalance.balance, {
                  currency: jettonBalance.metadata.symbol,
                })}
                onPress={handleSelectJettonMaster(
                  Address.parse(jettonBalance.jettonAddress).toRaw(),
                )}
                rightContent={
                  compareAddresses(
                    props.selectedJettonMaster,
                    jettonBalance.jettonAddress,
                  ) && <Icon color={'accentBlue'} name={'ic-donemark-outline-28'} />
                }
                title={jettonBalance.metadata.symbol}
              />
            ))}
            <List.Item
              leftContent={<TonIcon showDiamond />}
              title={'TON'}
              onPress={handleSelectJettonMaster(undefined)}
              rightContent={
                !props.selectedJettonMaster && (
                  <Icon color={'accentBlue'} name={'ic-donemark-outline-28'} />
                )
              }
              subtitle={formatter.format(balances.ton, { currency: 'TON' })}
            />
          </List>
        </Modal.Content>
      </Modal>
    );
  },
);

export function openSelectRechargeMethodModal(
  selectedJettonMaster: string | undefined,
  onSelectJettonMaster: (jettonMaster: string | undefined) => void,
) {
  navigation.push('SheetsProvider', {
    $$action: SheetActions.ADD,
    params: { selectedJettonMaster, onSelectJettonMaster },
    component: SelectRechargeMethodModal,
    path: '/select-recharge-method',
  });
}
