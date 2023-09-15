import { AddressListItem } from '../components/AddressListItem';
import { ExtraListItem } from '../components/ExtraListItem';
import { ActionModalContent } from '../ActionModalContent';
import { ActionItem, ActionType } from '@tonkeeper/core';
import { FastImage, Steezy } from '@tonkeeper/uikit';
import { memo } from 'react';

interface JettonMintActionContentProps {
  action: ActionItem<ActionType.JettonMint>;
}

export const JettonMintActionContent = memo<JettonMintActionContentProps>((props) => {
  const { action } = props;

  const source = { uri: action.payload.jetton?.image };

  return (
    <ActionModalContent
      header={<FastImage style={styles.jettonImage} resizeMode="cover" source={source} />}
      action={action}
    >
      <AddressListItem
        recipient={action.payload.recipient}
        hideName={action.event.is_scam}
        destination="out"
      />
      <ExtraListItem extra={action.event.extra} />
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
