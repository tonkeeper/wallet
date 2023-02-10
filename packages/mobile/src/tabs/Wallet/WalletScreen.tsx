import { t } from '$translation';
import { Screen } from '$uikit';
import * as React from 'react';
import { View, StyleSheet } from 'react-native';

interface WalletScreenProps {

}

export const WalletScreen: React.FC<WalletScreenProps> = (props) => {
  return (
    <Screen>
      <Screen.Header large title={t('wallet.screen_title')}/>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    
  }
});