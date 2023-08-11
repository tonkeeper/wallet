import { SheetActions, navigation, useNavigation } from '@tonkeeper/router';
import { Text, Button, Icon, Modal, View, Toast } from '@tonkeeper/uikit';
import { memo, useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { config } from '../../config';
import { tk } from '../../tonkeeper';
import { t } from '../../i18n';
import {
  CustomAccountEvent,
  CustomAccountEventActions,
  CustomActionType,
} from '@tonkeeper/core/src/TonAPI';

import { JettonTransferContent } from './content/JettonTransferContent';
import { NftTransferContent } from './content/NftTransferContent';
import { TonTransferContent } from './content/TonTransferContent';
import { JettonSwapContent } from './content/JettonSwapAction';
import { SmartContractExecContent } from './content/SmartContractExecContent';
import { AuctionBidContent } from './content/AuctionBidContent';
import { NftPurchaseContent } from './content/NftPurchaseContent';
import { ContractDeployContent } from './content/ContractDeployContent';

type ActionDetailsModalProps = {
  action: CustomAccountEventActions;
  event: CustomAccountEvent;
};

export const ActionDetailsModal = memo<ActionDetailsModalProps>((props) => {
  const { event, action } = props;
  const nav = useNavigation();

  // TODO: need auto detect modal content size
  const Content = (action as any).comment || (action as any).payload ? Modal.ScrollView : Modal.Content;
  const hash = ` ${event.event_id.substring(0, 8)}`;

  const handlePressHash = useCallback(() => {
    nav.navigate('DAppBrowser', {
      url: config.get('transactionExplorer').replace('%s', event.event_id),
    });
  }, [event.event_id]);

  const content = useMemo(() => {
    switch (action.type) {
      case CustomActionType.TonTransfer:
        return <TonTransferContent action={action} event={event} />;
      case CustomActionType.JettonTransfer:
        return <JettonTransferContent action={action} event={event} />;
      case CustomActionType.JettonSwap:
        return <JettonSwapContent action={action} event={event} />;
      case CustomActionType.NftItemTransfer:
        return <NftTransferContent action={action} event={event} />;
      case CustomActionType.SmartContractExec:
        return <SmartContractExecContent action={action} event={event} />;
      case CustomActionType.AuctionBid: // 1
        return <AuctionBidContent action={action} event={event} />;
      case CustomActionType.NftPurchase:
        return <NftPurchaseContent action={action} event={event} />;
      case CustomActionType.ContractDeploy:
          return <ContractDeployContent action={action} event={event} />
      default:
        return null;
    }
  }, [action]);

  return (
    <Modal>
      <Modal.Header />
      <Content safeArea>
        <View style={styles.container}>
          {content}
          <View style={styles.footer}>
            <Button onPress={handlePressHash} size="small" color="secondary">
              <Icon name="ic-globe-16" color="constantWhite" />
              <Text type="label2" style={styles.buttonText}>
                {t('transactionDetails.transaction')}
              </Text>
              <Text type="label2" color="textTertiary">
                {hash}
              </Text>
            </Button>
          </View>
        </View>
      </Content>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingTop: 48,
  },
  footer: {
    padding: 16,
    marginBottom: 16,
    alignSelf: 'center',
  },
  buttonText: {
    marginLeft: 8,
  },
});

export async function openActionDetails(txId: string) {
  const openModal = (data: any) => {
    navigation.push('SheetsProvider', {
      $$action: SheetActions.ADD,
      component: ActionDetailsModal,
      params: data,
      path: 'TRANSACTION_DETAILS',
    });
  };

  try {
    const cachedData = tk.wallet.transactions.getCachedAction(txId);
    if (cachedData) {
      openModal(cachedData);
    } else {
      Toast.loading();
      const data = await tk.wallet.transactions.fetchAction(txId);
      if (data) {
        openModal(data);
      }
      Toast.hide();
    }
  } catch (err) {
    console.log(err);
    Toast.fail('Error load event');
  }
}
