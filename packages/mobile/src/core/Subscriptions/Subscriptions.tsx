import React, { FC, useCallback, useMemo } from 'react';
import { getUnixTime } from 'date-fns';

import * as S from './Subscriptions.style';
import { Icon, RoundedSectionList, ScrollHandler, Text } from '$uikit';
import { format, ns } from '$utils';
import { SubscriptionModel } from '$store/models';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ton } from '$libs/Ton';
import { t } from '@tonkeeper/shared/i18n';
import { openSubscription } from '$core/ModalContainer/CreateSubscription/CreateSubscription';
import { useSubscriptions } from '@tonkeeper/shared/hooks/useSubscriptions';

export const Subscriptions: FC = () => {
  const subscriptionsInfo = useSubscriptions((state) => state.subscriptions);
  const { bottom: bottomInset } = useSafeAreaInsets();

  const sections = useMemo(() => {
    const subscriptions = Object.values(subscriptionsInfo);
    const now = getUnixTime(new Date());

    return [
      {
        title: t('subscriptions_section_active'),
        data: subscriptions
          .filter((item) => !!item.isActive || item.chargedAt + item.intervalSec > now)
          .map((item, index) => ({
            ...item,
            key: `${item.subscriptionId}-${index}`,
          })),
      },
      {
        title: t('subscriptions_section_expired'),
        data: subscriptions
          .filter((item) => !item.isActive && item.chargedAt + item.intervalSec <= now)
          .map((item, index) => ({
            ...item,
            key: `${item.subscriptionId}-${index}`,
          })),
      },
    ].filter(({ data }) => data.length > 0);
  }, [subscriptionsInfo, t]);

  const handleOpen = useCallback((subscription: SubscriptionModel) => {
    openSubscription(subscription, null, true);
  }, []);

  return (
    <S.Wrap>
      <ScrollHandler isLargeNavBar={false} navBarTitle={t('subscriptions_title')}>
        <RoundedSectionList
          contentContainerStyle={{ paddingBottom: ns(16) + bottomInset }}
          sections={sections}
          renderItem={(item) => {
            const priceFormatted = Ton.fromNano(item.amountNano);
            const chargedAt = item.chargedAt || 0;
            const nextBill = format((chargedAt + item.intervalSec) * 1000, 'd MMM');
            let label: string;

            const now = getUnixTime(new Date());
            if (item.isActive) {
              label = t('subscriptions_item_caption', {
                price: priceFormatted,
                nextBill,
              });
            } else if (item.chargedAt + item.intervalSec > now) {
              label = t('subscriptions_item_caption_expiring', {
                price: priceFormatted,
                date: nextBill,
              });
            } else {
              label = t('subscriptions_item_caption_expired', {
                date: nextBill,
              });
            }

            return (
              <S.SubscriptionInner>
                <S.SubscriptionCont>
                  <Text numberOfLines={1} variant="label1">
                    {item.merchantName}
                  </Text>
                  <S.SubscriptionInfoWrapper>
                    <Text color="foregroundSecondary" numberOfLines={1} variant="body2">
                      {label}
                    </Text>
                  </S.SubscriptionInfoWrapper>
                </S.SubscriptionCont>
                <Icon name="ic-chevron-right-16" color="foregroundSecondary" />
              </S.SubscriptionInner>
            );
          }}
          onItemPress={handleOpen}
        />
      </ScrollHandler>
    </S.Wrap>
  );
};
