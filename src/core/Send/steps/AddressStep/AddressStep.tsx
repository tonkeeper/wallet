import { AddressSuggests } from './components/AddressSuggests/AddressSuggests';
import { useSuggestedAddresses } from '../../hooks/useSuggestedAddresses';
import { useReanimatedKeyboardHeight, useTranslator } from '$hooks';
import { Ton } from '$libs/Ton';
import { Button, FormItem } from '$uikit';
import { asyncDebounce, formatInputAmount, isValidAddress, parseTonLink } from '$utils';
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
import { BottomButtonWrap, BottomButtonWrapHelper } from '$shared/components';
import { SendSteps, SuggestedAddress, SuggestedAddressType } from '../../Send.interface';
import { AddressInput } from './components/AddressInput/AddressInput';
import { StepScrollView } from '../../StepScrollView/StepScrollView';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import {
  WordHintsPopup,
  WordHintsPopupRef,
} from '$shared/components/ImportWalletForm/WordHintsPopup';
import { AddressStepProps } from './AddressStep.interface';
import { getServerConfig } from '$shared/constants';

const TonWeb = require('tonweb');

const AddressStepComponent: FC<AddressStepProps> = (props) => {
  const {
    recipient,
    decimals,
    stepsScrollTop,
    setRecipient,
    setAmount,
    setComment,
    onContinue,
    active,
  } = props;

  const isReadyToContinue = !!recipient;

  const t = useTranslator();

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
    stepsScrollTop.value = {
      ...stepsScrollTop.value,
      [SendSteps.ADDRESS]: event.contentOffset.y,
    };
  });

  const wordHintsRef = useRef<WordHintsPopupRef>(null);

  const [dnsLoading, setDnsLoading] = useState(false);

  const getAddressByDomain = useMemo(
    () =>
      asyncDebounce(async (domain: string) => {
        try {
          const tonweb = new TonWeb(
            new TonWeb.HttpProvider(getServerConfig('tonEndpoint'), {
              apiKey: getServerConfig('tonEndpointAPIKey'),
            }),
          );

          const response = await tonweb.dns.getWalletAddress(domain);

          return response.toString(true, true, true) as string;
        } catch (e) {
          console.log('err', e);

          return null;
        }
      }, 1000),
    [],
  );

  const updateRecipient = useCallback(
    async (value: string) => {
      const link = parseTonLink(value);

      if (link.match && link.operation === 'transfer' && isValidAddress(link.address)) {
        if (link.query.amount && !Number.isNaN(Number(link.query.amount))) {
          const parsedAmount = Ton.fromNano(new TonWeb.utils.BN(link.query.amount));
          setAmount({ value: formatInputAmount(parsedAmount, decimals), all: false });
        }

        if (link.query.text) {
          setComment(link.query.text as string);
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
          address: favorite.address,
          name: favorite.name,
          domain: favorite.domain,
        });

        return true;
      }

      const domain = value.toLowerCase();

      // TODO: ton dns
      if (domain.endsWith('.ton')) {
        setDnsLoading(true);

        const address = await getAddressByDomain(domain);

        if (address) {
          setRecipient({ address, domain });
          setDnsLoading(false);

          return true;
        } else {
          setDnsLoading(false);
        }
      }

      if (isValidAddress(value)) {
        setRecipient({ address: value });

        return true;
      }

      setRecipient(null);

      return false;
    },
    [
      decimals,
      favoriteAddresses,
      getAddressByDomain,
      setAmount,
      setComment,
      setRecipient,
    ],
  );

  const handlePressSuggest = useCallback(
    (suggest: SuggestedAddress) => {
      const value =
        suggest.type === SuggestedAddressType.FAVORITE ? suggest.name! : suggest.address;

      updateRecipient(value);

      onContinue();
    },
    [onContinue, updateRecipient],
  );

  const handleAddressSubmit = useCallback(() => {
    if (isReadyToContinue) {
      onContinue();
    } else {
      Keyboard.dismiss();
    }
  }, [isReadyToContinue, onContinue]);

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
        <StepScrollView onScroll={scrollHandler} active={active}>
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
          {suggestedAddresses.length > 0 ? (
            <FormItem title={suggestsLabel}>
              <AddressSuggests
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
