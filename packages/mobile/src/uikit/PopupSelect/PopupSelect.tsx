import React, {
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
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
} from '../PopupSelect/PopupSelect.interface';
import { Separator } from '../Separator/Separator';
import { Highlight } from '../Highlight/Highlight';
import { Icon } from '../Icon/Icon';
import { deviceHeight, isAndroid, Memo, ns, triggerSelection } from '$utils';
import { usePopupAnimation } from './usePopupAnimation';
import * as S from './PopupSelect.style';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { FullWindowOverlay } from 'react-native-screens';
import { useDimensions } from '$hooks/useDimensions';
import { PortalOrigin } from '@alexzunik/rn-native-portals-reborn';
import { FlatList } from 'react-native-gesture-handler';

const ScreenWidth = Dimensions.get('window').width;
// We should add extra-width for iPhone mini and SE
const SMALL_DEVICES_WIDTH = 375;

export const PopupSelectItem = Memo(
  ({
    children,
    onPress,
    value,
    icon,
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
            ns(checked ? 32 : 0) +
            ns(icon ? 32 : 0),
        );
      },
      [autoWidth, checked, icon, onChangeWidth],
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
          <S.ItemIconWrap>
            {checked && <Icon name="ic-done-16" color="accentPrimary" />}
            {icon && <Icon name={icon} color="accentPrimary" />}
          </S.ItemIconWrap>
        </S.Item>
      </Highlight>
    );
  },
);

const PopupContainer: FC<{
  children: ReactNode;
  asFullWindowOverlay?: boolean;
  visible: boolean;
}> = ({ asFullWindowOverlay, children, visible }) => {
  const { window } = useDimensions();

  if (asFullWindowOverlay) {
    return isAndroid ? (
      <PortalOrigin destination={visible ? 'popupPortal' : null}>
        <View
          style={{ width: window.width, height: window.height, position: 'absolute' }}
          pointerEvents={visible ? 'auto' : 'none'}
        >
          {children}
        </View>
      </PortalOrigin>
    ) : (
      <FullWindowOverlay>
        <View
          style={{ width: window.width, height: window.height }}
          pointerEvents={visible ? 'auto' : 'none'}
        >
          {children}
        </View>
      </FullWindowOverlay>
    );
  }

  return (
    <Modal animationType="none" transparent visible={visible}>
      {children}
    </Modal>
  );
};

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
    maxHeight,
    scrollY,
    anchor = 'top-right',
    top = 0,
    asFullWindowOverlay,
  } = props;
  const [visible, setVisible] = useState(false);
  const childrenRef = useRef<View>(null);
  const tabBarHeight = useContext(BottomTabBarHeightContext);
  const offsetTop = useRef(0);

  const flatListRef = useRef<FlatList>(null);

  const scrollYBefore = useSharedValue(0);

  const popupHeight = useMemo(() => {
    const max = deviceHeight - offsetTop.current - (tabBarHeight || 0) - 32;
    const height = ns(47.5 * items.length) + 0.5;
    return maxHeight ? Math.min(height, max, maxHeight) : Math.min(height, max);
  }, [items.length, tabBarHeight, maxHeight]);

  const [width, setWidth] = useState(autoWidth ? 0 : initialWidth);

  const popupAnimation = usePopupAnimation({
    anchor: anchor,
    height: popupHeight,
    width: ns(width),
  });

  const measure = useCallback((onDone: () => void) => {
    childrenRef.current?.measureInWindow((x, y) => {
      offsetTop.current = y + top;
      onDone();
    });
  }, []);

  useEffect(() => {
    if (visible) {
      popupAnimation.open();
      if (asFullWindowOverlay) {
        const index = items.findIndex((v) => v === selected);
        if (index > -1) {
          flatListRef.current?.scrollToIndex({
            index,
            animated: false,
            viewOffset: popupHeight - ns(47),
          });
        }
      }
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
      <PopupContainer asFullWindowOverlay={asFullWindowOverlay} visible={visible}>
        <S.Overlay onPress={() => handleClose()}>
          <Animated.View style={scrollCompensationStyle}>
            <S.Wrap
              anchor={anchor}
              style={[{ top: offsetTop.current, width: ns(width) }, popupAnimation.style]}
            >
              <S.Content>
                <FlatList
                  onScrollToIndexFailed={({ index, averageItemLength }) => {
                    // Layout doesn't know the exact location of the requested element.
                    // Falling back to calculating the destination manually
                    flatListRef.current?.scrollToOffset({
                      offset: index * averageItemLength,
                      animated: true,
                    });
                  }}
                  initialNumToRender={40} // fix for scrollToIndex error
                  ref={flatListRef}
                  data={items}
                  keyExtractor={keyExtractor}
                  alwaysBounceVertical={false}
                  ItemSeparatorComponent={() => <Separator />}
                  showsVerticalScrollIndicator={false}
                  keyboardDismissMode="none"
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item, index }) => (
                    <PopupSelectItem
                      icon={item.icon}
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
      </PopupContainer>
    </>
  );
}

export const PopupSelect = Memo(PopupSelectComponent);
