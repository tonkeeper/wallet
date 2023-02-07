import React, { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheetBehavior from 'reanimated-bottom-sheet';
import Animated from 'react-native-reanimated';

import { ns, statusBarHeight } from '$utils';
import { Header } from './Header/Header';
import { Content } from './Content/Content';
import { BottomSheetProps, BottomSheetRef } from './BottomSheet.interface';
import * as HeaderS from './Header/Header.style';
import { Icon } from '$uikit/Icon/Icon';
import { useReanimatedKeyboardHeight } from '$hooks';

export const BottomSheet = React.forwardRef<BottomSheetRef, BottomSheetProps>(
  (props, ref) => {
    const {
      children,
      title,
      triggerClose,
      usePopAction = false,
      skipHeader = false,
      skipDismissButton = false,
      indentBottom = true,
      onOpened,
      onCloseEnd,
      onClosePress,
    } = props;

    const { keyboardHeightStyle } = useReanimatedKeyboardHeight();

    const { top } = useSafeAreaInsets();
    const { height: deviceHeight } = useWindowDimensions();
    const navigation = useNavigation<any>();
    const closeTimer = useRef<any>(0);
    const onCloseDone = useRef<(() => void) | null>(null);
    const [isOpened, setOpened] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);

    React.useImperativeHandle(ref, () => ({
      close(onDone) {
        if (onDone) {
          onCloseDone.current = onDone;
        }

        handleClose();
      },
    }));

    const snapPoints = useMemo(() => {
      if (contentHeight === 0) {
        return [0, deviceHeight * 0.6];
      }

      if (!props.skipCheckSnapPoints && contentHeight >= deviceHeight * 0.8) {
        const fullOpeningPoint = deviceHeight - top - statusBarHeight;
        const maxSnap =
          contentHeight > fullOpeningPoint ? fullOpeningPoint : contentHeight;

        return [0, deviceHeight * 0.6, maxSnap];
      }

      return [0, 0, contentHeight];
    }, [props.skipCheckSnapPoints, contentHeight, deviceHeight, top]);

    const bottomSheetRef = useRef<BottomSheetBehavior>(null);
    const fall = useRef(new Animated.Value(1)).current;

    const handleOpenEnd = useCallback(() => {
      setOpened(true);

      if (onOpened) {
        onOpened();
      }
    }, [onOpened]);

    const hideNavigationModal = useCallback(() => {
      if (!isOpened) {
        return;
      }
      clearTimeout(closeTimer.current);
      if (usePopAction) {
        navigation.pop();
      } else {
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      }

      if (onCloseDone.current) {
        onCloseDone.current();
        onCloseDone.current = null;
      }
    }, [navigation, usePopAction, closeTimer, isOpened]);

    const handleCloseEnd = useCallback(() => {
      hideNavigationModal();
      onCloseEnd?.();
    }, [hideNavigationModal, onCloseEnd]);

    const handleClose = useCallback(() => {
      bottomSheetRef.current?.snapTo(0);
      onClosePress?.();
      closeTimer.current = setTimeout(() => {
        if (usePopAction) {
          navigation.pop();
        } else {
          if (navigation.canGoBack()) {
            navigation.goBack();
          }
        }
        if (onCloseDone.current) {
          onCloseDone.current();
          onCloseDone.current = null;
        }
      }, 500);
    }, [navigation, usePopAction, onClosePress]);

    useEffect(() => {
      if (contentHeight > 0) {
        const index = snapPoints[1] === 0 ? 2 : 1;
        bottomSheetRef.current?.snapTo(index);
      }
    }, [contentHeight, snapPoints]);

    const prevTriggerClose = useRef(triggerClose);
    useEffect(() => {
      if (triggerClose !== prevTriggerClose.current) {
        handleClose();
      }
    }, [handleClose, triggerClose]);

    const handleLayout = useCallback(
      (event) => {
        const height = event.nativeEvent.layout.height;

        if (height > 0) {
          setContentHeight(height + (skipHeader ? 0 : ns(64)));
        }
      },
      [skipHeader],
    );

    return (
      <Animated.View style={keyboardHeightStyle}>
        <View style={{ height: '100%' }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleClose}
            style={StyleSheet.absoluteFillObject}
          >
            <Animated.View
              style={{
                flex: 1,
                backgroundColor: '#000',
                opacity: fall.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.72, 0],
                }),
              }}
            />
          </TouchableOpacity>
          <BottomSheetBehavior
            callbackNode={fall}
            ref={bottomSheetRef}
            snapPoints={snapPoints}
            onOpenEnd={handleOpenEnd}
            onCloseEnd={handleCloseEnd}
            enabledContentTapInteraction={false}
            renderHeader={() =>
              skipHeader ? null : (
                <Header
                  title={title}
                  onClose={handleClose}
                  skipDismissButton={skipDismissButton}
                />
              )
            }
            renderContent={() => (
              <View onLayout={handleLayout}>
                {skipHeader && (
                  <HeaderS.HeaderCloseButtonWrap onPress={handleClose}>
                    <HeaderS.HeaderCloseButton>
                      <Icon name="ic-close-16" color="foregroundPrimary" />
                    </HeaderS.HeaderCloseButton>
                  </HeaderS.HeaderCloseButtonWrap>
                )}
                <Content onClose={handleClose} skipHeader={skipHeader} indentBottom={indentBottom}>
                  {children}
                </Content>
              </View>
            )}
          />
        </View>
      </Animated.View>
    );
  },
);
