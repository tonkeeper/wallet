import { ReactElement, ReactNode } from 'react';

export interface StepComponentProps {
  active: boolean;
}

export interface StepViewItemProps {
  id: string | number;
  children: ReactNode | ((props: StepComponentProps) => ReactNode);
}

export interface StepViewProps {
  children: (ReactElement<StepViewItemProps> | null)[];
  backDisabled?: boolean;
  useBackHandler?: boolean;
  initialStepId?: number;
  autoHeight?: boolean;
  swipeEnabled?: boolean;
  swipeBackEnabled?: boolean;
  onChangeStep?: (currentStepId: string | number, currentStepIndex: number) => void;
}
