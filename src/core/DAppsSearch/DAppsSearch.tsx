import { useTranslator } from '$hooks';
import { goBack, openDAppBrowser } from '$navigation';
import { IsTablet, LargeNavBarHeight } from '$shared/constants';
import { Button, ScrollHandler, Text } from '$uikit';
import { hNs, ns } from '$utils';
import React, { FC, memo, useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchBar, SearchSuggests } from './components';
import { WebSearchSuggests } from './components/WebSearchSuggests/WebSearchSuggests';
import * as S from './DAppsSearch.style';
import { useSearchSuggests } from './hooks/useSearchSuggests';
import { useWebSearchSuggests } from './hooks/useWebSearchSuggests';

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
  const contentAnimation = useSharedValue(0);

  const t = useTranslator();

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
    const suggest = getFirstSuggest() || getFirstWebSuggest();

    if (suggest) {
      openUrl(suggest.url);
    }
  }, [getFirstSuggest, getFirstWebSuggest, openUrl]);

  const handleScrollViewLayout = useCallback(
    (event: LayoutChangeEvent) => {
      scrollViewHeight.value = event.nativeEvent.layout.height;
    },
    [scrollViewHeight],
  );

  const emptyContainerStyle = useAnimatedStyle(() => ({
    height: scrollViewHeight.value,
  }));

  const scrollViewContentStyle = useAnimatedStyle(() => ({
    opacity: contentAnimation.value,
  }));

  useEffect(() => {
    contentAnimation.value = withDelay(150, withTiming(1));
  }, [contentAnimation]);

  const emptyText =
    query.trim().length === 0 ? t('browser.start_typing') : t('browser.empty_search');

  const hasSuggests =
    query.length > 0 && (searchSuggests.length > 0 || webSearchSuggests.length > 0);

  return (
    <S.Container bottomInset={bottomInset}>
      <S.KeyboardAvoidView>
        <S.Content>
          <ScrollHandler
            navBarTitle={t('browser.title')}
            navBarRight={
              <Button onPress={goBack} mode="secondary" size="navbar_small">
                {t('cancel')}
              </Button>
            }
            isLargeNavBar
          >
            <Animated.ScrollView
              showsVerticalScrollIndicator={false}
              // eslint-disable-next-line react-native/no-inline-styles
              contentContainerStyle={{
                paddingTop: hNs(LargeNavBarHeight),
                paddingHorizontal: ns(16),
                alignItems: IsTablet ? 'center' : undefined,
              }}
              scrollEventThrottle={16}
              onLayout={handleScrollViewLayout}
              keyboardDismissMode="none"
              keyboardShouldPersistTaps="always"
            >
              <Animated.View style={scrollViewContentStyle}>
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
              </Animated.View>
            </Animated.ScrollView>
          </ScrollHandler>
        </S.Content>
        <SearchBar query={query} setQuery={setQuery} onSubmit={handleSearchBarSubmit} />
      </S.KeyboardAvoidView>
    </S.Container>
  );
};

export const DAppsSearch = memo(DAppsSearchComponent);
