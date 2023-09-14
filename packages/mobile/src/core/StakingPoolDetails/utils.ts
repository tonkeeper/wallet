import { IconNames } from '@tonkeeper/uikit';
import { IStakingLink, StakingLinkType } from './types';
import { getDomainFromURL } from '$utils';
import { t } from '@tonkeeper/shared/i18n';

export const getSocialLinkType = (url: string): StakingLinkType => {
  if (url.includes('t.me')) {
    return StakingLinkType.Telegram;
  }

  if (url.includes('twitter.com')) {
    return StakingLinkType.Twitter;
  }

  return StakingLinkType.Unknown;
};

export const getLinkIcon = (linkType: StakingLinkType): IconNames | null => {
  switch (linkType) {
    case StakingLinkType.Website:
      return 'ic-globe-16';
    case StakingLinkType.Twitter:
      return 'ic-twitter-16';
    case StakingLinkType.Telegram:
      return 'ic-telegram-16';
    case StakingLinkType.Explorer:
      return 'ic-magnifying-glass-16';
    default:
      return null;
  }
};

export const getLinkTitle = (link: IStakingLink) => {
  if (
    [StakingLinkType.Website, StakingLinkType.Unknown, StakingLinkType.Explorer].includes(
      link.type,
    )
  ) {
    return getDomainFromURL(link.url);
  }

  return t(`staking.details.socials.${link.type}`);
};
