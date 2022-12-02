import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  FlatList,
  LayoutChangeEvent,
  Modal,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import {
  PopupSelectItemProps,
  PopupSelectProps,
} from '$uikit/PopupSelect/PopupSelect.interface';
import { Separator } from '$uikit/Separator/Separator';
import { Highlight } from '$uikit/Highlight/Highlight';
import { Icon } from '$uikit/Icon/Icon';
import { deviceHeight, isAndroid, Memo, ns, triggerSelection } from '$utils';
import { usePopupAnimation } from './usePopupAnimation';
import * as S from './PopupSelect.style';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

const ScreenWidth = Dimensions.get('window').width;
// We should add extra-width for iPhone mini and SE
const SMALL_DEVICES_WIDTH = 375;

export const PopupSelectItem = Memo(
  ({
    children,
    onPress,
    value,
    checked,
    autoWidth,
    onChangeWidth,
  }: PopupSelectItemProps) => {
    const onLayout = useCallback(
      (e: LayoutChangeEvent) => {
        if (!autoWidth) {
          return;
        }

        onChangeWidth?.(
          e.nativeEvent.layout.width +
            ns(isAndroid ? 14 : ScreenWidth <= SMALL_DEVICES_WIDTH ? 6 : 0) +
            ns(checked ? 32 : 0),
        );
      },
      [autoWidth, checked, onChangeWidth],
    );

    const contentContainerStyle = useMemo(
      (): StyleProp<ViewStyle> =>
        autoWidth
          ? {
              width: 1000,
              overflow: 'visible',
              alignItems: 'flex-start',
            }
          : {},
      [autoWidth],
    );

    return (
      <Highlight
        onPress={() => onPress && onPress(value)}
        background="backgroundQuaternary"
      >
        <S.Item>
          <View style={contentContainerStyle}>
            <S.ItemCont onLayout={onLayout}>{children}</S.ItemCont>
          </View>
          <S.ItemCheckedWrap>
            {checked && <Icon name="ic-done-16" color="accentPrimary" />}
          </S.ItemCheckedWrap>
        </S.Item>
      </Highlight>
    );
  },
);

export function PopupSelectComponent<T>(props: PopupSelectProps<T>) {
  const {
    children,
    onChange,
    items,
    selected = false,
    renderItem,
    keyExtractor,
    width: initialWidth = 160,
    autoWidth = false,
    minWidth,
    scrollY,
  } = props;
  const [visible, setVisible] = useState(false);
  const childrenRef = useRef<View>(null);
  const tabBarHeight = useContext(BottomTabBarHeightContext);
  const offsetTop = useRef(0);

  const scrollYBefore = useSharedValue(0);

  const popupHeight = useMemo(() => {
    const maxHeight = deviceHeight - offsetTop.current - (tabBarHeight || 0) - 32;
    const height = ns(47.5 * items.length) + 0.5;
    return Math.min(height, maxHeight);
  }, [items.length, tabBarHeight]);

  const [width, setWidth] = useState(autoWidth ? 0 : initialWidth);

  const popupAnimation = usePopupAnimation({
    anchor: 'top-right',
    height: popupHeight,
    width: ns(width),
  });

  const measure = useCallback((onDone: () => void) => {
    childrenRef.current?.measureInWindow((x, y) => {
      offsetTop.current = y;
      onDone();
    });
  }, []);

  useEffect(() => {
    if (visible) {
      popupAnimation.open();
    }
  }, [visible]);

  const handleOpen = useCallback(() => {
    scrollYBefore.value = scrollY?.value || 0;
    measure(() => {
      setVisible(true);
    });
  }, []);

  const handleClose = useCallback((callback?: () => void) => {
    popupAnimation.close(() => {
      setVisible(false);
      callback?.();
    });
  }, []);

  const handlePressChildren = useCallback(() => {
    children.props?.onPress?.();

    handleOpen();
  }, [children, handleOpen]);

  const childrenPrepared = useMemo(() => {
    return React.cloneElement(children, {
      onPress: handlePressChildren,
    });
  }, [children, handlePressChildren]);

  const handleChangeWidth = useCallback(
    (w: number) => {
      if (!autoWidth) {
        return;
      }

      const min = minWidth || 0;

      setWidth((s) => Math.max(s, w, min));
    },
    [autoWidth, minWidth],
  );

  const scrollCompensationStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollYBefore.value - (scrollY?.value || 0) }],
  }));

  return (
    <>
      <View
        ref={childrenRef}
        style={{ zIndex: 3 }} // fix for highlight
        collapsable={false} // fix measureInWindow on Android
      >
        {childrenPrepared}
      </View>

      <Modal animationType="none" transparent visible={visible}>
        <S.Overlay onPress={() => handleClose()}>
          <Animated.View style={scrollCompensationStyle}>
            <S.Wrap
              style={[{ top: offsetTop.current, width: ns(width) }, popupAnimation.style]}
            >
              <S.Content>
                <FlatList
                  data={items}
                  keyExtractor={keyExtractor}
                  alwaysBounceVertical={false}
                  ItemSeparatorComponent={() => <Separator />}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item, index }) => (
                    <PopupSelectItem
                      checked={item === selected}
                      value={item}
                      onPress={(value) => {
                        triggerSelection();
                        handleClose(() => {
                          onChange(value);
                        });
                      }}
                      autoWidth={autoWidth}
                      onChangeWidth={handleChangeWidth}
                    >
                      {renderItem(item, index)}
                    </PopupSelectItem>
                  )}
                />
              </S.Content>
            </S.Wrap>
          </Animated.View>
        </S.Overlay>
      </Modal>
    </>
  );
}

export const PopupSelect = Memo(PopupSelectComponent);
