import React, { memo, useMemo } from 'react';
import { Steezy } from '$styles';
import { Icon, Spacer, SText, View, List } from '$uikit';
import { ViewStyle } from 'react-native';
import { useExpiringDomains } from '$store/zustand/domains/useExpiringDomains';
import { ONE_YEAR_MILISEC, format, getCountOfDays, getLocale } from '$utils/date';
import { t } from '$translation';
import { openRenewAllDomainModal } from '../RenewAllDomainModal';
import { maskifyAddress, maskifyDomain } from '$utils/address';

interface ApprovalCellProps {
  withoutSpacer?: boolean;
  style?: ViewStyle;
}

export const ExpiringDomainCell = memo<ApprovalCellProps>(({ withoutSpacer, style }) => {
  const expiringDomains = useExpiringDomains((state) => state.items);

  const title = useMemo(() => {
    const untilDate = format(+new Date() + ONE_YEAR_MILISEC, 'dd MMM yyyy', {
      locale: getLocale(),
    });

    if (expiringDomains.length === 1) {
      const domain = expiringDomains[0];
      const countOfDays = getCountOfDays(+new Date(), domain.expiring_at * 1000);
      const count = countOfDays === 366 ? countOfDays - 1 : countOfDays;

      return t('dns_alert_expiring_one', {
        domain: maskifyDomain(domain.name),
        untilDate,
        count,
      });
    }

    return t('dns_alert_expiring_many', {
      count: expiringDomains.length,
      untilDate,
    });
  }, [expiringDomains]);

  return (
    <View style={style}>
      {!withoutSpacer && <Spacer y={16} />}
      <List indent={false} style={styles.container}>
        <List.Item
          chevronColor="iconSecondary"
          onPress={() => openRenewAllDomainModal()}
          leftContent={
            <View style={styles.iconContainer}>
              <Icon color="foregroundPrimary" name="ic-globe-28" />
            </View>
          }
          title={
            <SText numberOfLines={3} variant="body2">
              {title}
            </SText>
          }
          chevron
        />
      </List>
    </View>
  );
});

const styles = Steezy.create(({ colors }) => ({
  container: {
    backgroundColor: colors.backgroundContentTint,
    marginBottom: 4,
  },
  iconContainer: {
    padding: 8,
    backgroundColor: colors.backgroundContentAttention,
    borderRadius: 32,
  },
}));
