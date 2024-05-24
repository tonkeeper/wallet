import { SendSteps } from '$core/Send/Send.interface';
import { useCallback, useState } from 'react';
import { t } from '@tonkeeper/shared/i18n';

export interface SendNavigation {
  isStep: (step: SendSteps) => boolean;
  currentStep: { id: SendSteps; index: number };
  setCurrentStep: (step: { id: SendSteps; index: number }) => void;
  handleChangeStep: (id: string | number, index: number) => void;
  hideBackButton: boolean;
  navBarTitle: string;
}

export const useSendNavigation = (initialStepId?: SendSteps): SendNavigation => {
  const [currentStep, setCurrentStep] = useState<{ id: SendSteps; index: number }>({
    id: SendSteps.ADDRESS,
    index: 0,
  });

  const handleChangeStep = useCallback((id: string | number, index: number) => {
    setCurrentStep({ id: id as SendSteps, index });
  }, []);

  const isStep = (stepToCheck: SendSteps) => currentStep.id === stepToCheck;
  const hideBackButton = currentStep.index === 0 || initialStepId === SendSteps.CONFIRM;

  const navBarTitle = isStep(SendSteps.ADDRESS)
    ? t('send_screen_steps.address.title')
    : t('send_screen_steps.amount.title');

  return {
    isStep,
    currentStep,
    setCurrentStep,
    handleChangeStep,
    hideBackButton,
    navBarTitle,
  };
};
