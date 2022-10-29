import { SendRecipient } from '../../../../Send.interface';
import { useTranslator } from '$hooks';
import { openScanQR } from '$navigation';
import { WordHintsPopupRef } from '$shared/components/ImportWalletForm/WordHintsPopup';
import { Icon, Input, Loader, Text } from '$uikit';
import { isAndroid, isValidAddress, maskifyAddress, ns, parseTonLink } from '$utils';
import React, {
  FC,
  memo,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { LayoutChangeEvent, TextInput } from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as S from './AddressInput.style';
import { useDispatch } from 'react-redux';
import { toastActions } from '$store/toast';
import { InputContentSize } from '$uikit/Input/Input.interface';

interface Props {
  wordHintsRef: RefObject<WordHintsPopupRef>;
  shouldFocus: boolean;
  recipient: SendRecipient | null;
  dnsLoading: boolean;
  editable: boolean;
  updateRecipient: (value: string) => Promise<boolean>;
  onSubmit: () => void;
}

const AddressInputComponent: FC<Props> = (props) => {
  const {
    wordHintsRef,
    shouldFocus,
    recipient,
    dnsLoading,
    editable,
    updateRecipient,
    onSubmit,
  } = props;

  const [value, setValue] = useState(
    recipient?.name || recipient?.domain || recipient?.address || '',
  );
  const inputValue = useRef(value);

  const [showFailed, setShowFailed] = useState(true);

  const isFailed = showFailed && !dnsLoading && value.length > 0 && !recipient;

  const canScanQR = value.length === 0;

  const t = useTranslator();

  const dispatch = useDispatch();

  const textInputRef = useRef<TextInput>(null);

  const updateHints = useCallback(() => {
    const offsetTop = S.INPUT_HEIGHT + ns(isAndroid ? 20 : 16);
    const offsetLeft = ns(-16);

    wordHintsRef.current?.search({
      input: 0,
      query: inputValue.current,
      offsetTop,
      offsetLeft,
      onItemPress: (name: string) => {
        updateRecipient(name);
      },
    });
  }, [updateRecipient, wordHintsRef]);

  const handleChangeValue = useCallback(
    (newValue: string) => {
      if (!editable) {
        return;
      }

      setValue(newValue.trim());

      inputValue.current = newValue.trim();

      updateHints();

      updateRecipient(newValue.trim());
    },
    [editable, updateHints, updateRecipient],
  );

  const handleBlur = useCallback(() => {
    wordHintsRef.current?.clear();
  }, [wordHintsRef]);

  const handleSubmit = useCallback(() => {
    const hint = wordHintsRef.current?.getCurrentSuggests()?.[0];

    if (hint) {
      updateRecipient(hint);
      return;
    }

    onSubmit();
  }, [onSubmit, updateRecipient, wordHintsRef]);

  const contentWidth = useSharedValue(0);
  const inputWidth = useSharedValue(0);
  const infoWidth = useSharedValue(0);

  const handleContentSizeChange = useCallback(
    (contentSize: InputContentSize) => {
      contentWidth.value = contentSize.width;
    },
    [contentWidth],
  );

  const handleInputLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const width = event.nativeEvent.layout.width;

      inputWidth.value = width;
    },
    [inputWidth],
  );

  const handleInfoLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const width = event.nativeEvent.layout.width;

      infoWidth.value = width;
    },
    [infoWidth],
  );

  const handleScanQR = useCallback(() => {
    openScanQR(async (code: string) => {
      const link = parseTonLink(code);

      if (link.match && link.operation === 'transfer' && !isValidAddress(link.address)) {
        dispatch(toastActions.fail(t('transfer_deeplink_address_error')));
        return false;
      }

      return await updateRecipient(code);
    });
  }, [dispatch, t, updateRecipient]);

  const scanQRContainerStyle = useAnimatedStyle(
    () => ({
      opacity: withTiming(canScanQR ? 1 : 0, { duration: 150 }),
      zIndex: canScanQR ? 1 : -1,
    }),
    [canScanQR],
  );

  const loadingContainerStyle = useAnimatedStyle(
    () => ({
      opacity: withTiming(dnsLoading ? 1 : 0, { duration: 150 }),
      zIndex: dnsLoading ? 1 : -1,
    }),
    [dnsLoading],
  );

  const infoContainerStyle = useAnimatedStyle(() => {
    const visible =
      !!recipient && inputWidth.value - contentWidth.value - infoWidth.value > -5;

    return {
      opacity: withTiming(visible ? 1 : 0, { duration: 200 }),
      transform: [{ translateX: contentWidth.value }],
    };
  }, [recipient]);

  useEffect(() => {
    if (!recipient) {
      const isFocused = textInputRef.current?.isFocused();

      setValue((s) => (isFocused ? s : ''));

      return;
    }

    const { name, domain, address } = recipient;

    const nextValue = name || domain || address;

    setValue(nextValue);

    inputValue.current = nextValue;

    wordHintsRef.current?.clear();
  }, [recipient, wordHintsRef]);

  const preparedAddress =
    recipient && (recipient.name || recipient.domain)
      ? maskifyAddress(recipient.address)
      : '';

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;

      if (shouldFocus) {
        const timeoutId = setTimeout(() => {
          textInputRef.current?.focus();
        }, 400);

        return () => clearTimeout(timeoutId);
      }
    }

    if (shouldFocus) {
      textInputRef.current?.focus();
      return;
    }

    const timeoutId = setTimeout(() => {
      textInputRef.current?.blur();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [shouldFocus]);

  useEffect(() => {
    setShowFailed(false);

    const timeoutId = setTimeout(() => {
      setShowFailed(true);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [value]);

  return (
    <S.InputContainer>
      <Input
        value={value}
        onChangeText={handleChangeValue}
        onBlur={handleBlur}
        onFocus={updateHints}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleInputLayout}
        placeholder={t('send_address_placeholder')}
        innerRef={textInputRef}
        autoComplete="off"
        returnKeyType="next"
        autoCapitalize="none"
        textContentType="none"
        editable={editable}
        autoCorrect={false}
        spellCheck={false}
        onSubmitEditing={handleSubmit}
        multiline
        isFailed={isFailed}
        blurOnSubmit
      />
      <S.LoaderContainer style={loadingContainerStyle} pointerEvents="none">
        <Loader size="medium" />
      </S.LoaderContainer>
      <S.ScanQRContainer style={scanQRContainerStyle}>
        <S.ScanQRTouchable disabled={!canScanQR} onPress={handleScanQR}>
          <Icon name="ic-viewfinder-28" color="accentPrimary" />
        </S.ScanQRTouchable>
      </S.ScanQRContainer>
      <S.InfoContainer
        style={infoContainerStyle}
        onLayout={handleInfoLayout}
        pointerEvents="none"
      >
        <Text color="foregroundSecondary">{preparedAddress}</Text>
      </S.InfoContainer>
    </S.InputContainer>
  );
};

export const AddressInput = memo(AddressInputComponent);
