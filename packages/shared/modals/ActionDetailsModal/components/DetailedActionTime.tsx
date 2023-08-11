import { AccountEventDestination } from '@tonkeeper/core/src/TonAPI';
import { StyleSheet } from 'react-native';
import { Text } from '@tonkeeper/uikit';
import { memo, useMemo } from 'react';
import { t } from '../../../i18n';
import { formatTransactionDetailsTime } from '../../../utils/date';

interface DetailedActionTimeProps {
  destination: AccountEventDestination;
  timestamp: number;
  langKey?: string;
}

export const DetailedActionTime = memo<DetailedActionTimeProps>((props) => {
  const { destination, langKey: customLangKey, timestamp } = props;

  const time = useMemo(() => {
    const time = formatTransactionDetailsTime(new Date(timestamp * 1000));
    let langKey: string | null = null;
    if (customLangKey) {
      langKey = customLangKey;
    } else {
      if (destination === 'in') {
        langKey = 'received_date';
      } else if (destination === 'out') {
        langKey = 'sent_date';
      }
    }

    if (langKey) {
      return t(`transactionDetails.${langKey}`, { time });
    }

    return time;
  }, [timestamp, destination]);

  return (
    <Text type="body1" color="textSecondary" style={styles.timeText}>
      {time}
    </Text>
  );
});

const styles = StyleSheet.create({
  timeText: {
    marginTop: 4,
  },
});
