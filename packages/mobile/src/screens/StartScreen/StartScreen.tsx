import {
  Screen,
  View,
  Steezy,
  Text,
  Spacer,
  Button,
  deviceHeight,
  ThemeName,
} from '@tonkeeper/uikit';
import { Image, useWindowDimensions } from 'react-native';
import { memo, useCallback, useEffect } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { MainStackRouteNames } from '$navigation';
import { useDispatch } from 'react-redux';
import { walletActions } from '$store/wallet';
import { useNavigation } from '@tonkeeper/router';
import { network } from '@tonkeeper/core';
import { config } from '$config';
import DeviceInfo from 'react-native-device-info';
import { useThemeName } from '$hooks/useThemeName';
import { mainActions } from '$store/main';

const COVER_BLUE_SOURCE = require('./cover-blue.png');
const COVER_LIGHT_SOURCE = require('./cover-light.png');
const COVER_DARK_SOURCE = require('./cover-dark.png');

const getCoverSource = (theme: ThemeName) => {
  if (theme === ThemeName.Dark) {
    return COVER_DARK_SOURCE;
  }
  if (theme === ThemeName.Light) {
    return COVER_LIGHT_SOURCE;
  }

  return COVER_BLUE_SOURCE;
};

const HEIGHT_RATIO = deviceHeight / 844;

export const StartScreen = memo(() => {
  const dimensions = useWindowDimensions();
  const dispatch = useDispatch();
  const nav = useNavigation();

  const unsubscribeNotifications = useCallback(async () => {
    // unsubscribe from all notifications, if app was reinstalled
    try {
      const deviceId = DeviceInfo.getUniqueId();
      const endpoint = `${config.get('tonapiIOEndpoint')}/unsubscribe`;

      await network.post(endpoint, {
        params: {
          device: deviceId,
        },
      });
    } catch {}
  }, []);

  const handleCreatePress = useCallback(() => {
    dispatch(walletActions.generateVault());
    unsubscribeNotifications();
    nav.navigate(MainStackRouteNames.CreateWalletStack);
  }, [dispatch, nav, unsubscribeNotifications]);

  const handleImportPress = useCallback(() => {
    unsubscribeNotifications();
    nav.openModal('/add-wallet', { isImport: true });
  }, [nav, unsubscribeNotifications]);

  const themeName = useThemeName();

  // TODO: rewrite
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(mainActions.mainStackInited());
    }, 500);
    return () => clearTimeout(timer);
  }, [dispatch]);

  return (
    <Screen alternateBackground>
      <View style={{ flex: 1 }}>
        <Image
          source={getCoverSource(themeName)}
          style={{
            width: dimensions.width,
            height: 494 * HEIGHT_RATIO,
          }}
        />
        <View style={styles.info}>
          <Text type="h2" textAlign="center">
            Tonkeeper
          </Text>
          <Spacer y={4} />
          <Text type="body1" color="textSecondary" textAlign="center">
            {t('start_screen.caption')}
          </Text>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.buttons}>
          <Button
            title={t('start_screen.create_wallet_button')}
            onPress={handleCreatePress}
          />
          <Spacer y={16} />
          <Button
            title={t('start_screen.import_wallet_button')}
            color="secondary"
            onPress={handleImportPress}
          />
        </View>
      </View>
    </Screen>
  );
});

const styles = Steezy.create(({ safeArea }) => ({
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  logoIcon: {
    position: 'relative',
  },
  content: {
    paddingBottom: safeArea.bottom,
  },
  logo: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 1,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: 32,
    paddingBottom: 8,
  },
  buttons: {
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 32,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    height: 224,
    width: '100%',
    zIndex: 1,
  },
}));
