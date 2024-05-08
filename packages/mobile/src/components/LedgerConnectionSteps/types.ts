export type LedgerConnectionCurrentStep =
  | 'connect'
  | 'open-ton'
  | 'confirm-tx'
  | 'all-completed';
