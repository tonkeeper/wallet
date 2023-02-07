import { UnlockedVault } from '$blockchain';

export interface CreatePinFormProps {
  onPinCreated: (pin: string) => void;
  validateOldPin?: boolean;
  onVaultUnlocked?: (_: UnlockedVault) => void;
}
