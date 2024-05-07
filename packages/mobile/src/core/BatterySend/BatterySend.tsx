import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Button,
  Icon,
  List,
  Radio,
  Screen,
  Spacer,
  Steezy,
  View,
} from '@tonkeeper/uikit';
import { AddressInput } from '$core/Send/steps/AddressStep/components';
import { AccountWithPubKey, SendAmount, SendRecipient } from '$core/Send/Send.interface';
import { t } from '@tonkeeper/shared/i18n';
import { AmountInput } from '$shared/components';
import { TextInput } from 'react-native-gesture-handler';
import { RechargeMethod, RechargeMethodType } from '$core/BatterySend/types';
import { asyncDebounce } from '$utils';
import { Address, AmountFormatter, ContractService } from '@tonkeeper/core';
import TonWeb from 'tonweb';
import { formatter } from '$utils/formatter';
import { CryptoCurrencies, Decimals } from '$shared/constants';
import { Tonapi } from '$libs/Tonapi';
import { useTokenPrice } from '$hooks/useTokenPrice';
import BigNumber from 'bignumber.js';
import { config } from '$config';
import { tk } from '$wallet';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { openSignRawModal } from '$core/ModalContainer/NFTOperations/Modals/SignRawModal';

const packs = [
  {
    icon: 'ic-battery-100-44',
    key: 'large',
    tonAmount: 2,
  },
  {
    icon: 'ic-battery-50-44',
    key: 'medium',
    tonAmount: 1,
  },
  {
    icon: 'ic-battery-25-44',
    key: 'small',
    tonAmount: 0.3,
  },
];

const rechargeMethods: RechargeMethod[] = [
  {
    key: 'TON',
    type: RechargeMethodType.TON,
    title: 'TON',
    markup: 0.05,
    decimals: 9,
  },
  {
    key: '0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe',
    type: RechargeMethodType.JETTON,
    title: 'USD₮',
    markup: 0.1,
    decimals: 6,
  },
];

let dnsAbortController: null | AbortController = null;

