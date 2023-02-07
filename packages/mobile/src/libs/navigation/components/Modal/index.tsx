import React from 'react';

import { ModalBehaviorContext } from '../../context/ModalBehaviorContext';

import { ModalContainer } from './Native/ModalContainer';
import { ModalContent } from './Native/ModalContent';
import { ModalFooter } from './Native/ModalFooter';
import { ModalHeader } from './Native/ModalHeader';
import { ModalInput } from './Native/ModalInput';
import { ModalScrollView } from './Native/ModalScrollView';

import { SheetScrollView } from './Sheet/SheetScrollView';
import { SheetContainer } from './Sheet/SheetContainer';
import { SheetContent } from './Sheet/SheetContent';
import { SheetFooter } from './Sheet/SheetFooter';
import { SheetHeader } from './Sheet/SheetHeader';
import { SheetInput } from './Sheet/SheetInput';

import { ModalContentProps, ModalFooterProps, ModalHeaderProps, ModalProps, ModalRef, ModalScrollViewProps, ModalScrollViewRef, ModalTextInputProps, ModalTextInputRef } from './types';

function createModalComponent<TProps, TRef = any>({ sheet, modal }: any) {
  return React.memo(React.forwardRef<TRef, TProps>((props, ref) => {
    const behavior = React.useContext(ModalBehaviorContext);

    const Component = behavior === 'sheet' ? sheet : modal;

    return <Component ref={ref} {...props} />;
  }));
};

const Container = createModalComponent<ModalProps, ModalRef>({
  sheet: SheetContainer,
  modal: ModalContainer
});

const Header = createModalComponent<ModalHeaderProps>({
  sheet: SheetHeader,
  modal: ModalHeader,
});

const Content = createModalComponent<ModalContentProps>({
  sheet: SheetContent,
  modal: ModalContent,
});

const ScrollView = createModalComponent<ModalScrollViewProps, ModalScrollViewRef>({
  sheet: SheetScrollView,
  modal: ModalScrollView,
});


const Footer = createModalComponent<ModalFooterProps>({
  sheet: SheetFooter,
  modal: ModalFooter,
});

const Input = createModalComponent<ModalTextInputProps, ModalTextInputRef>({
  sheet: SheetInput,
  modal: ModalInput,
});

export const Modal = Object.assign(Container, {
  ScrollView,
  Content,
  Header,
  Footer,
  Input,
});
