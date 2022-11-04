import { StepScrollView } from '$core/Send/StepScrollView/StepScrollView';
import { useCopyText, useReanimatedKeyboardHeight, useTranslator } from '$hooks';
import { openInactiveInfo } from '$navigation';
import { BottomButtonWrap, BottomButtonWrapHelper } from '$shared/components';
import { CryptoCurrencies, CryptoCurrency, Decimals } from '$shared/constants';
import { getTokenConfig } from '$shared/dynamicConfig';
import { Button, FormItem, Icon, Input, List, ListCell, Text } from '$uikit';
import { maskifyAddress, ns, parseLocaleNumber } from '$utils';
import { formatCryptoCurrency } from '$utils/currency';
import React, {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ConfirmStepProps } from './ConfirmStep.interface';
import * as S from './ConfirmStep.style';
import BigNumber from 'bignumber.js';
import { useAnimatedScrollHandler } from 'react-native-reanimated';
import { SendSteps } from '$core/Send/Send.interface';
import { TextInput } from 'react-native-gesture-handler';

const ConfirmStepComponent: FC<ConfirmStepProps> = (props) => {
  const {
    stepsScrollTop,
    active,
    currency,
    currencyTitle,
    recipient,
    recipientAccountInfo,
    decimals,
    isJetton,
    fee,
    isInactive,
    isSending,
    amount,
    comment,
    setComment,
    onConfirm,
  } = props;

  const { keyboardHeightStyle } = useReanimatedKeyboardHeight();

  const t = useTranslator();

  const copyText = useCopyText();

  const scrollHandler = useAnimatedScrollHandler((event) => {
    stepsScrollTop.value = {
      ...stepsScrollTop.value,
      [SendSteps.CONFIRM]: event.contentOffset.y,
    };
  });

  const feeCurrency = useMemo(() => {
    const tokenConfig = getTokenConfig(currency as CryptoCurrency);
    if (tokenConfig && tokenConfig.blockchain === 'ethereum') {
      return CryptoCurrencies.Eth;
    } else if (isJetton) {
      return CryptoCurrencies.Ton;
    } else {
      return currency;
    }
  }, [currency, isJetton]);

  const feeValue = useMemo(() => {
    if (fee === '0') {
      return `? ${feeCurrency.toUpperCase()}`;
    }

    return `≈ ${formatCryptoCurrency(fee, feeCurrency, Decimals[feeCurrency])}`;
  }, [fee, feeCurrency]);

  const amountValue = useMemo(() => {
    if (amount.all && !isJetton) {
      return `≈ ${formatCryptoCurrency(
        new BigNumber(parseLocaleNumber(amount.value)).minus(fee).toString(),
        currencyTitle,
        decimals,
      )}`;
    }

    return formatCryptoCurrency(parseLocaleNumber(amount.value), currencyTitle, decimals);
  }, [amount.all, amount.value, currencyTitle, decimals, fee, isJetton]);

  /*
    Динамически ограничиваем максимальную длину текста, равную одной ячейке в тон формате (1023 бита)
    Это решает проблему мерцающего инпута, которая была при асинхронном хэндлинге введённого коммента
   */
  const dynamicMaxLength = useMemo(() => {
    const maxLength = 122;
    // eslint-disable-next-line no-undef
    const commentBits = new TextEncoder().encode(comment).length * 8;
    const calculatedMaxLength = Math.trunc(
      maxLength - Math.min(61, commentBits - comment.length * 8),
    );

    return calculatedMaxLength;
  }, [comment]);

  const handleCopy = useCallback(() => {
    if (!recipient) {
      return;
    }

    copyText(recipient.address, t('address_copied'));
  }, [copyText, recipient, t]);

  const renderChevron = useCallback(({ isPressed }) => {
    return (
      <S.ChevronWrap>
        <Icon
          color={!isPressed ? 'foregroundPrimary' : 'foregroundSecondary'}
          name="ic-chevron-right-12"
        />
      </S.ChevronWrap>
    );
  }, []);

  const detailsLabel = amount.all
    ? t('send_screen_steps.comfirm.details_max_balance_label', {
        currency: currencyTitle,
      })
    : t('send_screen_steps.comfirm.details_label');

  const detailsIndicator = amount.all ? (
    <S.WarningIconWrapper>
      <Icon name="ic-warning-28" color="foregroundPrimary" />
    </S.WarningIconWrapper>
  ) : undefined;

  const commentInputRef = useRef<TextInput>(null);

  const [commentRequiredError, setCommentRequiredError] = useState(false);

  const isCommentRequired = !!recipientAccountInfo?.memoRequired;

  const commentError = comment.length > dynamicMaxLength;

  const commentCharactersLeftCount = dynamicMaxLength - comment.length;

  const commentCharactersExceededCount = comment.length - dynamicMaxLength;

  const commentCharactersLeftText =
    commentCharactersLeftCount >= 0 && commentCharactersLeftCount < 25
      ? t('send_screen_steps.comfirm.comment_characters_left', {
          count: commentCharactersLeftCount,
        })
      : null;

  const commentCharactersExceededText =
    commentCharactersExceededCount > 0
      ? t('send_screen_steps.comfirm.comment_characters_exceeded', {
          count: commentCharactersExceededCount,
        })
      : null;

  const commentDescription = (
    <Text color="foregroundSecondary" variant="body2">
      {isCommentRequired ? (
        <Text variant="body2" color="accentOrange">
          {t('send_screen_steps.comfirm.comment_required_text')}
        </Text>
      ) : null}
      {t('send_screen_steps.comfirm.comment_description')}
      {commentCharactersLeftText || commentCharactersExceededText ? '\n' : null}
      {commentCharactersLeftText ? (
        <Text variant="body2" color="accentOrange">
          {commentCharactersLeftText}
        </Text>
      ) : null}
      {commentCharactersExceededText ? (
        <Text variant="body2" color="accentNegative">
          {commentCharactersExceededText}
        </Text>
      ) : null}
      <Text />
    </Text>
  );

  const commentInputValue = (
    <>
      {comment.slice(0, dynamicMaxLength)}
      <S.CommentExceededValue>{comment.slice(dynamicMaxLength)}</S.CommentExceededValue>
    </>
  );

  const handleCommentChange = useCallback(
    (text: string) => {
      setCommentRequiredError(text.length === 0);
      setComment(text);
    },
    [setComment],
  );

  const handleConfirm = useCallback(() => {
    if (isCommentRequired && comment.length === 0) {
      setCommentRequiredError(true);
      commentInputRef.current?.focus();

      return;
    }

    onConfirm();
  }, [comment.length, isCommentRequired, onConfirm]);

  useEffect(() => {
    if (!isCommentRequired) {
      return;
    }

    if (active) {
      commentInputRef.current?.focus();
      return;
    }

    const timeoutId = setTimeout(() => {
      commentInputRef.current?.blur();
      setCommentRequiredError(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [active, isCommentRequired]);

  if (!recipient) {
    return null;
  }

  const recipientName = recipient.domain || recipient.name || recipientAccountInfo?.name;

  return (
    <S.Container style={keyboardHeightStyle}>
      <StepScrollView onScroll={scrollHandler} active={active}>
        <S.Form>
          <FormItem
            title={
              isCommentRequired
                ? t('send_screen_steps.comfirm.comment_label_required')
                : t('send_screen_steps.comfirm.comment_label')
            }
            description={commentDescription}
          >
            <Input
              innerRef={commentInputRef}
              isFailed={commentRequiredError}
              value={commentInputValue}
              onChangeText={handleCommentChange}
              placeholder={
                isCommentRequired
                  ? t('send_screen_steps.comfirm.comment_placeholder_required')
                  : t('send_screen_steps.comfirm.comment_placeholder')
              }
              returnKeyType="done"
              multiline
              blurOnSubmit
            />
          </FormItem>
          <FormItem title={detailsLabel} indicator={detailsIndicator}>
            <List align="left">
              {recipientName ? (
                <ListCell label={t('confirm_sending_recipient')}>
                  {recipientName}
                </ListCell>
              ) : null}
              <ListCell
                label={
                  recipientName
                    ? t('confirm_sending_recipient_address')
                    : t('confirm_sending_recipient')
                }
                onPress={handleCopy}
              >
                {maskifyAddress(recipient.address, 4)}
              </ListCell>
              <ListCell label={t('confirm_sending_amount')}>{amountValue}</ListCell>
              <ListCell label={t('confirm_sending_fee')}>{feeValue}</ListCell>
            </List>
          </FormItem>
        </S.Form>
        {isInactive ? (
          <S.Card>
            <S.Background />
            <S.ContentWrap>
              <S.TextWrap>
                <S.LabelWrapper>
                  <Text variant="label1">{t('confirm_sending_inactive_warn_title')}</Text>
                </S.LabelWrapper>
                <S.DescriptionWrapper>
                  <Text variant="body2" color="foregroundSecondary">
                    {t('confirm_sending_inactive_warn_description')}
                  </Text>
                </S.DescriptionWrapper>
                <Button
                  titleFont="regular"
                  withoutFixedHeight
                  onPress={openInactiveInfo}
                  size="small"
                  style={{ alignSelf: 'flex-start' }}
                  withoutTextPadding
                  mode="tertiary"
                  after={renderChevron}
                >
                  {t('confirm_sending_inactive_warn_about')}
                </Button>
              </S.TextWrap>
              <Icon
                style={{ marginTop: ns(4) }}
                color="foregroundPrimary"
                name="ic-exclamationmark-triangle-36"
              />
            </S.ContentWrap>
          </S.Card>
        ) : null}
        <BottomButtonWrapHelper />
      </StepScrollView>

      <BottomButtonWrap>
        <Button onPress={handleConfirm} disabled={commentError} isLoading={isSending}>
          {t('confirm_sending_submit')}
        </Button>
      </BottomButtonWrap>
    </S.Container>
  );
};

export const ConfirmStep = memo(ConfirmStepComponent);
