import React from 'react';
import Clipboard from '@react-native-community/clipboard';
import { StyleSheet, View } from 'react-native';
import { t } from '@tonkeeper/shared/i18n';
import { Button, Screen, Spacer, Text } from '@tonkeeper/uikit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ns } from '$utils';
import { Toast } from '$store';

interface ErrorScreenProps {
  refresh: () => void;
  message: string;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = (props) => {
  const safeArea = useSafeAreaInsets();

  const handleCopyLog = React.useCallback(
    (value?: string) => () => {
      if (value) {
        Clipboard.setString(value);
        Toast.success(t('copied'));
      }
    },
    [],
  );

  return (
    <Screen>
      <View style={[styles.container, { paddingBottom: safeArea.bottom + ns(16) }]}>
        <View style={styles.titleСontainer}>
          <Text type="h2">{t('error_occurred')}</Text>
        </View>
        <Button onPress={handleCopyLog(props.message)} title={t('copy_error_log')} />
        <Spacer y={24} />
        <Button title={t('refresh_app')} onPress={props.refresh} color="secondary" />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: ns(16),
  },
  titleСontainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
