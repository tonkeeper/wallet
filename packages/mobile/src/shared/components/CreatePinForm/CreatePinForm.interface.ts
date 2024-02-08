export interface CreatePinFormProps {
  onPinCreated: (pin: string) => void;
  validateOldPin?: boolean;
  onOldPinValidated?: (_: string) => void;
}
