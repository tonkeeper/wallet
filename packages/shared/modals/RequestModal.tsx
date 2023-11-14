import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { AmountInput, AmountInputRef } from '@tonkeeper/mobile/src/shared/components';
import { CoinDropdown } from '@tonkeeper/mobile/src/core/Send/steps/AmountStep/CoinDropdown';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { walletActions, walletSelector } from '@tonkeeper/mobile/src/store/wallet';
import { useSelector } from 'react-redux';
import { t } from '../i18n';
import {
  useReanimatedKeyboardHeight,
  Button,
  Modal,
  Spacer,
  Steezy,
  View,
} from '@tonkeeper/uikit';
import { useNavigation } from '@tonkeeper/router';

export const RequestModal = memo(() => {
  const nav = useNavigation();
  const [isPreparing, setIsPreparing] = useState(false);
  const keyboard = useReanimatedKeyboardHeight();
  const textInputRef = useRef<AmountInputRef>(null);
  const [amount, setAmount] = useState('0');
  const safeArea = useSafeAreaInsets();
  const isFirstRender = useRef(true);

  const onContinue = useCallback(() => {
    nav.navigate('ReceiveModal', { amount });
  }, [amount]);

  const { balances } = useSelector(walletSelector);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;

      // if (active) {
      const timeoutId = setTimeout(() => {
        textInputRef.current?.focus();
      }, 400);

      return () => clearTimeout(timeoutId);
    }
    // }

    // if (active) {
    textInputRef.current?.focus();
    return;
    // }

    const timeoutId = setTimeout(() => {
      textInputRef.current?.blur();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, []);

  const keyboardHeightStyle = useAnimatedStyle(() => ({
    marginBottom: keyboard.height.value,
  }));

  return (
    <Modal>
      <Modal.Header title="Amount" />
      <Modal.Content>
        <Animated.View
          style={[
            { paddingBottom: safeArea.bottom + 16 },
            styles.container.static,
            keyboardHeightStyle,
          ]}
        >
          <View style={styles.amountContainer}>
            <AmountInput
              innerRef={textInputRef}
              withCoinSelector={true}
              disabled={isPreparing}
              decimals={9}
              balance={balances['ton']}
              setAmount={({ value }) => {
                setAmount(value);
              }}
              currencyTitle={'TON'}
              amount={{
                value: amount,
                all: '0',
              }}
              fiatRate={0}
              hideMaxButton
            />
            {/* <View style={styles.coinContainer}>1
              <CoinDropdown
                currency="ton"
                currencyTitle="TON"
                onChangeCurrency={() => {}}
              />
            </View> */}
          </View>
          <Spacer y={40} />
          <Button
            // disabled={!isReadyToContinue}
            // loading={isPreparing}
            onPress={onContinue}
            title={t('continue')}
          />
        </Animated.View>
      </Modal.Content>
    </Modal>
  );
});

const styles = Steezy.create(({ safeArea }) => ({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  amountContainer: {
    flex: 1,
    position: 'relative',
  },
  coinContainer: {
    alignItems: 'center',
    position: 'absolute',
    zIndex: 1000,
    top: 16,
    left: 64,
    right: 64,
  },
}));
