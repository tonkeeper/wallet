import React, { useCallback, useMemo, useState } from 'react';
import { SectionList } from 'react-native';

import {
  RoundedSectionListItem,
  RoundedSectionListProps,
} from '../RoundedSectionList/RoundedSectionList.interface';
import { InlineHeader } from '../InlineHeader/InlineHeader';
import { Separator } from '../Separator/Separator'
import { RADIUS } from '$styled';
import { ns } from '$utils';
import * as S from './RoundedSectionList.style';
import Animated from 'react-native-reanimated';

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

export function RoundedSectionList<T extends RoundedSectionListItem>(
  props: RoundedSectionListProps<T>,
): React.ReactElement<RoundedSectionListProps<T>> {
  const {
    sections,
    renderItem,
    onScroll,
    onItemPress,
    contentContainerStyle = {},
  } = props;
  const [pressedIndex, setPressedIndex] = useState(-1);

  const handlePressIn = useCallback(
    (index: number) => () => {
      setPressedIndex(index);
    },
    [],
  );

  const handlePressOut = useCallback(() => {
    setPressedIndex(-1);
  }, []);

  const handlePress = useCallback(
    (item: T) => () => {
      onItemPress && onItemPress(item);
    },
    [onItemPress],
  );

  const preparedSections = useMemo(() => {
    return sections.map((item, index) => ({
      ...item,
      index,
    }));
  }, [sections]);

  return (
    <AnimatedSectionList
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{
        paddingHorizontal: ns(16),
        ...contentContainerStyle,
      }}
      sections={preparedSections}
      keyExtractor={(item) => item.key}
      extraData
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index, section }) => {
        let showSep = index > 0;
        if (pressedIndex === index || (pressedIndex > -1 && pressedIndex + 1 === index)) {
          showSep = false;
        }

        const style: any = {};
        if (index === 0) {
          style.borderTopLeftRadius = ns(RADIUS.normal);
          style.borderTopRightRadius = ns(RADIUS.normal);
        }

        if (section.data.length - 1 === index) {
          style.borderBottomLeftRadius = ns(RADIUS.normal);
          style.borderBottomRightRadius = ns(RADIUS.normal);
        }

        return (
          <S.ItemWrap
            onPressIn={handlePressIn(index)}
            onPressOut={handlePressOut}
            onPress={handlePress(item)}
            style={style}
          >
            <>
              {renderItem(item, index)}
              {showSep && <Separator absolute toTop />}
            </>
          </S.ItemWrap>
        );
      }}
      renderSectionHeader={({ section: { title, index } }) => {
        if (!title) {
          return null;
        }

        return <InlineHeader skipMargin={index === 0}>{title}</InlineHeader>;
      }}
    />
  );
}
