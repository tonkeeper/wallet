import React, { useCallback, useState } from 'react';
import { useValidateAddress } from '$hooks';
import { BottomSheet, Button, Input, Text } from '$uikit';
import * as S from '../NFTTransferInputAddressModal/NFTTransferInputAddressModal.style';
import { t } from '$translation';
import { ns } from '$utils';

interface ReplaceDomainAddressModalProps {
  onReplace: (address: string) => void;
  domain: string;
}

export const ReplaceDomainAddressModal: React.FC<
  ReplaceDomainAddressModalProps
> = (props) => {
  const [address, setAddress] = useState('');
  const { isValid } = useValidateAddress(address);
  const [isClosed, setClosed] = useState(false);

  const handleContinue = useCallback(() => {
    setClosed(true);
    props.onReplace(address);
  }, [address]);

  return (
    <BottomSheet title={t('dns_wallet_address')} triggerClose={isClosed}>
      <S.Wrap>
        <Text
          style={{ marginBottom: ns(24) }}
          variant="body1"
          color="foregroundSecondary"
        >
          {t('dns_replace_description', { domain: props.domain })}
        </Text>
        <S.InputWrapper>
          <Input
            autoFocus
            isFailed={!!address.length && !isValid}
            onChangeText={setAddress}
            placeholder={t('dns_wallet_address')}
            value={address}
          />
        </S.InputWrapper>
      </S.Wrap>
      <S.Buttons>
        <Button disabled={!address.length || !isValid} onPress={handleContinue}>
          {t('dns_replace_save')}
        </Button>
      </S.Buttons>
    </BottomSheet>
  );
};
