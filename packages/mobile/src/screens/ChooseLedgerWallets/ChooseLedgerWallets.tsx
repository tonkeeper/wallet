import {
  ImportWalletStackParamList,
  ImportWalletStackRouteNames,
} from '$navigation/ImportWalletStack/types';
import { Checkbox } from '$uikit';
import { ImportWalletInfo } from '$wallet/WalletTypes';
import { t } from '@tonkeeper/shared/i18n';
import {
  BlockingLoader,
  Button,
  List,
  Screen,
  Spacer,
  Steezy,
  Text,
  View,
  isAndroid,
} from '@tonkeeper/uikit';
import { FC, useCallback, useState } from 'react';
import { RouteProp } from '@react-navigation/native';
import { Address } from '@tonkeeper/shared/Address';
import { formatter } from '@tonkeeper/shared/formatter';

export const ChooseLedgerWallets: FC<{
  route: RouteProp<
    ImportWalletStackParamList,
    ImportWalletStackRouteNames.ChooseLedgerWallets
  >;
}> = (props) => {
  const { walletsInfo, onDone } = props.route.params;

  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);

  const toggleSelected = useCallback((info: ImportWalletInfo) => {
    setSelectedIndexes((s) =>
      s.includes(info.accountIndex!)
        ? s.filter((item) => item !== info.accountIndex!)
        : [...s, info.accountIndex!],
    );
  }, []);

  const handleContinue = useCallback(async () => {
    if (selectedIndexes.length === 0) {
      return;
    }

    try {
      setLoading(true);
      BlockingLoader.show();

      await onDone(
        walletsInfo.filter((info) => selectedIndexes.includes(info.accountIndex!)),
      );
    } catch {
    } finally {
      setLoading(false);
      BlockingLoader.hide();
    }
  }, [onDone, selectedIndexes, walletsInfo]);

  const tokensText = `, ${t('choose_wallets.tokens')}`;

  const addedText = ` · ${t('choose_wallets.already_added')}`;

  return (
    <Screen>
      <Screen.Header gradient />
      <Screen.ScrollView contentContainerStyle={styles.contentContainer.static}>
        <Screen.HeaderIndent />
        <Spacer y={24} />
        <Text type="h2" textAlign="center">
          {t('choose_wallets.title')}
        </Text>
        <Spacer y={4} />
        <Text type="body1" color="textSecondary" textAlign="center">
          {t('choose_wallets.subtitle')}
        </Text>
        <Spacer y={32} />
        <List indent={false}>
          {walletsInfo.map((walletInfo) => (
            <List.Item
              disabled={walletInfo.isAdded}
              key={`${walletInfo.accountIndex}_${walletInfo.version}`}
              title={Address.parse(walletInfo.address, {
                bounceable: false,
                testOnly: false,
              }).toShort()}
              subtitle={`${formatter.formatNano(walletInfo.balance)} TON${
                walletInfo.tokens ? tokensText : ''
              }${walletInfo.isAdded ? addedText : ''}`}
              rightContent={
                <View style={walletInfo.isAdded && styles.checkboxDisabled}>
                  <Checkbox
                    checked={selectedIndexes.includes(walletInfo.accountIndex!)}
                    onChange={() => {}}
                    disabled={isAndroid || walletInfo.isAdded}
                  />
                </View>
              }
              onPress={() => toggleSelected(walletInfo)}
            />
          ))}
        </List>
        <Screen.ButtonSpacer />
      </Screen.ScrollView>
      <Screen.ButtonContainer>
        <Button
          title={t('continue')}
          loading={loading}
          disabled={selectedIndexes.length === 0}
          onPress={handleContinue}
        />
      </Screen.ButtonContainer>
    </Screen>
  );
};

const styles = Steezy.create(() => ({
  contentContainer: {
    paddingHorizontal: 32,
  },
  checkboxDisabled: {
    opacity: 0.48,
  },
}));
