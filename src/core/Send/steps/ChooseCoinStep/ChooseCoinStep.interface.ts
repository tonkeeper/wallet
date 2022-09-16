import { SendSteps } from '$core/Send/Send.interface';
import { StepComponentProps } from '$shared/components/StepView/StepView.interface';
import { CryptoCurrency } from '$shared/constants';
import { SharedValue } from 'react-native-reanimated';

export interface ChooseCoinStepProps extends StepComponentProps {
  stepsScrollTop: SharedValue<Record<SendSteps, number>>;
  onChangeCurrency: (currency: CryptoCurrency | string, isJetton?: boolean) => void;
}
