import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Button,
  HeaderSwitch,
  Icon,
  IconNames,
  KeyboardSpacer,
  List,
  Radio,
  Screen,
  Spacer,
  Steezy,
  Toast,
  TouchableOpacity,
  View,
} from '@tonkeeper/uikit';
import { AddressInput } from '$core/Send/steps/AddressStep/components';
import { SendAmount, SendRecipient } from '$core/Send/Send.interface';
import { AmountInput } from '$shared/components';
import { TextInput } from 'react-native-gesture-handler';
import { asyncDebounce, isTransferOp, parseLocaleNumber, parseTonLink } from '$utils';
import { Address, AmountFormatter, ContractService, delay } from '@tonkeeper/core';
import TonWeb from 'tonweb';
import { formatter } from '$utils/formatter';
import { Tonapi } from '$libs/Tonapi';
import BigNumber from 'bignumber.js';
import { config } from '$config';
import { tk } from '$wallet';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { openSignRawModal } from '$core/ModalContainer/NFTOperations/Modals/SignRawModal';
import { RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '$navigation/AppStack';
import { AppStackRouteNames } from '$navigation';
import { useBatteryRechargeMethods } from '@tonkeeper/shared/query/hooks';
import { useRechargeMethod } from '$core/BatterySend/hooks/useRechargeMethod';
import { beginCell } from '@ton/core';
import { useExternalState } from '@tonkeeper/shared/hooks/useExternalState';
import { useNavigation } from '@tonkeeper/router';
import { openSelectRechargeMethodModal } from '@tonkeeper/shared/modals/SelectRechargeMethodModal';
import { RechargeMethodsTypeEnum } from '@tonkeeper/core/src/BatteryAPI';
import { compareAddresses } from '$utils/address';
import { AnimatedScrollView } from 'react-native-reanimated/lib/typescript/reanimated2/component/ScrollView';
import { BatteryPackItem } from '$core/BatterySend/components';
import { t } from '@tonkeeper/shared/i18n';
import { Keyboard, Platform } from 'react-native';

let dnsAbortController: null | AbortController = null;

export interface BatterySendProps {
  route: RouteProp<AppStackParamList, AppStackRouteNames.BatterySend>;
}

export const BatterySend: React.FC<BatterySendProps> = ({ route }) => {
  const navigation = useNavigation();

  const packs: { icon: IconNames; key: string; tonAmount: string }[] = useMemo(
    () => [
      {
        icon: 'ic-battery-100-44',
        key: 'large',
        tonAmount: new BigNumber(config.get('batteryMeanFees'))
          .multipliedBy(400)
          .toString(),
      },
      {
        icon: 'ic-battery-50-44',
        key: 'medium',
        tonAmount: new BigNumber(config.get('batteryMeanFees'))
          .multipliedBy(250)
          .toString(),
      },
      {
        icon: 'ic-battery-25-44',
        key: 'small',
        tonAmount: new BigNumber(config.get('batteryMeanFees'))
          .multipliedBy(150)
          .toString(),
      },
    ],
    [],
  );

  const { recipient: initialRecipientAddress, jettonMaster: initialJettonMaster } =
    route.params;
  const [recipient, setRecipient] = useState<SendRecipient | null>(
    initialRecipientAddress
      ? { address: initialRecipientAddress, blockchain: 'ton' }
      : null,
  );
  const { methods } = useBatteryRechargeMethods();
  const textInputRef = useRef<TextInput>(null);
  const [dnsLoading, setDnsLoading] = useState(false);
  const [isManualAmountInput, setIsManualAmountInput] = useState(false);

  const shouldMinusReservedAmount =
    useExternalState(tk.wallet.battery.state, (state) => state.reservedBalance) === '0' ||
    !initialRecipientAddress;

  const [selectedJettonMaster, setSelectedJettonMaster] = useState<string | undefined>(
    initialJettonMaster,
  );

  const selectedMethod = useMemo(() => {
    if (selectedJettonMaster === undefined) {
      return methods.find((method) => method.type === RechargeMethodsTypeEnum.Ton)!;
    }
    return methods.find((method) => method.jetton_master === selectedJettonMaster)!;
  }, [methods, selectedJettonMaster]);
  const rechargeMethod = useRechargeMethod(selectedMethod);

  const [amount, setAmount] = useState<SendAmount>({
    value: formatter.format('0', {
      decimals: rechargeMethod.decimals,
    }),
    all: false,
  });

  const handleContinue = useCallback(async () => {
    Keyboard.dismiss();
    const parsedAmount = parseLocaleNumber(amount.value);

    if (BigNumber(parsedAmount).isGreaterThan(rechargeMethod.maxInputAmount)) {
      return Toast.fail(
        t('battery.max_input_amount', {
          amount: formatter.format(rechargeMethod.maxInputAmount, {
            decimals: 0,
            currency: rechargeMethod.symbol,
            forceRespectDecimalPlaces: true,
          }),
        }),
      );
    }

    const commentCell = beginCell()
      .storeUint(0, 32)
      .storeStringTail(recipient?.address ?? '')
      .endCell();

    if (rechargeMethod.isTon) {
      return await openSignRawModal(
        {
          messages: [
            {
              amount: AmountFormatter.toNano(parsedAmount, rechargeMethod.decimals),
              address: tk.wallet.battery.fundReceiver!,
              payload: commentCell.toBoc().toString('base64'),
            },
          ],
        },
        { experimentalWithBattery: true, forceRelayerUse: true },
      );
    }

    const jettonBalances = tk.wallet.jettons.state.data.jettonBalances;

    const relatedJettonBalance = jettonBalances.find((jettonBalance) =>
      compareAddresses(jettonBalance.jettonAddress, selectedJettonMaster),
    )!;

    const jettonTransferPayload = ContractService.createJettonTransferBody({
      jettonAmount: Number(AmountFormatter.toNano(parsedAmount, rechargeMethod.decimals)),
      receiverAddress: tk.wallet.battery.state.data.fundReceiver!,
      excessesAddress: tk.wallet.address.ton.raw,
      forwardBody: commentCell,
    });

    await openSignRawModal(
      {
        messages: [
          {
            amount: AmountFormatter.toNano('0.1', 9),
            address: relatedJettonBalance.walletAddress,
            payload: jettonTransferPayload.toBoc().toString('base64'),
          },
        ],
      },
      { experimentalWithBattery: true, forceRelayerUse: true },
    );
  }, [
    amount.value,
    rechargeMethod.decimals,
    rechargeMethod.isTon,
    recipient?.address,
    selectedJettonMaster,
  ]);

  const scrollRef = useRef<AnimatedScrollView>();

  const handleAmountInputFocus = async () => {
    await delay(250);
    scrollRef.current?.scrollToEnd();
  };

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
    async (value: string) => {
      setRecipient(null);

      if (value.length === 0) {
        setRecipient(null);

        return false;
      }

      try {
        const link = parseTonLink(value);

        if (link.match && isTransferOp(link.operation) && Address.isValid(link.address)) {
          if (link.query.bin) {
            return false;
          }

          value = link.address;
        }

        if (dnsAbortController) {
          dnsAbortController.abort();
          dnsAbortController = null;
          setDnsLoading(false);
        }

        if (Address.isValid(value)) {
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

  const renderFlashIcon = useCallback(
    (size: 'small' | 'large') => (
      <View
        style={[
          styles.flashIconContainer,
          {
            height: size === 'small' ? 24 : 36,
          },
        ]}
      >
        <Icon
          size={size === 'small' ? 16 : 36}
          name={'ic-flash-16'}
          color="iconSecondary"
        />
      </View>
    ),
    [],
  );

  const handleOpenSelectRechargeMethod = useCallback(() => {
    Keyboard.dismiss();
    openSelectRechargeMethodModal(
      selectedJettonMaster,
      (selected: string | undefined) => {
        setAmount({ value: '0', all: false });
        setIsManualAmountInput(false);
        setSelectedJettonMaster(selected);
      },
    );
  }, [selectedJettonMaster]);

  const localeAmount = parseLocaleNumber(amount.value);
  const isZero = new BigNumber(localeAmount).isZero();
  const isLessThanMinimum = shouldMinusReservedAmount
    ? new BigNumber(localeAmount).isLessThan(rechargeMethod.minInputAmount)
    : false;
  const isGreaterThanBalance = new BigNumber(localeAmount).isGreaterThan(
    rechargeMethod.balance,
  );

  return (
    <>
      <Screen>
        <Screen.Header
          titlePosition={'left'}
          hideBackButton
          rightContent={
            <View style={styles.headerRightContent}>
              <HeaderSwitch
                icon={rechargeMethod.iconSource}
                onPress={handleOpenSelectRechargeMethod}
                title={rechargeMethod.symbol}
              />
              <TouchableOpacity onPress={navigation.goBack}>
                <View style={styles.backButton}>
                  <Icon name={'ic-close-16'} />
                </View>
              </TouchableOpacity>
            </View>
          }
          isModal={Platform.OS === 'ios'}
          title={t('battery.recharge_by_crypto.title')}
        />
        <Screen.ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          withBottomInset
        >
          <Spacer y={8} />
          <View style={styles.contentContainer}>
            {!initialRecipientAddress ? (
              <AddressInput
                recipient={recipient}
                shouldFocus
                dnsLoading={dnsLoading}
                editable={true}
                updateRecipient={updateRecipient}
                onSubmit={() => null}
              />
            ) : null}
            <List style={styles.list} indent={false}>
              {packs.map((pack) => (
                <BatteryPackItem
                  key={pack.key}
                  tonAmount={pack.tonAmount}
                  icon={pack.icon}
                  rechargeMethod={rechargeMethod}
                  shouldMinusReservedAmount={shouldMinusReservedAmount}
                  inputtedAmount={amount.value}
                  onAmountSelect={handleAmountSelect}
                  isManualAmountInput={isManualAmountInput}
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
                title={t('battery.recharge_by_crypto.other.title')}
                subtitle={t('battery.recharge_by_crypto.other.subtitle')}
              />
            </List>
            {isManualAmountInput && (
              <Animated.View
                exiting={FadeOut.duration(120)}
                entering={FadeIn.duration(120)}
              >
                <View style={styles.inputContainer}>
                  <AmountInput
                    onFocus={handleAmountInputFocus}
                    roundFiatRate
                    customCurrency={renderFlashIcon}
                    innerRef={textInputRef}
                    fiatDecimals={0}
                    withMaxButton={false}
                    withCoinSelector={false}
                    disabled={false}
                    hideSwap={true}
                    calculateFiatFrom={
                      shouldMinusReservedAmount ? rechargeMethod.minInputAmount : '0'
                    }
                    minAmount={
                      shouldMinusReservedAmount
                        ? rechargeMethod.minInputAmount
                        : undefined
                    }
                    decimals={rechargeMethod.decimals}
                    balance={rechargeMethod.balance}
                    currencyTitle={rechargeMethod.symbol}
                    amount={amount}
                    fiatRate={new BigNumber(rechargeMethod.rate)
                      .div(config.get('batteryMeanFees'))
                      .toNumber()}
                    setAmount={setAmount}
                  />
                </View>
              </Animated.View>
            )}
            <Button
              disabled={
                !recipient?.address || isZero || isLessThanMinimum || isGreaterThanBalance
              }
              onPress={handleContinue}
              title={t('battery.recharge_by_crypto.continue')}
            />
          </View>
          <KeyboardSpacer />
        </Screen.ScrollView>
      </Screen>
    </>
  );
};

const styles = Steezy.create(({ colors }) => ({
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
  headerRightContent: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
    alignItems: 'center',
  },
  backButton: {
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.buttonSecondaryBackground,
  },
  flashIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
