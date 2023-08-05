import { SearchSuggestSource } from '$core/DAppsSearch/types';
import { Icon, Separator } from '$uikit';
import { getDomainFromURL, getUrlTitle } from '$utils';
import axios from 'axios';
import React, { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import * as S from './SearchSuggestCell.style';
import { t } from '@tonkeeper/shared/i18n';
import { trackEvent } from '$utils/stats';

interface Props {
  url: string;
  source: SearchSuggestSource;
  name?: string;
  icon?: string;
  separator: boolean;
  selected: boolean;
  onPress?: (url: string) => void;
}

const SearchSuggestCellComponent: FC<Props> = (props) => {
  const { url, source, name, icon, separator, selected, onPress } = props;

  const [fetchedTitle, setFetchedTitle] = useState('');

  const lastFetchedUrl = useRef('');

  const handlePress = useCallback(() => {
    if ([SearchSuggestSource.APP, SearchSuggestSource.HISTORY].includes(source)) {
      trackEvent('click_dapp', { url, name });
    }

    onPress?.(url);
  }, [source, onPress, url, name]);

  useEffect(() => {
    if (source === SearchSuggestSource.DIRECT_LINK) {
      let cancelTokenSource = axios.CancelToken.source();

      if (getDomainFromURL(lastFetchedUrl.current) !== getDomainFromURL(url)) {
        setFetchedTitle('');
      }

      const fetchTitle = async () => {
        try {
          const title = await getUrlTitle(url, cancelTokenSource);

          setFetchedTitle(title);
          lastFetchedUrl.current = url;
        } catch {}
      };

      fetchTitle();

      return () => {
        cancelTokenSource.cancel();
      };
    }
  }, [source, url]);

  return (
    <>
      <S.CellContainer selected={selected}>
        <S.Cell
          background={selected ? 'backgroundQuaternary' : 'backgroundTertiary'}
          onPress={handlePress}
        >
          <S.Container>
            <S.IconContainer>
              {icon ? (
                <S.Icon source={{ uri: icon }} />
              ) : (
                <Icon name="ic-link-bold-16" color="foregroundSecondary" />
              )}
            </S.IconContainer>
            <S.Content>
              <S.Title>{fetchedTitle || name || t('browser.open_link')}</S.Title>
              <S.SubTitle>{url}</S.SubTitle>
            </S.Content>
          </S.Container>
        </S.Cell>
      </S.CellContainer>
      {separator ? <Separator /> : null}
    </>
  );
};

export const SearchSuggestCell = memo(SearchSuggestCellComponent);
