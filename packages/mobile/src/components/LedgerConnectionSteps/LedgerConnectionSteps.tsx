import { FC, useCallback } from 'react';
import { Steezy } from '@tonkeeper/uikit/src/styles';
import { Text, View, Icon, Loader, TouchableOpacity } from '@tonkeeper/uikit';
import { t } from '@tonkeeper/shared/i18n';
import { LedgerConnectionCurrentStep } from './types';
import { LegderView } from './LedgerView';
import { Linking, Platform } from 'react-native';

const LEDGER_LIVE_STORE_URL = Platform.select({
  ios: 'https://apps.apple.com/app/ledger-live/id1361671700',
  android: 'https://play.google.com/store/apps/details?id=com.ledger.live',
});

const BUTTON_HIT_SLOP = {
  top: 12,
  bottom: 12,
  left: 12,
  right: 12,
};

const StepIcon: FC<{ state: 'future' | 'active' | 'completed' }> = ({ state }) => {
  let content = <Icon name="ic-done-16" color="accentGreen" />;
  if (state === 'future') {
    content = <Icon name="ic-dot-16" color="iconTertiary" />;
  }

  if (state === 'active') {
    content = <Loader size="small" color="iconTertiary" />;
  }

  return <View style={styles.iconContainer}>{content}</View>;
};

interface Props {
  showConfirmTxStep?: boolean;
  currentStep: LedgerConnectionCurrentStep;
}

export const LedgerConnectionSteps: FC<Props> = (props) => {
  const { currentStep, showConfirmTxStep } = props;

  const openLegderLive = useCallback(async () => {
    try {
      await Linking.openURL('ledgerlive://myledger?installApp=TON');
    } catch {
      Linking.openURL(LEDGER_LIVE_STORE_URL!);
    }
  }, []);

  return (
    <View style={styles.container}>
      <LegderView currentStep={currentStep} showConfirmTxStep={showConfirmTxStep} />
      <View style={styles.stepsContainer}>
        <View style={styles.step}>
          <StepIcon state={currentStep === 'connect' ? 'active' : 'completed'} />
          <View style={styles.stepText}>
            <Text
              type="body2"
              color={currentStep !== 'connect' ? 'accentGreen' : 'textPrimary'}
            >
              {t('ledger.connect')}
            </Text>
          </View>
        </View>
        <View style={styles.step}>
          <StepIcon
            state={
              currentStep === 'open-ton'
                ? 'active'
                : currentStep === 'connect'
                ? 'future'
                : 'completed'
            }
          />
          <View style={styles.stepText}>
            <Text
              type="body2"
              color={
                currentStep === 'all-completed' || currentStep === 'confirm-tx'
                  ? 'accentGreen'
                  : 'textPrimary'
              }
            >
              {t('ledger.open_ton_app')}
            </Text>
            {!showConfirmTxStep ? (
              <TouchableOpacity hitSlop={BUTTON_HIT_SLOP} onPress={openLegderLive}>
                <Text type="body2" color="accentBlue">
                  {t('ledger.install_ton_app')}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        {showConfirmTxStep ? (
          <View style={styles.step}>
            <StepIcon
              state={
                currentStep === 'confirm-tx'
                  ? 'active'
                  : currentStep === 'connect' || currentStep === 'open-ton'
                  ? 'future'
                  : 'completed'
              }
            />
            <View style={styles.stepText}>
              <Text
                type="body2"
                color={currentStep === 'all-completed' ? 'accentGreen' : 'textPrimary'}
              >
                {t('ledger.confirm_tx')}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = Steezy.create(({ colors, corners }) => ({
  container: {
    backgroundColor: colors.backgroundContent,
    overflow: 'hidden',
    borderRadius: corners.medium,
    marginBottom: 16,
  },
  stepsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  stepText: {
    flex: 1,
    paddingLeft: 8,
  },
  iconContainer: {
    marginTop: 2,
  },
}));
