import { SheetModalInputProps, SheetModalInputRef } from './SheetModal/SheetModalInput';
import { SheetModalProps, SheetModalRef } from './SheetModal/SheetModal';
import { SheetModalContentProps } from './SheetModal/SheetModalContent';
import { SheetModalFooterProps } from './SheetModal/SheetModalFooter';
import { SheetModalHeaderProps } from './SheetModal/SheetModalHeader';

import {
  SheetModalScrollViewProps,
  SheetModalScrollViewRef,
} from './SheetModal/SheetModalScrollView';
import { ScreenModalHeaderProps } from './ScreenModal/ScreenModalHeader';
import { ScreenModalProps } from './ScreenModal/ScreenModal';

export type ModalProps = SheetModalProps | ScreenModalProps;
export type ModalRef = SheetModalRef;

export type ModalHeaderProps = SheetModalHeaderProps & ScreenModalHeaderProps;

export type ModalContentProps = SheetModalContentProps;

export type ModalScrollViewProps = SheetModalScrollViewProps;
export type ModalScrollViewRef = SheetModalScrollViewRef;

export type ModalTextInputProps = SheetModalInputProps;
export type ModalTextInputRef = SheetModalInputRef;

export type ModalFooterProps = SheetModalFooterProps;
