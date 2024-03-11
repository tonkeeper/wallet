import {
  epn2IconSource,
  liquidTfIconSource,
  tfIconSource,
  tkPoolIconSource,
  whalesClub2IconSource,
  whalesClubIconSource,
  whalesIconSource,
  whalesTeam2IconSource,
  whalesTeamIconSource,
} from '@tonkeeper/uikit/assets/staking';
import { PoolInfo, PoolImplementationType } from '@tonkeeper/core/src/TonAPI';
import { ImageRequireSource } from 'react-native';

export const getPoolIcon = (pool: PoolInfo): ImageRequireSource | null => {
  if (pool.implementation === PoolImplementationType.LiquidTF) {
    return liquidTfIconSource;
  }

  switch (pool.address) {
    case '0:00ff9fdd8b3b80d70e8ea734d262f5e1bd4c184c33535bf3190dd67408629e7a':
    case '0:efbc198fdf051c8e85cf6358c77d3e3e7e06f6f788a65581f910774b9c029e7a':
      return tkPoolIconSource;
    case '0:58b49b50cd4dccf80236de014cf75b56ea46256e556d8de8f9f604bc3f7b89fd':
      return epn2IconSource;
    case '0:8e8f8c048d7511e7d2aad0a797509a2e63988072e8e49b0246b185fba8f9c84c':
      return whalesTeamIconSource;
    case '0:48fb0195a7fc7454512377b9bd704503ded27f6e7c4c4a9d136fdab3ef9ec04c':
      return whalesTeam2IconSource;
    case '0:c5be7c6ec80da880d3cea048f596ef7af14e0f3fcfc5cc97eb39652c8bfa3508':
      return whalesClubIconSource;
    case '0:3f71ce6d210e2168d6cc545503d5dd1b351b75ed2ef081612a7cfff111a4c008':
      return whalesClub2IconSource;
    default:
      return null;
  }
};

export const getImplementationIcon = (implementation: string) => {
  if (implementation === PoolImplementationType.Whales) {
    return whalesIconSource;
  }
  if (implementation === PoolImplementationType.Tf) {
    return tfIconSource;
  }
  if (implementation === PoolImplementationType.LiquidTF) {
    return liquidTfIconSource;
  }
};
