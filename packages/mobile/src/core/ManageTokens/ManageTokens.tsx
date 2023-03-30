import React, { FC, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as S from './ManageTokens.style';
import { Icon, Screen, ScrollHandler, Separator, TouchableOpacity, View } from '$uikit';
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
import { Tabs } from '../../tabs/Wallet/components/Tabs';
import { Steezy } from '$styles';

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

export const ManageTokens: FC = () => {
  const t = useTranslator();
  const { excludedJettons } = useSelector(jettonsSelector);
  const { bottom: bottomInset } = useSafeAreaInsets();
  const dispatch = useDispatch();
  const [tab, setTab] = useState<string>('tokens');

  const onSwitchExcludedJetton = useCallback(
    (jettonAddress: string, value: boolean) => () =>
      dispatch(jettonsActions.switchExcludedJetton({ jetton: jettonAddress, value })),
    [dispatch],
  );

  const data = useJettonBalances(true);

  const renderJetton = useCallback(
    ({
      drag,
      item: jetton,
      isActive,
      getIndex,
    }: RenderItemParams<JettonBalanceModel>) => {
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
    },
    [data.length, excludedJettons],
  );

  const renderTabs = useCallback(() => {
    return (
      <Screen>
        <Tabs>
          <View style={{ flex: 1 }}>
            <Tabs.Header style={styles.tabsHeader}>
              <Tabs.Bar
                onChange={({ value }) => setTab(value)}
                value={tab}
                items={[
                  { label: t('wallet.tonkens_tab_lable'), value: 'tokens' },
                  { label: t('wallet.collectibles_tab_lable'), value: 'collectibles' },
                ]}
              />
            </Tabs.Header>
            <Tabs.PagerView>
              <Tabs.Section index={0}>
                <DraggableFlatList
                  contentContainerStyle={{
                    paddingBottom: ns(16) + bottomInset,
                    paddingHorizontal: ns(16),
                    paddingTop: ns(16),
                  }}
                  onDragEnd={({ data: newData }) => reorderJettons({}, newData)}
                  keyExtractor={(item) => item.jettonAddress}
                  ItemSeparatorComponent={Separator}
                  data={data}
                  renderItem={renderJetton}
                />
              </Tabs.Section>
              <Tabs.Section index={1}>
                <DraggableFlatList
                  contentContainerStyle={{
                    paddingBottom: ns(16) + bottomInset,
                    paddingHorizontal: ns(16),
                    paddingTop: ns(16),
                  }}
                  onDragEnd={({ data: newData }) => reorderJettons({}, newData)}
                  keyExtractor={(item) => item.jettonAddress}
                  ItemSeparatorComponent={Separator}
                  data={data}
                  renderItem={renderJetton}
                />
              </Tabs.Section>
            </Tabs.PagerView>
          </View>
        </Tabs>
      </Screen>
    );
  }, [bottomInset, data, renderJetton, t, tab]);

  return renderTabs();

  return (
    <S.Wrap>
      <ScrollHandler isLargeNavBar={false} navBarTitle={t('approval.manage_tokens')}>
        <DraggableFlatList
          contentContainerStyle={{
            paddingBottom: ns(16) + bottomInset,
            paddingHorizontal: ns(16),
            paddingTop: ns(16),
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

const styles = Steezy.create(({ safeArea }) => ({
  tabsHeader: {
    position: 'relative',
    paddingTop: safeArea.top,
  },
}));
