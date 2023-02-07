import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, View } from 'react-native';
import { Separator } from '$uikit/Separator/Separator';
import { Highlight } from '$uikit/Highlight/Highlight';
import { deviceHeight, Memo, ns } from '$utils';
import * as S from './PopupMenu.style';
import { usePopupAnimation } from '$uikit/PopupSelect/usePopupAnimation';
import { PopupMenuProps, PopupMenuItemProps } from '$uikit/PopupMenu/PopupMenu.interface';
import { Text } from '$uikit/Text/Text';

export const PopupMenuItem = Memo(({ icon, onPress, text }: PopupMenuItemProps) => {
  return (
    <View style={{ flex: 0 }}>
      <Highlight onPress={() => onPress && onPress()} background="backgroundQuaternary">
        <S.Item>
          <S.ItemCont>
            <Text variant="label1">{text}</Text>
          </S.ItemCont>
          <S.ItemCheckedWrap>{icon}</S.ItemCheckedWrap>
        </S.Item>
      </Highlight>
    </View>
  );
});

export function PopupMenuComponent(props: PopupMenuProps) {
  const { children, items } = props;
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
    width: ns(160),
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
        <S.Wrap style={[{ top: offsetTop.current }, popupAnimation.style]}>
          <S.Content>
            {items.map((item, index, arr) => (
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
