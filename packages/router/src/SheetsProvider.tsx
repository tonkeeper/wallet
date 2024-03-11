import React from 'react';
import { nanoid } from '@reduxjs/toolkit';
import { SheetMeasurements, useSheetMeasurements } from './useSheetMeasurements';
import { useNavigation } from '@react-navigation/native';
import { Keyboard } from 'react-native';
import { ModalBehaviorContext } from './context/ModalBehaviorContext';
import { isAndroid } from './utils/constants';

export type BottomSheetRefs = {
  scrollRef?: React.MutableRefObject<HTMLDivElement>;
};

export type SheetParams = Record<string, any>;

export enum SheetActions {
  REPLACE = 'REPLACE',
  ADD = 'ADD',
}

export type SheetInitialState = 'opened' | 'closed';

export type SheetStackParams = {
  path: string;
  params: SheetParams;
  initialState?: SheetInitialState;
  component: React.ComponentType;
};

export type SheetStack = SheetStackParams & {
  id: string;
  initialState: SheetInitialState;
};

export type SheetStackList = SheetStack[];

export type SheetContextValue = BottomSheetRefs &
  SheetMeasurements & {
    id: string;
    initialState: SheetInitialState;
    delegateMethods: (methods: SheetMethods) => void;
    removeFromStack: () => void;
    close: () => void;
    onClose?: (() => void) | null;
  };

export type SheetStackDispatchAction =
  | {
      type: 'ADD';
      id: string;
      path: string;
      params: SheetParams;
      component: React.ComponentType;
      initialState?: SheetInitialState;
    }
  | {
      type: 'REMOVE';
      id: string;
    }
  | {
      type: 'REMOVE_ALL';
    };

const SheetDispatchContext =
  React.createContext<React.Dispatch<SheetStackDispatchAction> | null>(null);
const SheetContext = React.createContext<SheetContextValue | null>(null);

function SheetReducer(stack: SheetStackList, action: SheetStackDispatchAction) {
  switch (action.type) {
    case 'ADD':
      return [
        ...stack,
        {
          initialState: action.initialState ?? 'opened',
          path: action.path,
          params: action.params,
          component: action.component,
          id: action.id,
        },
      ];
    case 'REMOVE':
      return stack.filter((item) => item.id !== action.id);
    case 'REMOVE_ALL':
      return [];
  }
}

const useSheetRefs = () => {
  const refs = React.useRef(new Map<string, SheetInternalRef>());

  const setRef = React.useCallback(
    (id: string) => (el: SheetInternalRef) => {
      refs.current.set(id, el);
    },
    [],
  );

  const removeRef = React.useCallback((id: string) => {
    refs.current.delete(id);
  }, []);

  const getRef = React.useCallback((id: string) => {
    return refs.current.get(id);
  }, []);

  const getLastRef = React.useCallback(() => {
    return Array.from(refs.current)[refs.current.size - 1]?.[1];
  }, []);

  return {
    getLastRef,
    removeRef,
    setRef,
    getRef,
  };
};

type SheetsProviderParams = {
  component: React.ComponentType<any>;
  $$action: SheetActions;
  params: Record<string, any>;
  path: string;
};

export type SheetsProviderRef = {
  replaceStack: (stack: SheetStackParams) => void;
  addStack: (stack: SheetStackParams) => void;
};

export const SheetsProvider = React.memo(
  React.forwardRef<SheetsProviderRef, any>((props, ref) => {
    const nav = useNavigation();
    const sheetsRegistry = useSheetRefs();
    const [stack, dispatch] = React.useReducer(SheetReducer, []);
    const removeFromStack = React.useCallback(
      (id: string, noGoBack?: boolean) => {
        if (noGoBack) {
          dispatch({ type: 'REMOVE', id });
          sheetsRegistry.removeRef(id);
        } else {
          nav.goBack();
        }
      },
      [stack],
    );

    const replaceStack = React.useCallback(async (stack: SheetStackParams) => {
      const modalId = addStack({ ...stack, initialState: 'closed' });
      const lastSheet = sheetsRegistry.getLastRef();

      if (lastSheet) {
        if (!isAndroid) {
          Keyboard.dismiss();
        }
        lastSheet.close(() => {
          sheetsRegistry.getRef(modalId)?.present();
        });
      }
    }, []);

    const addStack = (stack: SheetStackParams) => {
      const id = nanoid();
      dispatch({
        initialState: stack.initialState,
        component: stack.component,
        params: stack.params,
        path: stack.path,
        type: 'ADD',
        id,
      });

      return id;
    };

    React.useImperativeHandle(ref, () => ({
      replaceStack,
      addStack,
    }));

    return (
      <SheetDispatchContext.Provider value={dispatch}>
        {stack.map((item) => (
          <SheetInternal
            ref={sheetsRegistry.setRef(item.id)}
            removeFromStack={removeFromStack}
            key={`sheet-${item.id}`}
            item={item}
          />
        ))}
      </SheetDispatchContext.Provider>
    );
  }),
);

interface SheetInternalProps {
  removeFromStack: (id: string, noGoBack?: boolean) => void;
  item: SheetStack;
}

type SheetInternalRef = {
  close: (onClosed?: () => void) => void;
  present: () => void;
};

type SheetMethods = {
  present: () => void;
  close: () => void;
};

const SheetInternal = React.forwardRef<SheetInternalRef, SheetInternalProps>(
  (props, ref) => {
    const closedSheetCallback = React.useRef<(() => void) | null>(null);
    const delegatedMethods = React.useRef<SheetMethods | null>(null);
    const measurements = useSheetMeasurements();

    const delegateMethods = (methods: SheetMethods) => {
      delegatedMethods.current = methods;
    };

    const removeFromStack = () => {
      if (closedSheetCallback.current) {
        closedSheetCallback.current();
        props.removeFromStack(props.item.id, true);
      } else {
        props.removeFromStack(props.item.id);
      }
    };

    const close = () => {
      if (!isAndroid) {
        Keyboard.dismiss();
      }

      if (delegatedMethods.current) {
        delegatedMethods.current.close();
      } else {
        removeFromStack();
      }
    };

    React.useImperativeHandle(
      ref,
      () => ({
        present: () => {
          delegatedMethods.current?.present();
        },
        close: (onClosed) => {
          if (onClosed) {
            closedSheetCallback.current = onClosed;
          }

          close();
        },
      }),
      [close],
    );

    const value: SheetContextValue = {
      ...measurements,
      initialState: props.item.initialState,
      id: props.item.id,
      delegateMethods,
      removeFromStack,
      close,
      onClose: closedSheetCallback.current,
    };

    const SheetComponent = props.item.component;

    return (
      <ModalBehaviorContext.Provider value="sheet">
        <SheetContext.Provider value={value}>
          <SheetComponent {...props.item.params} />
        </SheetContext.Provider>
      </ModalBehaviorContext.Provider>
    );
  },
);

export const useSheetInternal = () => {
  const sheet = React.useContext(SheetContext);

  if (!sheet) {
    throw new Error('No SheetProvier');
  }

  return sheet;
};

export const useCloseModal = () => {
  const sheet = React.useContext(SheetContext);
  return sheet?.close;
};
