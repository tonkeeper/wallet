import React from 'react';
import Clipboard from '@react-native-community/clipboard';
import { StyleSheet, View } from 'react-native';
import { t } from '$translation';
import { Button, DevSeparator, Screen, Text } from '$uikit';
import { toastActions } from '$store/toast';
import { useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ns } from '$utils';

interface ErrorScreenProps {
  refresh: () => void;
  message: string;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = (props) => {
  const dispatch = useDispatch();
  const safeArea = useSafeAreaInsets();

  const handleCopyLog = React.useCallback((value?: string) => () => {
      if (value) {
        Clipboard.setString(value);
        dispatch(toastActions.success(t('copied')));
      }
    },
    [dispatch, t]
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