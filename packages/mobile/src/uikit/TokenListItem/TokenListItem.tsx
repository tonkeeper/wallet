import { Icon } from '../Icon/Icon';
import { Text } from '../Text/Text';
import React, { FC, memo, ReactNode } from 'react';
import * as S from './TokenListItem.style';

interface Props {
  name?: string;
  balance: string;
  icon: ReactNode;
  borderStart?: boolean;
  borderEnd?: boolean;
  bottomOffset?: number;
  separator?: boolean;
  onPress?: () => void;
}

const TokenListItemComponent: FC<Props> = (props) => {
  const {
    name,
    balance,
    icon,
    borderStart = true,
    borderEnd = true,
    bottomOffset,
    separator = true,
    onPress,
  } = props;

  return (
    <S.JettonWrap withMargin={borderEnd} bottomOffset={bottomOffset}>
      <S.Background borderEnd={borderEnd} borderStart={borderStart} />
      <S.Jetton onPress={onPress} isFirst={borderStart} isLast={borderEnd}>
        <S.JettonContent>
          <S.AddOtherCoinsIcons>{icon}</S.AddOtherCoinsIcons>
          <S.JettonTextWrap>
            <Text variant="label1" numberOfLines={1}>
              {name}
            </Text>
            <Text color="foregroundSecondary" variant="body2" numberOfLines={1}>
              {balance}
            </Text>
          </S.JettonTextWrap>
          <Icon name="ic-chevron-16" color="foregroundSecondary" />
        </S.JettonContent>
      </S.Jetton>

      {separator && !borderEnd ? <Separator /> : null}
    </S.JettonWrap>
  );
};

export const TokenListItem = memo(TokenListItemComponent);
