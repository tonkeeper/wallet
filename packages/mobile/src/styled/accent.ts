import { SvgProps } from 'react-native-svg';
import { COMMON_COLORS } from './colors';
import defaultIcon from '$assets/accent/default.svg';
import skyIcon from '$assets/accent/sky.svg';
import arcticIcon from '$assets/accent/arctic.svg';
import azureIcon from '$assets/accent/azure.svg';
import irisIcon from '$assets/accent/iris.svg';
import flamingoIcon from '$assets/accent/flamingo.svg';
import coralIcon from '$assets/accent/coral.svg';
import marineIcon from '$assets/accent/marine.svg';
import oceanIcon from '$assets/accent/ocean.svg';
import fluidIcon from '$assets/accent/fluid.svg';
import galaxyIcon from '$assets/accent/galaxy.svg';
import cosmosIcon from '$assets/accent/cosmos.svg';
import andromedaIcon from '$assets/accent/andromeda.svg';
import { NFTModel, TonDiamondMetadata } from '$store/models';

export type AccentNFTIconSize = 'large' | 'medium' | 'small';

export interface AccentNFTIcon {
  uri: string;
  size: AccentNFTIconSize;
}

export interface AccentModel {
  id: AccentKey;
  icon: React.ComponentType<SvgProps>;
  nftIcon?: AccentNFTIcon;
  nft?: NFTModel<TonDiamondMetadata>;
  colors: {
    accentPrimary: string;
    accentPrimaryLight: string;
    accentPrimaryDark: string;
  };
  available?: boolean;
}

export enum AccentKey {
  default = 'default',
  sky = 'sky',
  arctic = 'arctic',
  azure = 'azure',
  iris = 'iris',
  flamingo = 'flamingo',
  coral = 'coral',
  marine = 'marine',
  ocean = 'ocean',
  fluid = 'fluid',
  galaxy = 'galaxy',
  cosmos = 'cosmos',
  andromeda = 'andromeda',
}

export const AppearanceAccents: Record<AccentKey, AccentModel> = {
  [AccentKey.default]: {
    id: AccentKey.default,
    icon: defaultIcon,
    colors: COMMON_COLORS,
  },
  [AccentKey.sky]: {
    id: AccentKey.sky,
    icon: skyIcon,
    colors: {
      accentPrimary: '#509FFA',
      accentPrimaryLight: '#69ADFA',
      accentPrimaryDark: '#407FC7',
    },
  },
  [AccentKey.arctic]: {
    id: AccentKey.arctic,
    icon: arcticIcon,
    colors: {
      accentPrimary: '#5089FA',
      accentPrimaryLight: '#6999FA',
      accentPrimaryDark: '#406DC7',
    },
  },
  [AccentKey.azure]: {
    id: AccentKey.azure,
    icon: azureIcon,
    colors: {
      accentPrimary: '#7380FA',
      accentPrimaryLight: '#8C97FA',
      accentPrimaryDark: '#5B66C7',
    },
  },
  [AccentKey.iris]: {
    id: AccentKey.iris,
    icon: irisIcon,
    colors: {
      accentPrimary: '#9B78FA',
      accentPrimaryLight: '#AD91FA',
      accentPrimaryDark: '#7B5FC7',
    },
  },
  [AccentKey.flamingo]: {
    id: AccentKey.flamingo,
    icon: flamingoIcon,
    colors: {
      accentPrimary: '#FA5AAF',
      accentPrimaryLight: '#FA73BB',
      accentPrimaryDark: '#C7488B',
    },
  },
  [AccentKey.coral]: {
    id: AccentKey.coral,
    icon: coralIcon,
    colors: {
      accentPrimary: '#FA5A60',
      accentPrimaryLight: '#FA7378',
      accentPrimaryDark: '#C7484C',
    },
  },
  [AccentKey.marine]: {
    id: AccentKey.marine,
    icon: marineIcon,
    colors: {
      accentPrimary: '#50D1EB',
      accentPrimaryLight: '#67D5EB',
      accentPrimaryDark: '#42ACC2',
    },
  },
  [AccentKey.ocean]: {
    id: AccentKey.ocean,
    icon: oceanIcon,
    colors: {
      accentPrimary: '#8978FA',
      accentPrimaryLight: '#9F91FA',
      accentPrimaryDark: '#6D5FC7',
    },
  },
  [AccentKey.fluid]: {
    id: AccentKey.fluid,
    icon: fluidIcon,
    colors: {
      accentPrimary: '#53E5B9',
      accentPrimaryLight: '#6EE5C1',
      accentPrimaryDark: '#44BD98',
    },
  },
  [AccentKey.galaxy]: {
    id: AccentKey.galaxy,
    icon: galaxyIcon,
    colors: {
      accentPrimary: '#F450FA',
      accentPrimaryLight: '#F569FA',
      accentPrimaryDark: '#C240C7',
    },
  },
  [AccentKey.cosmos]: {
    id: AccentKey.cosmos,
    icon: cosmosIcon,
    colors: {
      accentPrimary: '#567FF0',
      accentPrimaryLight: '#6E91F0',
      accentPrimaryDark: '#4464BD',
    },
  },
  [AccentKey.andromeda]: {
    id: AccentKey.andromeda,
    icon: andromedaIcon,
    colors: {
      accentPrimary: '#F0AF65',
      accentPrimaryLight: '#F0BA7D',
      accentPrimaryDark: '#BD8A4F',
    },
  },
};

export const getAccentIdByDiamondsNFT = (nft: NFTModel<TonDiamondMetadata>) => {
  switch (nft.metadata.theme.main) {
    case '#509FFA':
      return AccentKey.sky;
    case '#5089FA':
      return AccentKey.arctic;
    case '#7380FA':
      return AccentKey.azure;
    case '#9B78FA':
      return AccentKey.iris;
    case '#FA5AAF':
      return AccentKey.flamingo;
    case '#FA5A60':
      return AccentKey.coral;
    case '#53DAF5':
      return AccentKey.marine;
    case '#8978FA':
      return AccentKey.ocean;
    case '#5AFACA':
      return AccentKey.fluid;
    case '#F450FA':
      return AccentKey.galaxy;
    case '#567FF0':
      return AccentKey.cosmos;
    case '#F0AF65':
      return AccentKey.andromeda;

    default:
      return AccentKey.default;
  }
};

export const getDiamondSizeRatio = (size?: AccentNFTIconSize) => {
  switch (size) {
    case 'small':
      return 1.25;
    case 'medium':
    case 'large':
    default:
      return 1;
  }
};
