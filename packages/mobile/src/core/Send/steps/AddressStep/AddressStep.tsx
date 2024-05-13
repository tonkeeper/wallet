import { useSuggestedAddresses } from '../../hooks/useSuggestedAddresses';
import { useReanimatedKeyboardHeight } from '$hooks/useKeyboardHeight';
import { Ton } from '$libs/Ton';
import { Button, FormItem } from '$uikit';
import { asyncDebounce, formatInputAmount, isTransferOp, parseTonLink } from '$utils';
import React, {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Keyboard } from 'react-native';
import * as S from './AddressStep.style';
import {
  BottomButtonWrap,
  BottomButtonWrapHelper,
  StepScrollView,
} from '$shared/components';
import {
  AccountWithPubKey,
  SuggestedAddress,
  SuggestedAddressType,
} from '../../Send.interface';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import {
  WordHintsPopup,
  WordHintsPopupRef,
} from '$shared/components/ImportWalletForm/WordHintsPopup';
import { AddressStepProps } from './AddressStep.interface';
import { Tonapi } from '$libs/Tonapi';
import { AddressInput, AddressSuggests, CommentInput } from './components';
import { TextInput } from 'react-native-gesture-handler';
import { t } from '@tonkeeper/shared/i18n';
import { Address } from '@tonkeeper/core';
import { useWallet } from '@tonkeeper/shared/hooks';

const TonWeb = require('tonweb');

