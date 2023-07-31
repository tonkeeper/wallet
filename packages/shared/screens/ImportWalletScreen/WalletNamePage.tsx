import {
  Button,
  Input,
  KeyboardSpacer,
  Spacer,
  Steezy,
  Text,
  View,
} from '@tonkeeper/uikit';
import { memo, useState } from 'react';
import { ScrollView } from 'react-native';

interface WalletNamePageProps {
  onNext: (opts: { name: string }) => void;
}

export const WalletNamePage = memo<WalletNamePageProps>((props) => {
  const { onNext } = props;
  const [name, setName] = useState('');

  return (
    <ScrollView
      style={styles.container.static}
      keyboardDismissMode="interactive"
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
        label="Wallet name"
        onChangeText={(name) => setName(name)}
        keyboardType="ascii-capable"
        textContentType="none"
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
        autoFocusDelay={500}
        autoFocus
      />
      <View style={{ flex: 1 }} />

      <View style={styles.buttonContainer}>
        <Button onPress={() => onNext({ name })} title="Continue" />
      </View>
      <KeyboardSpacer />
    </ScrollView>
  );
});

const styles = Steezy.create({
  container: {
    paddingTop: 24,
    paddingHorizontal: 32,
    flex: 1,
  },
  info: {
    paddingBottom: 32,
  },
  buttonContainer: {
    paddingTop: 16,
    paddingBottom: 32 + 32,
  },
});
