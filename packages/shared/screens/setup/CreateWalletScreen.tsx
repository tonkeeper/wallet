import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useNavigation, useRouter } from '@tonkeeper/router';
import { t } from '../../i18n';
import {
  usePagerViewSteps,
  StepIndicator,
  PagerView,
  Button,
  Screen,
  useValueRef,
} from '@tonkeeper/uikit';

import { SetupNotificationsPage } from './pages/SetupNotificationsPage';
import { SetupPasscodePage } from './pages/SetupPasscodePage';
import { SetupBiometryPage } from './pages/SetupBiometryPage';

import { delay } from '@tonkeeper/uikit/src/utils/delay';
import { SetupWalletNamePage } from './pages/SetupWalletNamePage';
import { tk } from '../../tonkeeper';

type StepsComponents = React.ComponentElement<any, any>[];

const SetupLeterButton = () => {
  

  const later = useCallback(() => {
    if (steps.pageIndex === 0) {
      steps.next();
    } else {
      router.replace('Tabs');
    }
  }, [steps.pageIndex, steps.next]);

  const laterButtonStyle = useAnimatedStyle(() => ({
    opacity: interpolate(steps.props.pageOffset.value, [0, 1], [0, 1]),
  }));

  return (
    <Animated.View style={laterButtonStyle}>
      <Button title={t('later')} color="secondary" onPress={later} size="small" />
    </Animated.View>
  );
};

enum CreateWalletSteps {
  CreatePasscode,
  SetupWalletName,
  SetupBiometry,
  SetupNotifications,
}

type StepsData = {
  passcode: string;
};

function useSetupController(ags?: any) {}

export const CreateWalletScreen = memo(() => {
  const steps = usePagerViewSteps();
  const passcode = useValueRef('');
  const router = useRouter();

  const controller = useSetupController(
    async ({ step, startLoading, data, goToNextPage, isLastStep }) => {
      if (isLastStep) {
        router.replace('Tabs');
      }

      switch (step) {
        case CreateWalletSteps.CreatePasscode:
          passcode.setValue(data.passcode);
          if (!tk.wallet.current) {
            startLoading();
            await tk.wallet.create({
              passcode: data.passcode,
            });
          }

          goToNextPage();
          break;
        case CreateWalletSteps.SetupWalletName:
          startLoading();
          await tk.wallet.create({
            passcode: passcode.value,
            name: data.name,
          });
          goToNextPage();
          break;
        case CreateWalletSteps.SetupBiometry:
          await tk.wallet.enableBiometry();
          goToNextPage();
          break;
        case CreateWalletSteps.SetupNotifications:
          await tk.notifications.requestPermission();
          goToNextPage();
          break;
      }
    },
  );

  const pages = useMemo(() => {
    const pages: StepsComponents = [SetupPasscodePage];

    if (tk.wallets.length > 0) {
      pages.push(SetupWalletNamePage);
    }

    if (!tk.permissions.biometry) {
      pages.push(SetupBiometryPage);
    }

    if (!tk.permissions.notifications) {
      pages.push(SetupNotificationsPage);
    }

    return pages;
  }, []);

  
  return (
    <Screen>
      <Screen.Header
        onBackPress={steps.onBackPress}
        // rightContent={<StepLaterButton />}
        title={
          <StepIndicator
            pageOffset={steps.props.pageOffset}
            steps={pages.length}
            offsetInterval={1}
          />
        }
      />
      <PagerView {...steps.props}>
          
          <PagerView.Page key={index}>
            <Page
              shown={steps.pageIndex === index} 
              onButtonPress={() => {}} 
            />
          </PagerView.Page>
        ))}
      </PagerView>
    </Screen>
  );
});
