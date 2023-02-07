import React from 'react';
import { useAppContext } from '../../hooks/appContext';
import { useTranslation } from '../../hooks/translation';
import { useTonenpointFiatMethods } from '../../state/tonendpoint';
import { Action, ActionsRow } from './Actions';
import { BuyAction, SellAction } from './BuyAction';
import { SendIcon } from './HomeIcons';
import { ReceiveAction } from './ReceiveAction';

export const HomeActions = () => {
  const { t } = useTranslation();
  const { tonendpoint } = useAppContext();
  const { data: methods } = useTonenpointFiatMethods(tonendpoint);

  const buy = methods && methods.categories[0];
  const sell = methods && methods.categories[1];

  return (
    <ActionsRow>
      <BuyAction buy={buy} />
      <Action
        icon={<SendIcon />}
        title={t('wallet_send')}
        action={() => null}
      />
      <ReceiveAction />
      <SellAction sell={sell} />
    </ActionsRow>
  );
};
