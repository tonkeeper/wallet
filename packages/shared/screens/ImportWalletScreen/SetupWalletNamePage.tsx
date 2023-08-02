import { Button, Input, InputRef, Spacer, Steezy, Text, View } from '@tonkeeper/uikit';
import { InputAccessoryView, ScrollView } from 'react-native';
import { memo, useEffect, useRef, useState } from 'react';

interface SetupWalletNamePageProps {
  onComplete: (name: string) => void;
  loading: boolean;
  shown: boolean;
}

export const SetupWalletNamePage = memo<SetupWalletNamePageProps>((props) => {
  const { onComplete, shown, loading } = props;
  const [name, setName] = useState('');
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
          Name your wallet
        </Text>
        <Spacer y={4} />
        <Text type="body1" color="textSecondary" textAlign="center">
          Wallet name is stored locally on your device. It will only be visible to you.
        </Text>
      </View>
      <Input
        ref={inputRef}
        inputAccessoryViewID="wallet_name"
        label="Wallet name"
        onChangeText={(name) => setName(name)}
        keyboardType="ascii-capable"
        textContentType="none"
        autoComplete="off"
        autoCorrect={false}
      />
      <InputAccessoryView nativeID="wallet_name">
        <View style={styles.buttonContainer}>
          <Button onPress={() => onComplete(name)} title="Continue" loading={loading} />
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
