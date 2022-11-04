import React, { FC, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as S from './JettonsList.style';
import { AnimatedFlatList, ScrollHandler, Separator } from '$uikit';
import { ns, formatAmount } from '$utils';
import { useJettonBalances, useTranslator } from '$hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { jettonsActions, jettonsSelector } from '$store/jettons';
import { Switch } from 'react-native';
import { JettonBalanceModel } from '$store/models';

export const JettonsList: FC = () => {
  const t = useTranslator();
  const { excludedJettons } = useSelector(jettonsSelector);
  const { bottom: bottomInset } = useSafeAreaInsets();
  const dispatch = useDispatch();

  const onSwitchExcludedJetton = useCallback(
    (jettonAddress: string) => () =>
      dispatch(jettonsActions.switchExcludedJetton(jettonAddress)),
    [dispatch],
  );

  const data = useJettonBalances(true);

  function renderJetton({
    item: jetton,
    index,
  }: {
    item: JettonBalanceModel;
    index: number;
  }) {
    return (
      <S.JettonInner isFirst={index === 0} isLast={data.length - 1 === index}>
        <S.JettonLogo source={{ uri: jetton.metadata.image }} />
        <S.JettonCont>
          <S.JettonName>{jetton.metadata.name}</S.JettonName>
          <S.JettonInfo>
            {formatAmount(jetton.balance, jetton.metadata.decimals)}{' '}
            {jetton.metadata.symbol}
          </S.JettonInfo>
        </S.JettonCont>
        <Switch
          value={!excludedJettons[jetton.jettonAddress]}
          // @ts-ignore
          onChange={onSwitchExcludedJetton(jetton.jettonAddress)}
        />
      </S.JettonInner>
    );
  }

  return (
    <S.Wrap>
      <ScrollHandler isLargeNavBar={false} navBarTitle={t('jettons_list_title')}>
        <AnimatedFlatList
          contentContainerStyle={{
            paddingBottom: ns(16) + bottomInset,
            paddingHorizontal: ns(16),
            paddingTop: ns(16),
          }}
          ItemSeparatorComponent={Separator}
          data={data}
          renderItem={renderJetton}
        />
      </ScrollHandler>
    </S.Wrap>
  );
};
