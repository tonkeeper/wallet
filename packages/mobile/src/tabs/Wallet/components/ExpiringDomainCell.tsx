import React, { memo } from 'react';
import { Steezy } from '$styles';
import { Icon, Spacer, SText, View, List } from '$uikit';
import { ViewStyle } from 'react-native';
import { useExpiringDomains } from '$store/zustand/domains/useExpiringDomains';
import { ONE_YEAR_MILISEC, format, getLocale } from '$utils/date';
import { t } from '$translation';
import { openRenewAllDomainModal } from '../RenewAllDomainModal';

interface ApprovalCellProps {
  withoutSpacer?: boolean;
  style?: ViewStyle;
}

export const ExpiringDomainCell = memo<ApprovalCellProps>(({ withoutSpacer, style }) => {
  const expiringDomains = useExpiringDomains((state) => state.domains);

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
            <SText numberOfLines={2} style={styles.title} variant="body2">
              {t('dns_alert_expiring', { count: Object.keys(expiringDomains).length })}
              {'\n'}
              {t('dns_renew_all_until_btn', {
                untilDate: format(+new Date() + ONE_YEAR_MILISEC, 'dd MMM yyyy', {
                  locale: getLocale(),
                }),
              })}
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
  title: {
    marginRight: 40,
  },
  iconContainer: {
    padding: 8,
    backgroundColor: colors.backgroundContentAttention,
    borderRadius: 32,
  },
}));
