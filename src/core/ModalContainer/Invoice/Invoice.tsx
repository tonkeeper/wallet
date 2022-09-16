import React, { FC } from 'react';
import { InvoiceProps } from '$core/ModalContainer/Invoice/Invoice.interface';
import { BottomSheet } from '$uikit';
import { formatCryptoCurrency } from '$utils/currency';
import { useTranslator } from '$hooks';
import { Decimals } from '$shared/constants';

export const Invoice: FC<InvoiceProps> = ({ currency }) => {
  const t = useTranslator();

  return (
    <BottomSheet
      title={t('send_title', {
        currency: formatCryptoCurrency('', currency, Decimals[currency]).trim(),
      })}
    >

    </BottomSheet>
  );
};
