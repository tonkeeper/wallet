import { useTheme } from '$hooks/useTheme';
import { t } from '@tonkeeper/shared/i18n';
import { Skeleton, Text } from '$uikit';
import { deviceWidth, ns } from '$utils';
import { useNetInfo } from '@react-native-community/netinfo';
import React from 'react';
import { View } from 'react-native';

export const Fallback: React.FC<{ isError?: boolean }> = (props) => {
  const theme = useTheme();
  const netInfo = useNetInfo();

  return (
    <View style={{ height: ns(180), alignItems: 'center', justifyContent: 'center' }}>
      {props.isError || !netInfo.isConnected ? (
        <>
          <Text style={{ marginBottom: ns(2) }} variant="label1">
            {t('chart.no_internet')}
          </Text>
          <Text color="textSecondary" variant="body2">
            {t('chart.check_connection')}
          </Text>
        </>
      ) : (
        <Skeleton.LineOpacity
          height={2}
          width={deviceWidth}
          style={{
            backgroundColor: theme.colors.backgroundSecondary,
          }}
        />
      )}
    </View>
  );
};
