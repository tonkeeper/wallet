import { Text } from '$uikit';
import { ns } from '$utils';
import React, { FC, memo, useCallback, useState } from 'react';
import { LayoutChangeEvent, LayoutRectangle, ScrollViewProps } from 'react-native';
import { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import * as S from './TopTabs.style';
import { ScrollView } from 'react-native';

interface TabItem {
  id: string;
  title: string;
}

interface Props {
  tabs: TabItem[];
  selectedId: string;
  onChange: (tab: string) => void;
}

const INDICATOR_WIDTH = ns(24);

const TopTabsComponent = React.forwardRef<ScrollView, Props>((props, ref) => {
  const { tabs, selectedId, onChange } = props;

  const [tabsLayouts, setTabsLayouts] = useState<{ [key: string]: LayoutRectangle }>({});

  const handleLayout = useCallback((tab: string, event: LayoutChangeEvent) => {
    const layout = event?.nativeEvent?.layout;

    if (layout) {
      setTabsLayouts((s) => ({ ...s, [tab]: layout }));
    }
  }, []);

  const handleTabPress = useCallback(
    (tab: TabItem) => {
      onChange(tab.id);
    },
    [onChange],
  );

  const indicatorAnimatedStyle = useAnimatedStyle(() => {
    const layout = tabsLayouts[selectedId];

    if (!layout) {
      return {
        opacity: 0,
      };
    }

    const x = layout.x + (layout.width / 2 - INDICATOR_WIDTH / 2);

    return {
      transform: [
        {
          translateX: withSpring(x, {
            damping: 15,
            mass: 0.1,
          }),
        },
      ],
      opacity: withTiming(1),
    };
  }, [tabsLayouts, selectedId]);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} ref={ref}>
      <S.Container>
        {tabs.map((tab) => (
          <S.TabItem
            key={tab.id}
            onLayout={(event) => handleLayout(tab.id, event)}
            onPress={() => handleTabPress(tab)}
          >
            <Text
              color={tab.id === selectedId ? 'foregroundPrimary' : 'foregroundSecondary'}
              variant="label1"
            >
              {tab.title}
            </Text>
          </S.TabItem>
        ))}
        <S.Indicator style={indicatorAnimatedStyle} pointerEvents="none" />
      </S.Container>
    </ScrollView>
  );
});

export const TopTabs = memo(TopTabsComponent);