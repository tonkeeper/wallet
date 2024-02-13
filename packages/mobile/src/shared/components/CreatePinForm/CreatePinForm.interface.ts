export interface CreatePinFormProps {
  onPinCreated: (pin: string) => Promise<void>;
  validateOldPin?: boolean;
  onOldPinValidated?: (_: string) => void;
}