export const BatterySend = () => {
  const [recipient, setRecipient] = useState<SendRecipient | null>(null);
  const textInputRef = useRef<TextInput>(null);
  const rechargeMethod = rechargeMethods[0];
  const [dnsLoading, setDnsLoading] = useState(false);
  const [isManualAmountInput, setIsManualAmountInput] = useState(false);

  const tonPriceInUsd = useTokenPrice(CryptoCurrencies.Ton).usd;
  const [recipientAccountInfo, setRecipientAccountInfo] =
    useState<AccountWithPubKey | null>(null);

  const [amount, setAmount] = useState<SendAmount>({
    value: formatter.format('0', {
      decimals: rechargeMethod.decimals,
    }),
    all: false,
  });

  const handleContinue = useCallback(() => {
    await openSignRawModal(
      {
        messages: [
          {
            amount: AmountFormatter.toNano(amount.value, rechargeMethod.decimals),
            address: tk.wallet.battery.state.data.fundReceiver!,
            payload: new TextEncoder().encode(recipient?.address),
          },
        ],
      },
      {},
    );
  }, []);

  const handleAmountSelect = useCallback(
    (selectedAmount: undefined | number) => () => {
      if (!selectedAmount) {
        setAmount({ value: '0', all: false });
        setIsManualAmountInput(true);
      } else {
        setAmount({
          value: formatter.format(selectedAmount, { decimals: rechargeMethod.decimals }),
          all: false,
        });
        setIsManualAmountInput(false);
      }
    },
    [rechargeMethod.decimals],
  );

  const getAddressByDomain = useMemo(
    () =>
      asyncDebounce(async (value: string, signal: AbortSignal) => {
        try {
          const domain = value.toLowerCase();
          const resolvedDomain = await Tonapi.resolveDns(domain, signal);

          if (resolvedDomain === 'aborted') {
            return 'aborted';
          } else if (resolvedDomain?.wallet?.address) {
            const isWallet = !!resolvedDomain?.wallet?.account?.is_wallet;
            return new TonWeb.Address(resolvedDomain.wallet.address).toString(
              true,
              true,
              !isWallet,
            ) as string;
          }

          return null;
        } catch (e) {
          console.log('err', e);

          return null;
        }
      }, 1000),
    [],
  );

  const updateRecipient = useCallback(
    async (value: string, accountInfo?: Partial<AccountWithPubKey>) => {
      setRecipientAccountInfo(null);

      if (value.length === 0) {
        setRecipient(null);

        return false;
      }

      try {
        if (dnsAbortController) {
          dnsAbortController.abort();
          dnsAbortController = null;
          setDnsLoading(false);
        }

        if (Address.isValid(value)) {
          if (accountInfo) {
            setRecipientAccountInfo(accountInfo as AccountWithPubKey);
          }

          setRecipient({ blockchain: 'ton', address: value });

          return true;
        }

        const domain = value.toLowerCase();

        if (!TonWeb.Address.isValid(domain)) {
          setDnsLoading(true);
          const abortController = new AbortController();
          dnsAbortController = abortController;

          const zone = domain.indexOf('.') === -1 ? '.ton' : '';
          const resolvedDomain = await getAddressByDomain(
            domain + zone,
            abortController.signal,
          );

          if (resolvedDomain === 'aborted') {
            setDnsLoading(false);
            dnsAbortController = null;
            return true;
          } else if (resolvedDomain) {
            setRecipient({ address: resolvedDomain, domain, blockchain: 'ton' });
            setDnsLoading(false);
            dnsAbortController = null;
            return true;
          } else {
            setDnsLoading(false);
            dnsAbortController = null;
          }
        }

        setRecipient(null);

        return false;
      } catch (e) {
        return false;
      }
    },
    [getAddressByDomain],
  );

  return (
    <Screen>
      <Screen.Header
        backButtonPosition="right"
        backButtonIcon={'close'}
        isModal
        title={'Recharge'}
      />
      <Screen.ScrollView>
        <Spacer y={8} />
        <View style={styles.contentContainer}>
          <AddressInput
            recipient={recipient}
            shouldFocus
            dnsLoading={dnsLoading}
            editable={true}
            updateRecipient={updateRecipient}
            onSubmit={() => null}
          />
          <List style={styles.list} indent={false}>
            {packs.map((pack) => (
              <List.Item
                onPress={handleAmountSelect(pack.tonAmount)}
                rightContent={<Radio onSelect={() => null} isSelected={true} />}
                key={pack.key}
                title={t('battery.description.other', {
                  count: new BigNumber(pack.tonAmount)
                    .div(config.get('batteryMeanFees'))
                    .multipliedBy(1 - rechargeMethod.markup)
                    .decimalPlaces(0)
                    .toNumber(),
                })}
                subtitle={`${formatter.format(pack.tonAmount.toString(), {
                  currency: rechargeMethod.title,
                })} · 0 $`}
                leftContent={
                  <Icon
                    style={styles.listItemIcon.static}
                    imageStyle={styles.listItemIcon.static}
                    colorless
                    name={pack.icon}
                  />
                }
              />
            ))}
            <List.Item
              onPress={handleAmountSelect(undefined)}
              leftContent={
                <Icon
                  style={styles.listItemIcon.static}
                  imageStyle={styles.listItemIcon.static}
                  colorless
                  name={'ic-battery-flash-44'}
                />
              }
              rightContent={
                <Radio onSelect={() => null} isSelected={isManualAmountInput} />
              }
              title={'Other'}
              subtitle={'Enter amount manually'}
            />
          </List>
          {isManualAmountInput && (
            <Animated.View
              exiting={FadeOut.duration(120)}
              entering={FadeIn.duration(120)}
            >
              <View style={styles.inputContainer}>
                <AmountInput
                  roundFiatRate
                  customCurrency={'⚡'}
                  innerRef={textInputRef}
                  fiatDecimals={0}
                  withCoinSelector={true}
                  disabled={false}
                  hideSwap={true}
                  decimals={rechargeMethod.decimals}
                  balance={tk.wallet.balances.state.data.ton}
                  currencyTitle={rechargeMethod.title}
                  amount={amount}
                  fiatRate={new BigNumber(1)
                    .div(config.get('batteryMeanFees'))
                    .toNumber()}
                  setAmount={setAmount}
                />
              </View>
            </Animated.View>
          )}
          <Button title="Continue" />
        </View>
      </Screen.ScrollView>
    </Screen>
  );
};

const styles = Steezy.create({
  contentContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  listItemIcon: {
    width: 26,
    height: 44,
  },
  list: {
    marginBottom: 0,
  },
  currencyIcon: {
    paddingRight: -4,
  },
  inputContainer: {
    height: 240,
  },
});
