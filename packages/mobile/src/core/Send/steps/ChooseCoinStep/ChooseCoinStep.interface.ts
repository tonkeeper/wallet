import { SendSteps } from '$core/Send/Send.interface';
import { StepComponentProps } from '$shared/components/StepView/StepView.interface';
import { CryptoCurrency } from '$shared/constants';
import { JettonBalanceModel } from '$store/models';
import { SharedValue } from 'react-native-reanimated';

export interface ChooseCoinStepProps extends StepComponentProps {
  stepsScrollTop: SharedValue<Record<SendSteps, number>>;
  jettons: JettonBalanceModel[];
  onChangeCurrency: (currency: CryptoCurrency | string, isJetton?: boolean) => void;
}
