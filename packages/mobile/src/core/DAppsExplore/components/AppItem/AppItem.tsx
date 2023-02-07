import { APPS_ITEMS_IN_ROW } from '$core/DAppsExplore/constants';
import React, { FC, memo, ReactNode } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import * as S from './AppItem.style';

interface Props {
  name: string;
  index?: number;
  iconUri?: string;
  icon?: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
}

const AppItemComponent: FC<Props> = (props) => {
  const { index, name, iconUri, icon, onPress, onLongPress } = props;

  const withoutMargin = index === undefined || (index + 1) % APPS_ITEMS_IN_ROW === 0;

  return (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
      <S.Container withoutMargin={withoutMargin}>
        <S.IconContainer>
          {iconUri ? <S.Icon source={{ uri: iconUri }} /> : icon}
        </S.IconContainer>
        <S.Title numberOfLines={1}>{name}</S.Title>
      </S.Container>
    </TouchableOpacity>
  );
};

export const AppItem = memo(AppItemComponent);
