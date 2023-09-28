import { IconNames } from '@tonkeeper/uikit';

export enum StakingLinkType {
  Website = 'website',
  Twitter = 'twitter',
  Telegram = 'telegram',
  Explorer = 'explorer',
  Unknown = 'unknown',
}

export interface IStakingLink {
  type: StakingLinkType;
  url: string;
  icon: IconNames | null;
  social?: boolean;
}
