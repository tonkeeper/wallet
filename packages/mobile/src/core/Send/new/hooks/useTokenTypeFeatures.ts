import { TokenType } from '$core/Send/Send.interface';

export enum SendFeature {
  CommentEncryption = 'CommentEncryption',
}

export type TokenTypeFeaturesConfig = SendFeature[];

export const getTokenTypeFeatures = (tokenType: TokenType): TokenTypeFeaturesConfig => {
  switch (tokenType) {
    case TokenType.TON:
      return [SendFeature.CommentEncryption];
    case TokenType.Jetton:
      return [SendFeature.CommentEncryption];
    case TokenType.Inscription:
      return [];
    case TokenType.USDT:
      return [];
  }
};

export const useTokenTypeFeatures = (tokenType: TokenType): TokenTypeFeaturesConfig => {
  return getTokenTypeFeatures(tokenType);
};
