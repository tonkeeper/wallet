import {
  ImportWalletStackParamList,
  ImportWalletStackRouteNames,
} from '$navigation/ImportWalletStack/types';
import { BottomButtonWrap, BottomButtonWrapHelper } from '$shared/components';
import { Checkbox } from '$uikit';
import { WalletContractVersion } from '$wallet/WalletTypes';
import { t } from '@tonkeeper/shared/i18n';
import {
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
import { useImportWallet } from '$hooks/useImportWallet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeaderHeight } from '@tonkeeper/uikit/src/containers/Screen/utils/constants';

export const ChooseWallets: FC<{
  route: RouteProp<ImportWalletStackParamList, ImportWalletStackRouteNames.ChooseWallets>;
}> = (props) => {
  const { mnemonic, lockupConfig, isTestnet, walletsInfo, isMigration } =
    props.route.params;

  const safeArea = useSafeAreaInsets();

  const doImportWallet = useImportWallet();

  const [selectedVersions, setSelectedVersions] = useState<WalletContractVersion[]>(
    walletsInfo
      .filter((item) => item.balance > 0 || item.tokens)
      .map((item) => item.version),
  );
  const [loading, setLoading] = useState(false);

  const toggleVersion = useCallback((version: WalletContractVersion) => {
    setSelectedVersions((s) =>
      s.includes(version) ? s.filter((item) => item !== version) : [...s, version],
    );
  }, []);

  const handleContinue = useCallback(async () => {
    if (selectedVersions.length === 0) {
      return;
    }
    try {
      setLoading(true);
      await doImportWallet(
        mnemonic,
        lockupConfig,
        selectedVersions,
        isTestnet,
        isMigration,
      );
    } catch {
    } finally {
      setLoading(false);
    }
  }, [doImportWallet, isMigration, isTestnet, lockupConfig, mnemonic, selectedVersions]);

  const tokensText = `, ${t('choose_wallets.tokens')}`;

  const headerHeight = ScreenHeaderHeight + safeArea.top;

  return (
    <Screen>
      <Screen.Header gradient />
      <Screen.ScrollView contentContainerStyle={styles.contentContainer.static}>
        <View style={{ paddingTop: headerHeight }} />
        <Spacer y={24} />
        <View style={styles.container}>
          <Text type="h2" textAlign="center">
            {t('choose_wallets.title')}
          </Text>
          <Spacer y={4} />
          <Text type="body1" color="textSecondary" textAlign="center">
            {t('choose_wallets.subtitle')}
          </Text>
        </View>
        <Spacer y={32} />
        <List>
          {walletsInfo.map((walletInfo) => (
            <List.Item
              key={walletInfo.version}
              title={Address.parse(walletInfo.address, {
                bounceable: false,
                testOnly: isTestnet,
              }).toShort()}
              subtitle={`${walletInfo.version} · ${formatter.formatNano(
                walletInfo.balance,
              )} TON${walletInfo.tokens ? tokensText : ''}`}
              rightContent={
                <Checkbox
                  checked={selectedVersions.includes(walletInfo.version)}
                  onChange={() => {}}
                  disabled={isAndroid}
                />
              }
              onPress={() => toggleVersion(walletInfo.version)}
            />
          ))}
        </List>
        <BottomButtonWrapHelper />
      </Screen.ScrollView>

      <BottomButtonWrap>
        <View style={styles.container}>
          <Button
            title={t('continue')}
            loading={loading}
            disabled={selectedVersions.length === 0}
            onPress={handleContinue}
          />
        </View>
      </BottomButtonWrap>
    </Screen>
  );
};

const styles = Steezy.create(() => ({
  contentContainer: {
    paddingHorizontal: 16,
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  buttonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
}));
