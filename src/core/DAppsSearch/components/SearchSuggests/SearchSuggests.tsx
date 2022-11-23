import { List } from '$uikit';
import React, { FC, memo } from 'react';
import { ISearchSuggest } from '../../types';
import { SearchSuggestCell } from '../SearchSuggestCell/SearchSuggestCell';

interface Props {
  items: ISearchSuggest[];
  onPressSuggest: (url: string, name?: string) => void;
}

export const SearchSuggestsComponent: FC<Props> = (props) => {
  const { items, onPressSuggest } = props;

  return (
    <List separator={false}>
      {items.map((item, index) => (
        <SearchSuggestCell
          key={`${item.url}_${item.name}`}
          separator={index < items.length - 1}
          icon={item.icon}
          name={item.name}
          url={item.url}
          selected={index === 0}
          onPress={onPressSuggest}
        />
      ))}
    </List>
  );
};

export const SearchSuggests = memo(SearchSuggestsComponent);
