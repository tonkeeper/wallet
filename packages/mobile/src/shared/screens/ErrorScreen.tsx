import React from 'react';
import Clipboard from '@react-native-community/clipboard';
import { StyleSheet, View } from 'react-native';
import { t } from '@tonkeeper/shared/i18n';
import { Button, DevSeparator, Screen, Text } from '$uikit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ns } from '$utils';
import { Toast } from '$store';

interface ErrorScreenProps {
  refresh: () => void;
  message: string;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = (props) => {
  const safeArea = useSafeAreaInsets();

  const handleCopyLog = React.useCallback((value?: string) => () => {
      if (value) {
        Clipboard.setString(value);
        Toast.success(t('copied'));
      }
    },
    [t]
  );

  return (
    <Screen>
      <View style={[styles.container, { paddingBottom: safeArea.bottom + ns(16) }]}>
        <View style={styles.titleСontainer}>
          <Text variant="h2">
            {t('error_occurred')}
          </Text>
        </View>
        <Button onPress={handleCopyLog(props.message)}>
          {t('copy_error_log')}
        </Button>
        <DevSeparator />
        <Button onPress={props.refresh} mode="secondary">
          {t('refresh_app')}
        </Button>   
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    padding: ns(16),
  },
  titleСontainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});