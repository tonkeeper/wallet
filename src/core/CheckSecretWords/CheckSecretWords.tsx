import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import * as _ from 'lodash';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch, useSelector } from 'react-redux';
import { TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TapGestureHandler } from 'react-native-gesture-handler';

import * as CreateWalletStyle from '../CreateWallet/CreateWallet.style';
import { Button, Input, NavBar, NavBarHelper, Text } from '$uikit';
import { ns, parseLockupConfig } from '$utils';
import { walletGeneratedVaultSelector } from '$store/wallet';
import * as S from './CheckSecretWords.style';
import { useTranslator } from '$hooks';
import { css } from '$styled';
import { NavBarHeight } from '$shared/constants';
import { openCreatePin } from '$navigation';
import { toastActions } from '$store/toast';

export const CheckSecretWords: FC = () => {
  const dispatch = useDispatch();
  const t = useTranslator();
  const generatedVault = useSelector(walletGeneratedVaultSelector);
  const word2Ref = useRef<TextInput>(null);
  const word3Ref = useRef<TextInput>(null);
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();

  const [word1, setWord1] = useState('');
  const [word2, setWord2] = useState('');
  const [word3, setWord3] = useState('');
  const [failed, setFailed] = useState<{ [index: number]: boolean }>({});
  const [isConfigInputShown, setConfigInputShown] = useState(false);
  const [config, setConfig] = useState('');

  const words = useMemo(() => {
    return generatedVault!.mnemonic.split(' ');
  }, [generatedVault]);

  const data = useMemo(() => {
    let result = [];
    const countInGroup = 8;
    for (let i = 0; i < 3; i++) {
      result.push(_.random(1, 8, false) + i * countInGroup);
    }

    return result;
  }, []);

  const validateInputWord = useCallback(
    (index: number, text: string, failedCopy?: { [index: number]: boolean }) => {
      if (!failedCopy) {
        failedCopy = { ...failed };
      }

      failedCopy[index] = text.length > 0 && words[data[index] - 1] !== text;
      setFailed(failedCopy);

      return failedCopy;
    },
    [failed, words, data],
  );

  const handleWord1Submit = useCallback(() => {
    word2Ref.current?.focus();
  }, [word2Ref]);

  const handleWord2Submit = useCallback(() => {
    word3Ref.current?.focus();
  }, [word3Ref]);

  const isCanSend = useMemo(() => {
    // if (words[data[0] - 1] !== word1) {
    //   return false;
    // }
    //
    // if (words[data[1] - 1] !== word2) {
    //   return false;
    // }
    //
    // if (words[data[2] - 1] !== word3) {
    //   return false;
    // }

    return word1.length > 0 && word2.length > 0 && word3.length > 0;
  }, [word1, word2, word3]);

  const handleChangeWord1 = useCallback(
    (value) => {
      setWord1(value.trim());

      if (failed[0]) {
        validateInputWord(0, value.trim());
      }
    },
    [setWord1, validateInputWord, failed],
  );

  const handleChangeWord2 = useCallback(
    (value) => {
      setWord2(value.trim());

      if (failed[1]) {
        validateInputWord(1, value.trim());
      }
    },
    [setWord2, validateInputWord, failed],
  );

  const handleChangeWord3 = useCallback(
    (value) => {
      setWord3(value.trim());

      if (failed[2]) {
        validateInputWord(2, value.trim());
      }
    },
    [setWord3, validateInputWord, failed],
  );

  const handleSubmit = useCallback(() => {
    if (!isCanSend) {
      return;
    }

    let failedCopy = { ...failed };
    failedCopy = validateInputWord(0, word1, failedCopy);
    failedCopy = validateInputWord(1, word2, failedCopy);
    failedCopy = validateInputWord(2, word3, failedCopy);

    const hasFailed = Object.values(failedCopy).filter((item) => !!item).length > 0;
    if (hasFailed) {
      dispatch(toastActions.fail(t('import_wallet_wrong_words_err')));
      return;
    }

    let configParsed: any = null;
    if (isConfigInputShown && config) {
      try {
        configParsed = parseLockupConfig(config);
      } catch (e) {
        dispatch(toastActions.fail(`Lockup: ${e.message}`));
        return;
      }

      generatedVault!.setConfig(configParsed);
    }

    openCreatePin();
  }, [
    isCanSend,
    failed,
    validateInputWord,
    word1,
    word2,
    word3,
    isConfigInputShown,
    config,
    dispatch,
    t,
    generatedVault,
  ]);

  const handleBlur = useCallback(
    (index: number) => () => {
      let text = '';
      if (index === 0) {
        text = word1;
      } else if (index === 1) {
        text = word2;
      } else {
        text = word3;
      }

      validateInputWord(index, text);
    },
    [validateInputWord, word1, word2, word3],
  );

  const handleShowConfigInput = useCallback(() => {
    setConfigInputShown(true);
  }, []);

  const handleConfigChange = useCallback((text) => {
    setConfig(text);
  }, []);

  function renderContent() {
    return (
      <KeyboardAwareScrollView
        extraScrollHeight={topInset + ns(NavBarHeight)}
        contentContainerStyle={{
          paddingHorizontal: ns(32),
          paddingBottom: ns(32) + bottomInset,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <NavBarHelper />
        <TapGestureHandler numberOfTaps={5} onActivated={handleShowConfigInput}>
          <S.HeaderTitle>
            {t('check_words_title')}
          </S.HeaderTitle>
        </TapGestureHandler>
        <CreateWalletStyle.CaptionWrapper>
          <Text variant="body1" color="foregroundSecondary" textAlign="center">
            {t('check_words_caption', {
              wordNum1: data[0],
              wordNum2: data[1],
              wordNum3: data[2],
            })}
          </Text>
        </CreateWalletStyle.CaptionWrapper>
        <S.Inputs>
          {isConfigInputShown && (
            <Input
              wrapperStyle={css`
                margin-bottom: ${ns(16)};
              `}
              placeholder="Put config here"
              multiline
              value={config}
              onChangeText={handleConfigChange}
            />
          )}
          <S.InputWrap style={{ marginTop: 0 }}>
            <S.InputNumber>{data[0]}:</S.InputNumber>
            <Input
              wrapperStyle={css`
                padding-left: ${ns(56)}px;
              `}
              returnKeyType="next"
              autoFocus
              onSubmitEditing={handleWord1Submit}
              onChangeText={handleChangeWord1}
              value={word1}
              autoCapitalize="none"
              isFailed={failed[0]}
              onBlur={handleBlur(0)}
            />
          </S.InputWrap>
          <S.InputWrap>
            <S.InputNumber>{data[1]}:</S.InputNumber>
            <Input
              innerRef={word2Ref}
              wrapperStyle={css`
                padding-left: ${ns(56)}px;
              `}
              returnKeyType="next"
              onSubmitEditing={handleWord2Submit}
              onChangeText={handleChangeWord2}
              value={word2}
              autoCapitalize="none"
              isFailed={failed[1]}
              onBlur={handleBlur(1)}
            />
          </S.InputWrap>
          <S.InputWrap>
            <S.InputNumber>{data[2]}:</S.InputNumber>
            <Input
              innerRef={word3Ref}
              wrapperStyle={css`
                padding-left: ${ns(56)}px;
              `}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              onChangeText={handleChangeWord3}
              value={word3}
              autoCapitalize="none"
              isFailed={failed[2]}
              onBlur={handleBlur(2)}
            />
          </S.InputWrap>
        </S.Inputs>
        <Button disabled={!isCanSend} onPress={handleSubmit}>
          {t('continue')}
        </Button>
      </KeyboardAwareScrollView>
    );
  }

  return (
    <>
      <NavBar isTransparent />
      {renderContent()}
    </>
  );
};
