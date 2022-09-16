import React from 'react';
import { InputItemRef } from './ImportWalletForm.interface';
import { LayoutChangeEvent } from 'react-native';
import { isAndroid } from '$utils';
import { InputContentSize } from '$uikit/Input/Input.interface';

export function useInputsRegistry() {
  const refs = React.useRef<{ [key in string]: InputItemRef }>({});
  const positions = React.useRef<{ [key in string]: number }>({});
  const contentWidth = React.useRef<{ [key in string]: number }>({});

  const setRef = React.useCallback(
    (index: number) => (el: InputItemRef) => {
      refs.current[`input-${index}`] = el;
    },
    [],
  );

  const getRef = React.useCallback((index: number) => {
    return refs.current[`input-${index}`];
  }, []);

  const setPosition = React.useCallback(
    (index: number) => (ev: LayoutChangeEvent) => {
      positions.current[`input-${index}`] = ev.nativeEvent.layout.y;
    },
    [],
  );

  const getPosition = React.useCallback((index: number) => {
    return positions.current[`input-${index}`] ?? 0;
  }, []);

  const setContentWidth = React.useCallback(
    (index: number, notify: (width: number) => void) =>
      (contentSize: InputContentSize) => {
        const width = contentSize.width;
        contentWidth.current[`input-${index}`] = width;
        notify(width);
      },
    [],
  );

  const getContentWidth = React.useCallback((index: number) => {
    return isAndroid ? 0 : contentWidth.current[`input-${index}`] ?? 0;
  }, []);

  return {
    refs: refs.current,
    setRef,
    getRef,
    setPosition,
    getPosition,
    getContentWidth,
    setContentWidth,
  };
}
