import { DetailedInfoContainer } from '../components/DetailedInfoContainer';
import { DetailedActionTime } from '../components/DetailedActionTime';
import { FailedActionLabel } from '../components/FailedActionLabel';
import { AddressListItem } from '../components/AddressListItem';
import { DetailedAmount } from '../components/DetailedAmount';
import { DetailedHeader } from '../components/DetailedHeader';
import { ExtraListItem } from '../components/ExtraListItem';
import { List, View, copyText } from '@tonkeeper/uikit';
import FastImage from 'react-native-fast-image';
import { StyleSheet } from 'react-native';
import { t } from '../../../i18n';
import { memo } from 'react';
import {
  CustomAccountEvent,
  CustomJettonTransferAction,
} from '@tonkeeper/core/src/TonAPI';

interface JettonTransferContentProps {
  action: CustomJettonTransferAction;
  event: CustomAccountEvent;
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
          destination={event.destination}
          symbol={action.jetton.symbol}
          amount={action.amount}
        />
        <DetailedActionTime destination={event.destination} timestamp={event.timestamp} />
        <FailedActionLabel isFailed={action.isFailed} />
      </DetailedInfoContainer>
      <List>
        <AddressListItem
          destination={event.destination}
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

const styles = StyleSheet.create({
  jettonImage: {
    width: 96,
    height: 96,
    borderRadius: 96 / 2,
  },
});
