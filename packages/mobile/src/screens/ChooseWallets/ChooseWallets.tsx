import {
  ImportWalletStackParamList,
  ImportWalletStackRouteNames,
} from '$navigation/ImportWalletStack/types';
import { Checkbox, Tag } from '$uikit';
import { ImportWalletInfo, WalletContractVersion } from '$wallet/WalletTypes';
import { t } from '@tonkeeper/shared/i18n';
import {
  Button,
  List,
  Screen,
  Spacer,
  Steezy,
  Text,
  TouchableOpacity,
  View,
  isAndroid,
} from '@tonkeeper/uikit';
import { FC, useCallback, useState } from 'react';
import { RouteProp } from '@react-navigation/native';
import { Address } from '@tonkeeper/shared/Address';
import { formatter } from '@tonkeeper/shared/formatter';
import { useImportWallet } from '$hooks/useImportWallet';
import { DEFAULT_WALLET_VERSION } from '$wallet/constants';
import { useNavigation } from '@tonkeeper/router';
import { AppStackRouteNames } from '$navigation';

export const ChooseWallets: FC<{
  route: RouteProp<ImportWalletStackParamList, ImportWalletStackRouteNames.ChooseWallets>;
}> = (props) => {
  const { mnemonic, lockupConfig, isTestnet, walletsInfo, isMigration, onDone } =
    props.route.params;

  const nav = useNavigation();

  const doImportWallet = useImportWallet();

  const [selectedVersions, setSelectedVersions] = useState<WalletContractVersion[]>(
    walletsInfo
      .filter(
        (item) =>
          item.balance > 0 || item.tokens || item.version === DEFAULT_WALLET_VERSION,
      )
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
      if (onDone) {
        await onDone(selectedVersions);
      } else {
        await doImportWallet(
          mnemonic,
          lockupConfig,
          selectedVersions,
          isTestnet,
          isMigration,
        );
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [
    doImportWallet,
    isMigration,
    isTestnet,
    lockupConfig,
    mnemonic,
    onDone,
    selectedVersions,
  ]);

  const openW5Stories = useCallback(() => {
    nav.navigate(AppStackRouteNames.W5StoriesScreen, {
      onPressButton: () => {
        setSelectedVersions((s) =>
          s.includes(WalletContractVersion.v5R1) ? s : [...s, WalletContractVersion.v5R1],
        );
      },
    });
  }, [nav]);

  const tokensText = `, ${t('choose_wallets.tokens')}`;

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
              key={walletInfo.version}
              title={
                <View style={styles.titleContainer}>
                  <Text type="label1">
                    {Address.parse(walletInfo.address, {
                      bounceable: false,
                      testOnly: isTestnet,
                    }).toShort()}
                  </Text>
                  {walletInfo.version === WalletContractVersion.v5R1 ? (
                    <Tag type="positive">W5</Tag>
                  ) : null}
                </View>
              }
              subtitle={
                walletInfo.version === WalletContractVersion.v5R1 &&
                walletInfo.balance === 0 ? (
                  <Text type="body2" color="textSecondary">
                    {t('choose_wallets.w5_subtitle')}{' '}
                    <Text type="body2" color="accentBlue" onPress={openW5Stories}>
                      {t('choose_wallets.w5_subtitle_link')}
                    </Text>
                  </Text>
                ) : (
                  `${walletInfo.version} · ${formatter.formatNano(
                    walletInfo.balance,
                  )} TON${walletInfo.tokens ? tokensText : ''}`
                )
              }
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
        <Screen.ButtonSpacer />
      </Screen.ScrollView>
      <Screen.ButtonContainer>
        <Button
          title={t('continue')}
          loading={loading}
          disabled={selectedVersions.length === 0}
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}));
