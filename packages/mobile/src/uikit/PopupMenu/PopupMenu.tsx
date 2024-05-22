import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, View } from 'react-native';
import { Separator } from '../Separator/Separator';
import { Highlight } from '../Highlight/Highlight';
import { delay, deviceHeight, Memo, ns } from '$utils';
import * as S from './PopupMenu.style';
import { usePopupAnimation, SCALE_DURATION } from '../PopupSelect/usePopupAnimation';
import { PopupMenuProps, PopupMenuItemProps } from '../PopupMenu/PopupMenu.interface';
import { Text } from '../Text/Text';

export const PopupMenuItem = Memo(
  ({
    icon,
    onPress,
    text,
    onCloseMenu,
    shouldCloseMenu,
    waitForAnimationEnd,
  }: PopupMenuItemProps) => {
    return (
      <View style={{ flex: 0 }}>
        <Highlight
          onPress={async () => {
            shouldCloseMenu && onCloseMenu?.();
            // wait for animation end
            waitForAnimationEnd && (await delay(SCALE_DURATION + 50));
            onPress && onPress();
          }}
          background="backgroundQuaternary"
        >
          <S.Item>
            <S.ItemCont>
              <Text variant="label1">{text}</Text>
            </S.ItemCont>
            <S.ItemCheckedWrap>{icon}</S.ItemCheckedWrap>
          </S.Item>
        </Highlight>
      </View>
    );
  },
);

export function PopupMenuComponent(props: PopupMenuProps) {
  const { children, items, width = 160 } = props;
  const [visible, setVisible] = useState(false);
  const childrenRef = useRef<View>(null);
  const offsetTop = useRef(0);

  const popupHeight = useMemo(() => {
    const maxHeight = deviceHeight - offsetTop.current - 32;
    const height = ns(47.5 * items.length) + 0.5;
    return Math.min(height, maxHeight);
  }, [items.length]);

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
    measure(() => {
      setVisible(true);
    });
  }, []);

  const handleClose = useCallback(() => {
    popupAnimation.close(() => {
      setVisible(false);
    });
  }, []);

  const childrenPrepared = useMemo(() => {
    return React.cloneElement(children, {
      onPress: () => handleOpen(),
    });
  }, [children, handleOpen]);

  const itemsPrepared = useMemo(() => {
    return items.map((item) =>
      React.cloneElement(item, {
        onCloseMenu: () => handleClose(),
      }),
    );
  }, [items, handleClose]);

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
        <S.Overlay onPress={handleClose} />
        <S.Wrap width={width} style={[{ top: offsetTop.current }, popupAnimation.style]}>
          <S.Content>
            {itemsPrepared.map((item, index, arr) => (
              <View key={index}>
                {item}
                {arr.length !== index + 1 && <Separator />}
              </View>
            ))}
          </S.Content>
        </S.Wrap>
      </Modal>
    </>
  );
}

export const PopupMenu = Memo(PopupMenuComponent);
