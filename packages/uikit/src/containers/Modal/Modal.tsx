// import { ModalBehaviorContext } from '../../context/ModalBehaviorContext';

import { ScreenModalScrollView } from './ScreenModal/ScreenModalScrollView';
import { ScreenModalContent } from './ScreenModal/ScreenModalContent';
import { ScreenModalFooter } from './ScreenModal/ScreenModalFooter';
import { ScreenModalHeader } from './ScreenModal/ScreenModalHeader';
import { ScreenModalInput } from './ScreenModal/ScreenModalInput';
import { ScreenModal } from './ScreenModal/ScreenModal';

// import { SheetModalScrollView } from './SheetModal/SheetModalScrollView';
// import { SheetModalContent } from './SheetModal/SheetModalContent';
// import { SheetModalFooter } from './SheetModal/SheetModalFooter';
// import { SheetModalHeader } from './SheetModal/SheetModalHeader';
// import { SheetModalInput } from './SheetModal/SheetModalInput';
// import { SheetModal } from './SheetModal/SheetModal';

import {
  ModalContentProps,
  ModalFooterProps,
  ModalHeaderProps,
  ModalProps,
  ModalRef,
  ModalScrollViewProps,
  ModalScrollViewRef,
  ModalTextInputProps,
  ModalTextInputRef,
} from './Modal.types';

import { ElementType, forwardRef, memo, useContext } from 'react';

type CreateModalOptions = {
  sheet: ElementType;
  screen: ElementType;
};

function createModalComponent<TProps, TRef = any>(options: CreateModalOptions) {
  return memo(
    forwardRef<TRef, TProps>((props, ref) => {
      const behavior = null//useContext(ModalBehaviorContext);

      const Component = options.screen;//behavior === 'sheet' ? options.sheet : options.screen;

      return <Component ref={ref} {...props} />;
    }),
  );
}

const Container = createModalComponent<ModalProps, ModalRef>({
  screen: ScreenModal,
  // sheet: SheetModal,
});

const Header = createModalComponent<ModalHeaderProps>({
  screen: ScreenModalHeader,
  // sheet: SheetModalHeader,
});

const Content = createModalComponent<ModalContentProps>({
  screen: ScreenModalContent,
  // sheet: SheetModalContent,
});

const ScrollView = createModalComponent<ModalScrollViewProps, ModalScrollViewRef>({
  screen: ScreenModalScrollView,
  // sheet: SheetModalScrollView,
});

const Footer = createModalComponent<ModalFooterProps>({
  screen: ScreenModalFooter,
  // sheet: SheetModalFooter,
});

const Input = createModalComponent<ModalTextInputProps, ModalTextInputRef>({
  screen: ScreenModalInput,
  // sheet: SheetModalInput,
});

export const Modal = Object.assign(Container, {
  ScrollView,
  Content,
  Header,
  Footer,
  Input,
});
