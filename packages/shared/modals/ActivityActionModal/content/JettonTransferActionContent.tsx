import { FastImage, List, Steezy, copyText } from '@tonkeeper/uikit';
import { AddressListItem } from '../components/AddressListItem';
import { ExtraListItem } from '../components/ExtraListItem';
import { ActionModalContent } from '../ActionModalContent';
import { ActionItem, ActionType } from '@tonkeeper/core';
import { t } from '../../../i18n';
import { memo } from 'react';

interface JettonTransferContentProps {
  action: ActionItem<ActionType.JettonTransfer>;
}

export const JettonTransferActionContent = memo<JettonTransferContentProps>((props) => {
  const { action } = props;

  const source = { uri: action.payload.jetton?.image };

  return (
    <ActionModalContent
      header={<FastImage style={styles.jettonImage} resizeMode="cover" source={source} />}
      action={action}
    >
      <List>
        <AddressListItem
          destination={action.destination}
          recipient={action.payload.recipient}
          sender={action.payload.sender}
          hideName={action.event.is_scam}
        />
        <ExtraListItem extra={action.event.extra} />
        {!!action.payload.comment && (
          <List.Item
            titleType="secondary"
            title={t('transactionDetails.comment')}
            onPress={copyText(action.payload.comment)}
            value={action.payload.comment}
            valueMultiline
          />
        )}
      </List>
    </ActionModalContent>
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
