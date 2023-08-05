import { t } from '@tonkeeper/shared/i18n';
import { Button, Text } from '$uikit';
import { ns } from '$utils';
import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import * as S from './AboutDApps.style';

export const AboutDApps: React.FC = () => {
  const handleMorePress = () => {
    Linking.openURL('https://github.com/ton-connect');
  };

  return (
    <S.Container>
      <Text variant="label1">
        {t('browser.about_dapps_title')}
      </Text>
      <Text style={styles.captionText} color="foregroundSecondary" variant="body2">
        {t('browser.about_dapps_caption')}
      </Text>
      <View style={styles.buttonContainer}>
        <Button size="medium_rounded" onPress={handleMorePress}>
          {t('browser.about_dapps_learn_more')}
        </Button>
      </View>
    </S.Container>
  );
};

const styles = StyleSheet.create({
  captionText: {
    marginTop: ns(4),
    marginBottom: ns(16),
  },
  buttonContainer: {
    flexDirection: 'row'
  }
});