import {
  FastImage,
  List,
  Steezy,
  copyText,
  Text,
  TouchableOpacity,
  Button,
  View,
} from '@tonkeeper/uikit';
import { AddressListItem } from '../components/AddressListItem';
import { ExtraListItem } from '../components/ExtraListItem';
import { ActionModalContent } from '../ActionModalContent';
import {
  ActionItem,
  ActionType,
} from '@tonkeeper/mobile/src/wallet/models/ActivityModel';
import { t } from '../../../i18n';
import { memo } from 'react';
import { JettonVerificationType } from '@tonkeeper/core/src/TonAPI';
import { EncryptedComment, EncryptedCommentLayout } from '../../../components';
import { config } from '@tonkeeper/mobile/src/config';
import { openUnverifiedTokenDetailsModal } from '../../UnverifiedTokenDetailsModal';
import { useNavigation } from '@tonkeeper/router';

interface JettonTransferContentProps {
  action: ActionItem<ActionType.JettonTransfer>;
}

const unverifiedTokenHitSlop = { top: 4, left: 4, bottom: 4, right: 4 };

export const NotcoinTransferActionContent = memo<JettonTransferContentProps>((props) => {
  const { action } = props;

  const source = { uri: action.payload.jetton?.image };

  const nav = useNavigation();

  return (
    <ActionModalContent
      header={<FastImage style={styles.jettonImage} resizeMode="cover" source={source} />}
      subtitle={
        !config.get('disable_show_unverified_token') &&
        action.payload.jetton.verification === JettonVerificationType.None && (
          <TouchableOpacity
            onPress={openUnverifiedTokenDetailsModal}
            hitSlop={unverifiedTokenHitSlop}
          >
            <Text style={styles.subtitleStyle.static} type="body1" color="accentOrange">
              {t('approval.unverified_token')}
            </Text>
          </TouchableOpacity>
        )
      }
      action={action}
      footerContent={
        <View style={styles.footer}>
          <Button title="OK" onPress={nav.goBack} />
        </View>
      }
    >
      <List>
        <List.Item
          titleType="secondary"
          title={t('transactionDetails.sender')}
          value="notcoin"
        />
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
  subtitleStyle: {
    marginTop: 4,
  },
  footer: {
    padding: 16,
  },
}));
