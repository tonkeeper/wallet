import { useTheme } from '$hooks/useTheme';
import { t } from '@tonkeeper/shared/i18n';
import { Skeleton } from '$uikit';
import { deviceWidth } from '$utils';
import { useNetInfo } from '@react-native-community/netinfo';
import React from 'react';
import { Steezy, View, Text } from '@tonkeeper/uikit';

export const Fallback: React.FC<{ isError?: boolean }> = (props) => {
  const theme = useTheme();
  const netInfo = useNetInfo();

  return (
    <View style={styles.wrap}>
      {props.isError || netInfo.isConnected === false ? (
        <>
          <Text style={styles.label.static} type="label1">
            {t('chart.no_internet')}
          </Text>
          <Text color="textSecondary" type="body2">
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

const styles = Steezy.create({
  wrap: {
    height: 248,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginBottom: 2,
  },
});
