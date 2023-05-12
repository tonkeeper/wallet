import React from 'react';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { FlatList } from 'react-native';
import { Separator } from '$uikit/Separator/Separator';
import { Highlight } from '$uikit/Highlight/Highlight';
import { usePopupAnimation } from '$uikit/PopupSelect/usePopupAnimation';
import * as S from './ImportWalletForm.style';
import { Text } from '$uikit';
import { ns, SearchIndexer } from '$utils';

interface WordHintsPopup {
  indexedWords: SearchIndexer<string>;
  scrollY: Animated.SharedValue<number>;
}

type WordHintsSearchOptions = {
  input: number;
  query: string;
  offsetTop: number;
  offsetLeft: number;
  onItemPress: (value: string) => void;
};

export type WordHintsPopupRef = {
  search: (options: WordHintsSearchOptions) => void;
  setOffsetLeft: (input: number, value: number) => void;
  clear: () => void;
  getCurrentSuggests: () => string[];
};

type OnItemPressFunc = (value: string) => void;

export const WordHintsPopup = React.forwardRef<WordHintsPopupRef, WordHintsPopup>(
  (props, ref) => {
    const { scrollY, indexedWords } = props;
    const [results, setResults] = React.useState<string[]>([]);
    const onItemPressFunc = React.useRef<OnItemPressFunc | undefined>();
    const isOffsetLeftFrozen = React.useRef(false);
    const curInput = React.useRef(-1);
    const offsetTop = useSharedValue(0);
    const offsetLeft = useSharedValue(0);

    const popupAnimation = usePopupAnimation({
      anchor: 'top-left',
      width: ns(160),
      height: Math.min(48 * results.length, S.HINTS_MAX_HEIGHT),
    });

    React.useImperativeHandle(ref, () => ({
      setOffsetLeft,
      search(options) {
        curInput.current = options.input;
        offsetTop.value = options.offsetTop;

        setOffsetLeft(options.input, options.offsetLeft);
        onItemPressFunc.current = options.onItemPress;

        const hints = indexedWords
          .search(options.query, 6)
          .sort((a, b) => {
            const preparedQuery = options.query.toLowerCase().replace(/\s/g, '');
            const aMatch = a.toLowerCase().replace(/\s/g, '').includes(preparedQuery);
            const bMatch = b.toLowerCase().replace(/\s/g, '').includes(preparedQuery);
            if (aMatch && !bMatch) {
              return -1;
            }
            if (bMatch && !aMatch) {
              return 1;
            }

            return 0;
          })
          .slice(0, 3);

        const fullMatch = hints.some((item) => item === options.query);

        if (hints.length > 0 && !fullMatch) {
          setResults(hints);
          popupAnimation.open();
        } else {
          popupAnimation.close(() => {
            setResults([]);
          });
        }
      },
      clear() {
        popupAnimation.close(() => {
          setResults([]);
          offsetTop.value = 0;
          offsetLeft.value = 0;
          onItemPressFunc.current = undefined;
          isOffsetLeftFrozen.current = false;
        });
      },
      getCurrentSuggests() {
        return results;
      },
    }));

    const setOffsetLeft = (input: number, value: number) => {
      if (curInput.current === input && !isOffsetLeftFrozen.current) {
        offsetLeft.value = value;
      }
    };

    const handleItemPress = (item: string) => {
      isOffsetLeftFrozen.current = true;
      onItemPressFunc.current?.(item);
      popupAnimation.close();
    };

    const wrapStyle = useAnimatedStyle(() => ({
      top: offsetTop.value,
      left: offsetLeft.value,
      transform: [{ translateY: -scrollY.value }],
    }));

    return (
      <S.Container style={wrapStyle} pointerEvents={results.length > 0 ? 'auto' : 'none'}>
        <S.WordHintsWrap style={popupAnimation.style}>
          <FlatList
            scrollEnabled={false}
            data={results}
            alwaysBounceVertical={false}
            keyExtractor={(item) => `word-hint-item-${item}`}
            ItemSeparatorComponent={() => <Separator />}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Highlight
                background="backgroundQuaternary"
                onPress={() => handleItemPress(item)}
              >
                <S.WordHintsItem>
                  <Text variant="label1" numberOfLines={1}>
                    {item}
                  </Text>
                </S.WordHintsItem>
              </Highlight>
            )}
          />
        </S.WordHintsWrap>
      </S.Container>
    );
  },
);
