import { SendRecipient, SendAmount, SendSteps } from '../../Send.interface';
import { StepComponentProps } from '$shared/components/StepView/StepView.interface';
import React from 'react';
import { SharedValue } from 'react-native-reanimated';
import { Account } from '@tonkeeper/core';

export interface AddressStepProps extends StepComponentProps {
  recipient: SendRecipient | null;
  decimals: number;
  stepsScrollTop: SharedValue<Record<SendSteps, number>>;
  setRecipient: React.Dispatch<React.SetStateAction<SendRecipient | null>>;
  setRecipientAccountInfo: React.Dispatch<React.SetStateAction<Account | null>>;
  setAmount: React.Dispatch<React.SetStateAction<SendAmount>>;
  setComment: React.Dispatch<React.SetStateAction<string>>;
  onContinue: () => void;
}
