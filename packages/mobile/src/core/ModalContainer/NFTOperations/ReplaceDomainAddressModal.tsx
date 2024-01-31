import React, { useCallback, useState } from 'react';
import { useValidateAddress } from '$hooks/useValidateAddress';
import { Button, Input, Text } from '$uikit';
import * as S from './ReplaceDomainAddressModal.style';
import { t } from '@tonkeeper/shared/i18n';
import { ns } from '$utils';
import { Modal } from '@tonkeeper/uikit';
import { SheetActions, useNavigation } from '@tonkeeper/router';
import { push } from '$navigation/imperative';

interface ReplaceDomainAddressModalProps {
  onReplace: (address: string) => void;
  domain: string;
}

export const ReplaceDomainAddressModal: React.FC<ReplaceDomainAddressModalProps> = (
  props,
) => {
  const nav = useNavigation();
  const [address, setAddress] = useState('');
  const { isValid } = useValidateAddress(address);

  const handleContinue = useCallback(() => {
    nav.goBack();
    props.onReplace(address);
  }, [address]);

  return (
    <Modal>
      <Modal.Header title={t('dns_wallet_address')} />
      <Modal.Content safeArea>
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
              component={Modal.Input}
            />
          </S.InputWrapper>
        </S.Wrap>
        <S.Buttons>
          <Button disabled={!address.length || !isValid} onPress={handleContinue}>
            {t('dns_replace_save')}
          </Button>
        </S.Buttons>
      </Modal.Content>
    </Modal>
  );
};

export function openReplaceDomainAddress(params: {
  domain: string;
  onReplace: (address: string) => void;
}) {
  push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: ReplaceDomainAddressModal,
    params,
    path: 'LINKING_REPLACE',
  });
}