let dnsAbortController: null | AbortController = null;
const AddressStepComponent: FC<AddressStepProps> = (props) => {
  const {
    recipient,
    decimals,
    comment,
    isCommentEncrypted,
    recipientAccountInfo,
    setRecipient,
    changeBlockchain,
    active,
    enableEncryption = true,
    setRecipientAccountInfo,
    setAmount,
    setComment,
    setCommentEncrypted,
    onContinue,
  } = props;

  const wallet = useWallet();

  const commentInputRef = useRef<TextInput>(null);

  const isCommentRequired = !!recipientAccountInfo?.memoRequired;

  const isAbleToEncryptComment = recipientAccountInfo
    ? enableEncryption && !isCommentRequired && !!recipientAccountInfo.publicKey
    : enableEncryption;

  const isCommentValid = wallet.isLedger ? /^[ -~]*$/gm.test(comment) : true;

  const isReadyToContinue =
    !!recipient && (!isCommentRequired || comment.length) && isCommentValid;

  const { keyboardHeightStyle } = useReanimatedKeyboardHeight();

  const { indexedFavoriteAddresses, favoriteAddresses, suggestedAddresses } =
    useSuggestedAddresses();

  const suggestsLabel =
    favoriteAddresses.length > 0
      ? t('send_screen_steps.address.suggests_label')
      : t('send_screen_steps.address.recent_label');

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const wordHintsRef = useRef<WordHintsPopupRef>(null);

  const [dnsLoading, setDnsLoading] = useState(false);

  const getAddressByDomain = useMemo(
    () =>
      asyncDebounce(async (value: string, signal: AbortSignal) => {
        try {
          const domain = value.toLowerCase();
          const resolvedDomain = await Tonapi.resolveDns(domain, signal);

          if (resolvedDomain === 'aborted') {
            return 'aborted';
          } else if (resolvedDomain?.wallet?.address) {
            const isWallet = !!resolvedDomain?.wallet?.account?.is_wallet;
            return new TonWeb.Address(resolvedDomain.wallet.address).toString(
              true,
              true,
              !isWallet,
            ) as string;
          }

          return null;
        } catch (e) {
          console.log('err', e);

          return null;
        }
      }, 1000),
    [],
  );

  const updateRecipient = useCallback(
    async (value: string, accountInfo?: Partial<AccountWithPubKey>) => {
      setRecipientAccountInfo(null);

      if (value.length === 0) {
        setRecipient(null);

        return false;
      }

      try {
        const link = parseTonLink(value);

        if (dnsAbortController) {
          dnsAbortController.abort();
          dnsAbortController = null;
          setDnsLoading(false);
        }

        if (link.match && isTransferOp(link.operation) && Address.isValid(link.address)) {
          if (
            setAmount &&
            link.query.amount &&
            !Number.isNaN(Number(link.query.amount))
          ) {
            const parsedAmount = Ton.fromNano(new TonWeb.utils.BN(link.query.amount));
            setAmount({
              value: formatInputAmount(parsedAmount, decimals, true),
              all: false,
            });
          }

          if (link.query.text) {
            setComment(link.query.text as string);
          }

          if (link.query.bin) {
            return false;
          }

          value = link.address;
        }

        const favorite = favoriteAddresses.find(
          (item) =>
            item.name?.toLowerCase() === value.toLowerCase() ||
            item.address?.toLowerCase() === value.toLowerCase(),
        );

        if (favorite) {
          setRecipient({
            blockchain: 'ton',
            address: favorite.address,
            name: favorite.name,
            domain: favorite.domain,
          });

          return true;
        }

        if (Address.isValid(value)) {
          if (accountInfo) {
            setRecipientAccountInfo(accountInfo as AccountWithPubKey);
          }

          setRecipient({ blockchain: 'ton', address: value });

          return true;
        }

        const domain = value.toLowerCase();

        if (!favorite && !TonWeb.Address.isValid(domain)) {
          setDnsLoading(true);
          const abortController = new AbortController();
          dnsAbortController = abortController;

          const zone = domain.indexOf('.') === -1 ? '.ton' : '';
          const resolvedDomain = await getAddressByDomain(
            domain + zone,
            abortController.signal,
          );

          if (resolvedDomain === 'aborted') {
            setDnsLoading(false);
            dnsAbortController = null;
            return true;
          } else if (resolvedDomain) {
            setRecipient({ address: resolvedDomain, domain, blockchain: 'ton' });
            setDnsLoading(false);
            dnsAbortController = null;
            return true;
          } else {
            setDnsLoading(false);
            dnsAbortController = null;
          }
        }

        /* TODO: revise feature and fix
        if (seeIfValidTronAddress(value) && changeBlockchain) {
          setRecipient({ address: value, blockchain: 'tron' });
          changeBlockchain(CryptoCurrencies.Usdt);
          return true;
        }
        */

        setRecipient(null);

        return false;
      } catch (e) {
        return false;
      }
    },
    [
      decimals,
      favoriteAddresses,
      getAddressByDomain,
      setAmount,
      setComment,
      setRecipient,
      setRecipientAccountInfo,
    ],
  );

  const handlePressSuggest = useCallback(
    (suggest: SuggestedAddress) => {
      const isFavorite = suggest.type === SuggestedAddressType.FAVORITE;
      const value = isFavorite ? suggest.name! : suggest.address;
      const accountInfo = !isFavorite ? { name: suggest.name } : undefined;
      updateRecipient(value, accountInfo);
    },
    [updateRecipient],
  );

  const handleCommentSubmit = useCallback(() => {
    if (isReadyToContinue) {
      onContinue();
    } else {
      Keyboard.dismiss();
    }
  }, [isReadyToContinue, onContinue]);

  const handleAddressSubmit = useCallback(() => {
    commentInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (recipient) {
      updateRecipient(recipient.domain || recipient.address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favoriteAddresses]);

  return (
    <>
      <WordHintsPopup
        scrollY={scrollY}
        indexedWords={indexedFavoriteAddresses}
        ref={wordHintsRef}
      />
      <S.Container style={keyboardHeightStyle}>
        <StepScrollView
          onScroll={scrollHandler}
          active={active}
          keyboardDismissMode="on-drag"
        >
          <FormItem>
            <AddressInput
              wordHintsRef={wordHintsRef}
              recipient={recipient}
              shouldFocus={active}
              dnsLoading={dnsLoading}
              editable={active}
              updateRecipient={updateRecipient}
              onSubmit={handleAddressSubmit}
            />
          </FormItem>
          <CommentInput
            innerRef={commentInputRef}
            isCommentRequired={isCommentRequired}
            isCommentValid={isCommentValid}
            isAbleToEncryptComment={isAbleToEncryptComment}
            comment={comment}
            isCommentEncrypted={isCommentEncrypted}
            setCommentEncrypted={setCommentEncrypted}
            setComment={setComment}
            onSubmit={handleCommentSubmit}
          />
          {suggestedAddresses.length > 0 ? (
            <FormItem title={suggestsLabel}>
              <AddressSuggests
                cellsDisabled={!!recipient}
                scrollY={scrollY}
                addresses={suggestedAddresses}
                onPressSuggest={handlePressSuggest}
              />
            </FormItem>
          ) : null}
          <BottomButtonWrapHelper />
        </StepScrollView>

        <BottomButtonWrap>
          <Button disabled={!isReadyToContinue} onPress={onContinue}>
            {t('continue')}
          </Button>
        </BottomButtonWrap>
      </S.Container>
    </>
  );
};

export const AddressStep = memo(AddressStepComponent);
