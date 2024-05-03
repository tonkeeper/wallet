import { copyText } from '$hooks/useCopyText';
import { Spacer } from '$uikit';
import { Address } from '@tonkeeper/core';
import { t } from '@tonkeeper/shared/i18n';
import { tk } from '$wallet';
import { Pressable, Screen, Steezy, Text, View, useTheme } from '@tonkeeper/uikit';
import React, { FC } from 'react';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const fontFamily = Platform.select({
  ios: 'SFMono-Medium',
  android: 'RobotoMono-Medium',
});

const splitAddress = (address: string) => {
  return {
    start: address.substring(0, 2),
    middle: address.substring(2, address.length - 4),
    end: address.substring(address.length - 4, address.length),
  };
};

export const AddressUpdateInfo: FC = () => {
  const oldAddress = Address.parse(tk.wallet.address.ton.raw).toFriendly({
    bounceable: true,
    testOnly: tk.wallet.isTestnet,
  });
  const newAddress = Address.parse(tk.wallet.address.ton.raw).toFriendly({
    bounceable: false,
    testOnly: tk.wallet.isTestnet,
  });
  const oldStyle = splitAddress(oldAddress);
  const newStyle = splitAddress(newAddress);

  const theme = useTheme();

  return (
    <Screen alternateBackground>
      <Screen.Header title={t('address_update.title')} alternateBackground />
      <Screen.ScrollView>
        <View style={styles.content}>
          <Text type="body2" color="textSecondary">
            {t('address_update.post_published_date')}
          </Text>
          <Spacer y={12} />
          <Text type="body2" color="textSecondary">
            {t('address_update.post_top')}
          </Text>
          <Spacer y={16} />
          <View style={styles.labelContainer}>
            <Text type="label1">{t('address_update.your_wallet')}</Text>
          </View>
          <Pressable
            underlayColor={theme.backgroundContentTint}
            backgroundColor={theme.fieldBackground}
            style={styles.addressContainer}
            onPress={() => copyText(oldAddress)}
          >
            <Text type="body3" color="textSecondary">
              {t('address_update.old_style')}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="middle" style={{ fontFamily }}>
              <Text color="textAccent" style={{ fontFamily }}>
                {oldStyle.start}
              </Text>
              {oldStyle.middle}
              <Text color="textAccent" style={{ fontFamily }}>
                {oldStyle.end}
              </Text>
            </Text>
          </Pressable>
          <Spacer y={16} />
          <Pressable
            underlayColor={theme.backgroundContentTint}
            backgroundColor={theme.fieldBackground}
            style={styles.addressContainer}
            onPress={() => copyText(newAddress)}
          >
            <Text type="body3" color="textSecondary">
              {t('address_update.new_style')}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="middle" style={{ fontFamily }}>
              <Text color="textAccent" style={{ fontFamily }}>
                {newStyle.start}
              </Text>
              {newStyle.middle}
              <Text color="textAccent" style={{ fontFamily }}>
                {newStyle.end}
              </Text>
            </Text>
          </Pressable>
          <Spacer y={16} />
          <View style={styles.labelContainer}>
            <Text type="label1">{t('address_update.why_change')}</Text>
          </View>
          <Text type="body2" color="textSecondary">
            {t('address_update.post_rest')}
          </Text>
          <View style={styles.option}>
            <View style={styles.optionNum}>
              <Text type="body2" color="textSecondary">
                {'1. '}
              </Text>
            </View>
            <Text type="body2" color="textSecondary">
              {t('address_update.first_option')}
            </Text>
          </View>
          <View style={styles.option}>
            <View style={styles.optionNum}>
              <Text type="body2" color="textSecondary">
                {'2. '}
              </Text>
            </View>
            <Text type="body2" color="textSecondary">
              {t('address_update.second_option')}
            </Text>
          </View>
          <Text type="body2" color="textSecondary">
            {t('address_update.post_dates')}
          </Text>
        </View>
        <SafeAreaView edges={['bottom']} />
      </Screen.ScrollView>
    </Screen>
  );
};

const styles = Steezy.create(({ colors, corners }) => ({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  labelContainer: {
    paddingVertical: 12,
  },
  option: {
    paddingLeft: 22,
    position: 'relative',
  },
  optionNum: {
    position: 'absolute',
    top: 0,
    left: 5,
  },
  addressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.fieldBackground,
    borderRadius: corners.medium,
  },
}));
