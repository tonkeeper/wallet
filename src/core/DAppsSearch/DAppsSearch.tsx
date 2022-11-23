import { useReanimatedKeyboardHeight, useTranslator } from '$hooks';
import { goBack, openDAppBrowser } from '$navigation';
import { IsTablet, LargeNavBarHeight } from '$shared/constants';
import { Button, ScrollHandler, Text } from '$uikit';
import { hNs, isValidUrl, ns } from '$utils';
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
import * as S from './DAppsSearch.style';
import { useSearchSuggests } from './hooks/useSearchSuggests';

export interface DAppsSearchProps {
  initialQuery?: string;
  onOpenUrl?: (url: string, name?: string) => void;
}

const DAppsSearchComponent: FC<DAppsSearchProps> = (props) => {
  const { initialQuery, onOpenUrl } = props;

  const [query, setQuery] = useState(initialQuery || '');

  const { searchSuggests, getFirstSuggest } = useSearchSuggests(query);

  const { keyboardHeightStyle } = useReanimatedKeyboardHeight({ animated: false });

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

  const handleSearchBarSubmit = useCallback(
    (value: string) => {
      if (isValidUrl(value)) {
        openUrl(value);
        return;
      }

      const suggest = getFirstSuggest();

      if (suggest) {
        openUrl(suggest.url);
      }
    },
    [getFirstSuggest, openUrl],
  );

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

  return (
    <S.Container style={keyboardHeightStyle}>
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
              {searchSuggests.length > 0 ? (
                <SearchSuggests items={searchSuggests} onPressSuggest={openUrl} />
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
      <S.SearchBarContainer bottomInset={bottomInset}>
        <SearchBar query={query} setQuery={setQuery} onSubmit={handleSearchBarSubmit} />
      </S.SearchBarContainer>
    </S.Container>
  );
};

export const DAppsSearch = memo(DAppsSearchComponent);
