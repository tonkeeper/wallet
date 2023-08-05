import { Button, Input, InputRef, Spacer, Steezy, Text, View } from '@tonkeeper/uikit';
import { InputAccessoryView, ScrollView } from 'react-native';
import { memo, useEffect, useRef, useState } from 'react';

interface SetupWatchAddressPageProps {
  onButtonPress: (address: string) => void;
  shown: boolean;
}

export const SetupWatchAddressPage = memo<SetupWatchAddressPageProps>((props) => {
  const { onButtonPress, shown } = props;
  const [address, setAddress] = useState('');
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (shown) {
      inputRef.current?.focus();
    }
  }, [shown]);

  return (
    <ScrollView
      scrollEnabled={false}
      style={styles.container.static}
      keyboardDismissMode="none"
      keyboardShouldPersistTaps="always"
    >
      <View style={styles.info}>
        <Text type="h2" textAlign="center">
          Watch address
        </Text>
        <Spacer y={4} />
        <Text type="body1" color="textSecondary" textAlign="center">
          Monitor wallet activity without recovery phrase. You will be notified of any
          transactions from this wallet.
        </Text>
      </View>
      <Input
        ref={inputRef}
        inputAccessoryViewID="wallet_address"
        label="Address"
        onChangeText={(address) => setAddress(address)}
        keyboardType="ascii-capable"
        textContentType="none"
        autoComplete="off"
        autoCorrect={false}
        multiline
        withClearButton
        withPasteButton
        withScanButton
        onScanPress={() => {
          // TODO: add scanner
        }}
      />
      <InputAccessoryView nativeID="wallet_address">
        <View style={styles.buttonContainer}>
          <Button onPress={() => onButtonPress(address)} title="Continue" />
        </View>
      </InputAccessoryView>
    </ScrollView>
  );
});

const styles = Steezy.create(({ colors }) => ({
  container: {
    paddingTop: 24,
    paddingHorizontal: 32,
    flex: 1,
  },
  info: {
    paddingBottom: 32,
  },
  buttonContainer: {
    paddingTop: 28,
    paddingHorizontal: 32,
    paddingBottom: 28,
    backgroundColor: colors.backgroundPage,
  },
}));
