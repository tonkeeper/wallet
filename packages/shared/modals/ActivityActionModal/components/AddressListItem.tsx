import { List, ListSeparator, Text, copyText } from '@tonkeeper/uikit';
import { AccountAddress } from '@tonkeeper/core/src/TonAPI';
import { ActionDestination } from '@tonkeeper/core';
import { Address } from '@tonkeeper/shared/Address';
import { t } from '../../../i18n';
import { memo } from 'react';

interface AddressListItemProps {
  destination?: ActionDestination;
  recipient?: AccountAddress;
  sender?: AccountAddress;
  address?: string;
  hideName?: boolean;
}

export const AddressListItem = memo<AddressListItemProps>((props) => {
  const { destination, sender, recipient, hideName, address } = props;

  if (destination === 'in' && sender) {
    const senderAddress = Address.parse(sender.address).toFriendly();

    return (
      <>
        {!!sender.name && !hideName && (
          <>
            <List.Item
              titleType="secondary"
              title={t('transactionDetails.sender')}
              onPress={copyText(sender.name)}
              value={sender.name}
            />
            <ListSeparator />
          </>
        )}
        <List.Item
          titleType="secondary"
          title={t('transactionDetails.sender_address')}
          onPress={copyText(senderAddress)}
          subtitle={
            <Text type="label1" numberOfLines={1} ellipsizeMode="middle">
              {senderAddress}
            </Text>
          }
        />
      </>
    );
  } else if (destination === 'out' && recipient) {
    const recipientAddress = Address.parse(recipient.address).toFriendly();

    return (
      <>
        {!!recipient.name && (
          <>
            <List.Item
              titleType="secondary"
              title={t('transactionDetails.recipient')}
              onPress={copyText(recipient.name)}
              value={recipient.name}
            />
            <ListSeparator />
          </>
        )}
        <List.Item
          titleType="secondary"
          title={t('transactionDetails.recipient_address')}
          onPress={copyText(recipientAddress)}
          subtitle={
            <Text type="label1" numberOfLines={1} ellipsizeMode="middle">
              {recipientAddress}
            </Text>
          }
        />
      </>
    );
  }

  if (address) {
    const friendlyAddress = Address.parse(address).toFriendly();

    return (
      <List.Item
        titleType="secondary"
        title={t('transactionDetails.address')}
        onPress={copyText(friendlyAddress)}
        subtitle={
          <Text type="label1" numberOfLines={1} ellipsizeMode="middle">
            {friendlyAddress}
          </Text>
        }
      />
    );
  }

  return null;
});
