import { useTranslator } from '$hooks';
import { List } from '$uikit';
import React, { FC, memo } from 'react';
import { IWebSearchSuggest } from '../../types';
import { SectionLabel } from '../SectionLabel/SectionLabel';
import { WebSearchSuggestCell } from '../WebSearchSuggestCell/WebSearchSuggestCell';

interface Props {
  items: IWebSearchSuggest[];
  active: boolean;
  onPressSuggest: (url: string, name?: string) => void;
}

export const WebSearchSuggestsComponent: FC<Props> = (props) => {
  const { items, active, onPressSuggest } = props;

  const t = useTranslator();

  return (
    <>
      <SectionLabel>{t('browser.web_search_title')}</SectionLabel>
      <List separator={false}>
        {items.map((item, index) => (
          <WebSearchSuggestCell
            key={index}
            separator={index < items.length - 1}
            name={item.title}
            url={item.url}
            selected={active && index === 0}
            onPress={onPressSuggest}
          />
        ))}
      </List>
    </>
  );
};

export const WebSearchSuggests = memo(WebSearchSuggestsComponent);
