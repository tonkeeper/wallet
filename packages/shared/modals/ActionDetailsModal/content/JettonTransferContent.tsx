import { DetailedInfoContainer } from '../components/DetailedInfoContainer';
import { FastImage, List, Steezy, View, copyText } from '@tonkeeper/uikit';
import { DetailedActionTime } from '../components/DetailedActionTime';
import { FailedActionLabel } from '../components/FailedActionLabel';
import { AddressListItem } from '../components/AddressListItem';
import { DetailedAmount } from '../components/DetailedAmount';
import { DetailedHeader } from '../components/DetailedHeader';
import { ExtraListItem } from '../components/ExtraListItem';
import { t } from '../../../i18n';
import { memo } from 'react';
import { JettonTransferActionData, TransactionEvent } from '@tonkeeper/core';

interface JettonTransferContentProps {
  action: JettonTransferActionData;
  event: TransactionEvent;
}

export const JettonTransferContent = memo<JettonTransferContentProps>((props) => {
  const { action, event } = props;

  const source = { uri: action.jetton?.image };

  return (
    <View>
      <DetailedInfoContainer>
        <DetailedHeader isScam={event.is_scam} isHide={action.isFailed}>
          <FastImage style={styles.jettonImage} resizeMode="cover" source={source} />
        </DetailedHeader>
        <DetailedAmount
          decimals={action.jetton.decimals}
          destination={action.destination}
          symbol={action.jetton.symbol}
          hideFiat={action.isFailed}
          amount={action.amount}
        />
        <DetailedActionTime destination={action.destination} timestamp={event.timestamp} />
        <FailedActionLabel isFailed={action.isFailed} />
      </DetailedInfoContainer>
      <List>
        <AddressListItem
          destination={action.destination}
          recipient={action.recipient}
          sender={action.sender}
          hideName={event.is_scam}
        />
        <ExtraListItem extra={event.extra} />
        {!!action.comment && (
          <List.Item
            titleType="secondary"
            title={t('transactionDetails.comment')}
            onPress={copyText(action.comment)}
            value={action.comment}
            valueMultiline
          />
        )}
      </List>
    </View>
  );
});

const styles = Steezy.create(({ colors }) => ({
  jettonImage: {
    width: 96,
    height: 96,
    borderRadius: 96 / 2,
    backgroundColor: colors.backgroundContent,
  },
}));
