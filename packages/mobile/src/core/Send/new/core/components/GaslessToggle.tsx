import React, { memo } from 'react';
import { Icon, Steezy, Text, TouchableOpacity } from '@tonkeeper/uikit';
import { triggerImpactMedium } from '$utils';
import { tk } from '$wallet';
import { t } from '@tonkeeper/shared/i18n';
import { useExternalState } from '@tonkeeper/shared/hooks/useExternalState';

export interface GaslessToggleProps {
  isGasless?: boolean;
  currencyTitle: string;
}

export const GaslessToggle = memo<GaslessToggleProps>((props) => {
  const hasTouchedGaslessToggle = useExternalState(
    tk.wallet.battery.state,
    (state) => state.hasTouchedGaslessToggle,
  );

  const shouldAccent = !hasTouchedGaslessToggle;

  const handleToggleGassless = () => {
    triggerImpactMedium();
    tk.wallet.battery.togglePreferGasless();
  };

  return (
    <TouchableOpacity onPress={handleToggleGassless} style={styles.container}>
      <Text color={shouldAccent ? 'accentBlue' : 'textTertiary'} type="body2">
        {t('gasless.switch_label', {
          currency: props.isGasless ? 'TON' : props.currencyTitle,
        })}
      </Text>
      <Icon
        color={shouldAccent ? 'accentBlue' : 'iconTertiary'}
        name={'ic-chevron-right-12'}
      />
    </TouchableOpacity>
  );
});

const styles = Steezy.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
