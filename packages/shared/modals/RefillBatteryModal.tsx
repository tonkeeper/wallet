import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefillBattery } from '../components/RefillBattery/RefillBattery';
import { NavBar } from '@tonkeeper/mobile/src/uikit';
import {
  StepView,
  StepViewItem,
  StepViewRef,
} from '@tonkeeper/mobile/src/shared/components';
import { BatterySupportedTransactions } from '../components/BatterySupportedTransactions';
import { useBatteryUIStore } from '@tonkeeper/mobile/src/store/zustand/batteryUI';
import { useBatteryState } from '../query/hooks/useBatteryState';
import { BatteryState } from '../utils/battery';
import { t } from '@tonkeeper/shared/i18n';

export enum RefillBatterySteps {
  REFILL_BATTERY,
  TRANSACTIONS,
}

export const RefillBatteryModal = memo(() => {
  const stepViewRef = useRef<StepViewRef>(null);
  const setIsViewed = useBatteryUIStore(
    (state) => state.actions.setIsViewedBatteryScreen,
  );
  const batteryState = useBatteryState();
  const [currentStep, setCurrentStep] = useState<{
    id: RefillBatterySteps;
    index: number;
  }>({
    id: RefillBatterySteps.REFILL_BATTERY,
    index: 0,
  });

  useEffect(() => {
    setIsViewed(true);
  }, [setIsViewed]);

  const handleNavigateToTransactions = useCallback(() => {
    stepViewRef.current?.go(RefillBatterySteps.TRANSACTIONS);
  }, []);

  const navbarTitle = useMemo(() => {
    switch (currentStep.id) {
      case RefillBatterySteps.TRANSACTIONS:
        return batteryState === BatteryState.Empty
          ? t('battery.transactions.title')
          : null;
      default:
        return null;
    }
  }, [currentStep, batteryState]);

  const hideBackButton = currentStep.index === 0;

  const handleChangeStep = useCallback((id: string | number, index: number) => {
    setCurrentStep({ id: id as RefillBatterySteps, index });
  }, []);

  const handleBack = useCallback(() => stepViewRef.current?.goBack(), []);

  // TODO: rewrite to react-native-pager-view
  return (
    <>
      <NavBar
        isModal
        isClosedButton
        isForceBackIcon
        hideBackButton={hideBackButton}
        hideTitle={currentStep.index === 0}
        onBackPress={handleBack}
      >
        {navbarTitle}
      </NavBar>
      <StepView onChangeStep={handleChangeStep} ref={stepViewRef} useBackHandler>
        <StepViewItem id={RefillBatterySteps.REFILL_BATTERY}>
          <RefillBattery navigateToTransactions={handleNavigateToTransactions} />
        </StepViewItem>
        <StepViewItem id={RefillBatterySteps.TRANSACTIONS}>
          <BatterySupportedTransactions editable={batteryState !== BatteryState.Empty} />
        </StepViewItem>
      </StepView>
    </>
  );
});
