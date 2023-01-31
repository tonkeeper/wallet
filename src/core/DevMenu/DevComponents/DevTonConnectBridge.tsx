import React from 'react';
import { Icon, Screen, Text } from '$uikit';
import { CellSection, CellSectionItem } from '$shared/components';
import { AttachScreenButton } from '$navigation/AttachScreen';
import { useRemoteBridgeStore } from '$store';
import { View } from 'react-native';

const BRIDGE_URLS = [
  'https://bridge.tonapi.io/bridge',
  'https://bridge01.subgroup.org/bridge',
  'https://bridge02.subgroup.org/bridge',
  'https://bridge03.subgroup.org/bridge',
  'https://bridge04.subgroup.org/bridge',
  'https://bridge05.subgroup.org/bridge',
  'https://bridge06.subgroup.org/bridge',
  'https://bridge07.subgroup.org/bridge',
  'https://bridge08.subgroup.org/bridge',
  'https://bridge09.subgroup.org/bridge',
  'https://bridge10.subgroup.org/bridge',
  'https://bridge11.subgroup.org/bridge',
];

export const DevTonConnectBridge: React.FC = () => {
  const { bridgeUrl, setBridgeUrl } = useRemoteBridgeStore();

  return (
    <Screen>
      <Screen.Header title="TC Bridge" rightContent={<AttachScreenButton />} />

      <Screen.ScrollView>
        <CellSection>
          {BRIDGE_URLS.map((url) => (
            <CellSectionItem
              onPress={() => setBridgeUrl(url)}
              key={url}
              inlineContent={
                bridgeUrl === url ? (
                  <Icon name="ic-donemark-thin-28" color="accentPrimary" />
                ) : null
              }
              content={
                <View style={{ flex: 1 }}>
                  <Text variant="label1">
                    {url.replace('https://', '').replace('/bridge', '')}
                  </Text>
                </View>
              }
            />
          ))}
        </CellSection>
      </Screen.ScrollView>
    </Screen>
  );
};
