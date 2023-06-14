import { List } from '$uikit/List/old/List';
import React, { FC, memo } from 'react';
import { ISearchSuggest } from '../../types';
import { SearchSuggestCell } from '../SearchSuggestCell/SearchSuggestCell';
import * as S from './SearchSuggests.style';

interface Props {
  items: ISearchSuggest[];
  onPressSuggest: (url: string) => void;
}

export const SearchSuggestsComponent: FC<Props> = (props) => {
  const { items, onPressSuggest } = props;

  if (items.length === 0) {
    return null;
  }

  return (
    <S.Container>
      <List separator={false}>
        {items.map((item, index) => (
          <SearchSuggestCell
            key={index}
            separator={index < items.length - 1}
            source={item.source}
            icon={item.icon}
            name={item.name}
            url={item.url}
            selected={index === 0}
            onPress={onPressSuggest}
          />
        ))}
      </List>
    </S.Container>
  );
};

export const SearchSuggests = memo(SearchSuggestsComponent);
