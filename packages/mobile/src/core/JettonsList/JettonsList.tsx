import React, { FC, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as S from './JettonsList.style';
import { Icon, ScrollHandler, Separator, TouchableOpacity } from '$uikit';
import { ns, formatAmount } from '$utils';
import { useJettonBalances, useTranslator } from '$hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { jettonsActions, jettonsSelector } from '$store/jettons';
import { JettonBalanceModel, JettonVerification } from '$store/models';
import { useBottomTabBarHeight } from '$hooks/useBottomTabBarHeight';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { Address } from '$libs/Ton';

export function reorderJettons(currentConfig: any, newOrder: JettonBalanceModel[]) {
  const newConfig = {};
  newOrder.forEach((jettonBalance, index) => {
    const rawAddress = new Address(jettonBalance.jettonAddress).toString(false);
    console.log(rawAddress);
    newConfig[rawAddress] = {
      ...currentConfig[rawAddress],
      index,
    };
  });
  console.log(newConfig);
  return newConfig;
}

export const JettonsList: FC = () => {
  const t = useTranslator();
  const { excludedJettons } = useSelector(jettonsSelector);
  const { bottom: bottomInset } = useSafeAreaInsets();
  const dispatch = useDispatch();

  const onSwitchExcludedJetton = useCallback(
    (jettonAddress: string, value: boolean) => () =>
      dispatch(jettonsActions.switchExcludedJetton({ jetton: jettonAddress, value })),
    [dispatch],
  );

  const { enabled: data } = useJettonBalances();

  function renderJetton({
    drag,
    item: jetton,
    isActive,
    getIndex,
  }: RenderItemParams<JettonBalanceModel>) {
    const isWhitelisted = jetton.verification === JettonVerification.WHITELIST;
    const isEnabled =
      (isWhitelisted && !excludedJettons[jetton.jettonAddress]) ||
      excludedJettons[jetton.jettonAddress] === false;

    return (
      <ScaleDecorator activeScale={1.05}>
        <S.JettonInner
          isFirst={!isActive && getIndex() === 0}
          isLast={!isActive && data.length - 1 === getIndex()}
        >
          <S.JettonLogo source={{ uri: jetton.metadata.image }} />
          <S.JettonCont>
            <S.JettonName>{jetton.metadata.name}</S.JettonName>
            <S.JettonInfo>
              {formatAmount(jetton.balance, jetton.metadata.decimals)}{' '}
              {jetton.metadata.symbol}
            </S.JettonInfo>
          </S.JettonCont>
          <TouchableOpacity onLongPress={drag}>
            <Icon name="ic-reorder-28" size={28} />
          </TouchableOpacity>
        </S.JettonInner>
      </ScaleDecorator>
    );
  }

  return (
    <S.Wrap>
      <ScrollHandler isLargeNavBar={false} navBarTitle={t('jettons_list_title')}>
        <DraggableFlatList
          contentContainerStyle={{
            paddingBottom: ns(16) + bottomInset,
            paddingHorizontal: ns(16),
          }}
          onDragEnd={({ data: newData }) => reorderJettons({}, newData)}
          keyExtractor={(item) => item.jettonAddress}
          ItemSeparatorComponent={Separator}
          data={data}
          renderItem={renderJetton}
        />
      </ScrollHandler>
    </S.Wrap>
  );
};
