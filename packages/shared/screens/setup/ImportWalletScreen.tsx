import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { memo, useCallback, useState } from 'react';
import { useNavigation } from '@tonkeeper/router';
import { t } from '../../i18n';
import {
  usePagerViewSteps,
  StepIndicator,
  PagerView,
  Button,
  Screen,
} from '@tonkeeper/uikit';

import { SetupRecoveryPhrasePage } from './pages/SetupRecoveryPhrasePage';
import { SetupNotificationsPage } from './pages/SetupNotificationsPage';
import { SetupWalletNamePage } from './pages/SetupWalletNamePage';
import { SetupPasscodePage } from './pages/SetupPasscodePage';
import { SetupBiometryPage } from './pages/SetupBiometryPage';

import { delay } from '@tonkeeper/uikit/src/utils/delay';

export const ImportWalletScreen = memo(() => {
  const steps = usePagerViewSteps();
  const nav = useNavigation();

  const hasWallet = false; //!!wallet;
  const stepsCount = hasWallet ? 2 : 4;

  const [lockupConfig, setLockupConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [phrase, setPhrase] = useState('');
  const [name, setName] = useState('');

  const importWallet = useCallback(async () => {
    setLoading(true);

    // Debug
    await delay(1000);
    console.log('complete', { passcode, phrase, name, lockupConfig });

    // await tk.wallet.import({
    //   lockupConfig
    //   passcode,
    //   phrase,
    //   name
    // });
    nav.replace('Tabs');
  }, [lockupConfig, loading, passcode, phrase, name]);

  const setupBiometry = useCallback(() => {
    // await tk.wallet.enableBiometry();
    steps.next();
  }, [steps.next]);

  const setupNotifications = useCallback(() => {
    // await tk.enableNotifications();
    nav.replace('Tabs');
  }, []);

  const later = useCallback(() => {
    if (steps.pageIndex === 0) {
      steps.next();
    } else {
      nav.replace('Tabs');
    }
  }, [steps.pageIndex, steps.next, importWallet]);

  const laterButtonStyle = useAnimatedStyle(() => ({
    opacity: interpolate(steps.props.pageOffset.value, [1, 2], [0, 1]),
  }));

  return (
    <Screen>
      <Screen.Header
        onBackPress={steps.onBackPress}
        rightContent={
          <Animated.View style={laterButtonStyle}>
            <Button title={t('later')} color="secondary" onPress={later} size="small" />
          </Animated.View>
        }
        title={
          <StepIndicator
            pageOffset={steps.props.pageOffset}
            offsetInterval={1}
            steps={stepsCount}
          />
        }
      />
      {hasWallet ? (
        <PagerView {...steps.props}>
          <PagerView.Page>
            <SetupRecoveryPhrasePage
              shown={steps.pageIndex === 0}
              onButtonPress={(phrase, lockup: any) => {
                setPhrase(phrase);
                if (lockup) {
                  setLockupConfig(lockup);
                }
                steps.next();
              }}
            />
          </PagerView.Page>
          <PagerView.Page>
            <SetupWalletNamePage
              shown={steps.pageIndex === 1}
              onButtonPress={(name) => {
                setName(name);
                importWallet();
              }}
              loading={loading}
            />
          </PagerView.Page>
        </PagerView>
      ) : (
        <PagerView {...steps.props}>
          <PagerView.Page>
            <SetupRecoveryPhrasePage
              shown={steps.pageIndex === 0}
              onButtonPress={(phrase, lockup: any) => {
                setPhrase(phrase);
                if (lockup) {
                  setLockupConfig(lockup);
                }
                steps.next();
              }}
            />
          </PagerView.Page>
          <PagerView.Page>
            <SetupPasscodePage
              shown={steps.pageIndex === 1}
              onButtonPress={(passcode) => {
                setPasscode(passcode);
                steps.next();
              }}
            />
          </PagerView.Page>
          <PagerView.Page>
            <SetupBiometryPage onButtonPress={setupBiometry} />
          </PagerView.Page>
          <PagerView.Page>
            <SetupNotificationsPage onButtonPress={setupNotifications} loading={loading} />
          </PagerView.Page>
        </PagerView>
      )}
    </Screen>
  );
});
