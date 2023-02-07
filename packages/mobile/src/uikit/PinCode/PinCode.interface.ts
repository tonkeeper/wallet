export interface PinCodeRef {
  triggerError: () => void;
  triggerSuccess: () => void;
  clearState: () => void;
}

export interface PinCodeProps {
  value: string;
}

export interface PointProps {
  isActive: boolean;
  isError: boolean;
  isSuccess: boolean;
  index: number;
}
