import { openDAppBrowser } from '$navigation';
import { IsTablet, NavBarHeight } from '$shared/constants';
import { Button, ScrollHandler, Text } from '$uikit';
import { ns } from '$utils';
import React, { FC, memo, useCallback, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchBar, SearchSuggests } from './components';
import { WebSearchSuggests } from './components/WebSearchSuggests/WebSearchSuggests';
import * as S from './DAppsSearch.style';
import { useSearchSuggests } from './hooks/useSearchSuggests';
import { useWebSearchSuggests } from './hooks/useWebSearchSuggests';
import { SearchSuggestSource } from './types';
import { goBack } from '$navigation/imperative';
import { t } from '@tonkeeper/shared/i18n';
import { trackEvent } from '$utils/stats';

export interface DAppsSearchProps {
  initialQuery?: string;
  onOpenUrl?: (url: string) => void;
}

const DAppsSearchComponent: FC<DAppsSearchProps> = (props) => {
  const { initialQuery, onOpenUrl } = props;

  const [query, setQuery] = useState(initialQuery || '');

  const { searchSuggests, getFirstSuggest } = useSearchSuggests(query);
  const { webSearchSuggests, getFirstWebSuggest } = useWebSearchSuggests(query);

  const { bottom: bottomInset } = useSafeAreaInsets();

  const scrollViewHeight = useSharedValue(0);

  const openUrl = useCallback(
    (url: string) => {
      if (onOpenUrl) {
        onOpenUrl(url);
        goBack();
      }

      openDAppBrowser(url);
    },
    [onOpenUrl],
  );

  const handleSearchBarSubmit = useCallback(() => {
    const suggest = getFirstSuggest();

    if (suggest) {
      if (
        [SearchSuggestSource.APP, SearchSuggestSource.HISTORY].includes(suggest.source)
      ) {
        trackEvent('click_dapp', { url: suggest.url, name: suggest.name });
      }

      openUrl(suggest.url);

      return;
    }

    const webSearchSuggest = getFirstWebSuggest();

    if (webSearchSuggest) {
      openUrl(webSearchSuggest.url);
    }
  }, [getFirstSuggest, getFirstWebSuggest, openUrl]);

  const handleScrollViewLayout = useCallback(
    (event: LayoutChangeEvent) => {
      scrollViewHeight.value = event.nativeEvent.layout.height + NavBarHeight;
    },
    [scrollViewHeight],
  );

  const emptyContainerStyle = useAnimatedStyle(() => ({
    height: scrollViewHeight.value,
  }));

  const emptyText =
    query.trim().length === 0 ? t('browser.start_typing') : t('browser.empty_search');

  const hasSuggests =
    query.length > 0 && (searchSuggests.length > 0 || webSearchSuggests.length > 0);

  return (
    <S.Container bottomInset={bottomInset}>
      <S.Responder onPress={goBack} accessible={false}>
        <S.KeyboardAvoidView>
          <S.Content>
            <ScrollHandler
              navBarTitle={t('browser.title')}
              navBarRight={
                <S.NavBarButtonContainer>
                  <Button onPress={goBack} mode="secondary" size="navbar_small">
                    {t('cancel')}
                  </Button>
                </S.NavBarButtonContainer>
              }
              isLargeNavBar={false}
              hideBackButton
            >
              <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                // eslint-disable-next-line react-native/no-inline-styles
                contentContainerStyle={{
                  paddingHorizontal: IsTablet ? 0 : ns(16),
                  paddingTop: IsTablet ? ns(8) : 0,
                }}
                scrollEventThrottle={16}
                onLayout={handleScrollViewLayout}
                keyboardDismissMode="none"
                keyboardShouldPersistTaps="always"
              >
                {hasSuggests ? (
                  <>
                    <SearchSuggests items={searchSuggests} onPressSuggest={openUrl} />
                    <WebSearchSuggests
                      items={webSearchSuggests}
                      active={searchSuggests.length === 0}
                      onPressSuggest={openUrl}
                    />
                  </>
                ) : (
                  <S.EmptyContainer style={emptyContainerStyle}>
                    <Text color="foregroundTertiary" textAlign="center">
                      {emptyText}
                    </Text>
                  </S.EmptyContainer>
                )}
              </Animated.ScrollView>
            </ScrollHandler>
          </S.Content>
          <S.SearchBarWrapper>
            <S.SearchBarContent>
              <SearchBar
                query={query}
                setQuery={setQuery}
                onSubmit={handleSearchBarSubmit}
              />
            </S.SearchBarContent>
          </S.SearchBarWrapper>
        </S.KeyboardAvoidView>
      </S.Responder>
    </S.Container>
  );
};

export const DAppsSearch = memo(DAppsSearchComponent);
