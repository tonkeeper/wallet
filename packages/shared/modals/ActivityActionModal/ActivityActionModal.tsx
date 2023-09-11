import { SheetActions, navigation, useNavigation } from '@tonkeeper/router';
import { Text, Button, Icon, Modal, View, Toast } from '@tonkeeper/uikit';
import { memo, useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { config } from '../../config';
import { tk } from '../../tonkeeper';
import { t } from '../../i18n';

import { JettonTransferContent } from './content/JettonTransferContent';
import { NftTransferContent } from './content/NftTransferContent';
import { TonTransferContent } from './content/TonTransferContent';
import { JettonSwapContent } from './content/JettonSwapAction';
import { SmartContractExecContent } from './content/SmartContractExecContent';
import { AuctionBidContent } from './content/AuctionBidContent';
import { NftPurchaseContent } from './content/NftPurchaseContent';
import { ContractDeployContent } from './content/ContractDeployContent';
import { UnSubscribeContent } from './content/UnSubscribeContent';
import {
  ActivitySource,
  AnyActivityAction,
  ActivityActionType,
  ActivityEvent,
} from '@tonkeeper/core';

type ActivityActionModalProps = {
  action: AnyActivityAction;
  event: ActivityEvent;
};

export const ActivityActionModal = memo<ActivityActionModalProps>((props) => {
  const { event, action } = props;
  const nav = useNavigation();

  // TODO: need auto detect modal content size
  const Content =
    (action as any).comment || (action as any).payload ? Modal.ScrollView : Modal.Content;
  const hash = ` ${event.event_id.substring(0, 8)}`;

  const handlePressHash = useCallback(() => {
    nav.navigate('DAppBrowser', {
      url: config.get('transactionExplorer').replace('%s', event.event_id),
    });
  }, [event.event_id]);

  const content = useMemo(() => {
    switch (action.type) {
      case ActivityActionType.TonTransfer:
        return <TonTransferContent action={action} event={event} />;
      case ActivityActionType.JettonTransfer:
        return <JettonTransferContent action={action} event={event} />;
      case ActivityActionType.JettonSwap:
        return <JettonSwapContent action={action} event={event} />;
      case ActivityActionType.NftItemTransfer:
        return <NftTransferContent action={action} event={event} />;
      case ActivityActionType.SmartContractExec:
        return <SmartContractExecContent action={action} event={event} />;
      case ActivityActionType.AuctionBid:
        return <AuctionBidContent action={action} event={event} />;
      case ActivityActionType.NftPurchase:
        return <NftPurchaseContent action={action} event={event} />;
      case ActivityActionType.ContractDeploy:
        return <ContractDeployContent action={action} event={event} />;
      case ActivityActionType.UnSubscribe:
        return <UnSubscribeContent action={action} event={event} />;
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

export async function openActionDetails(
  actionId: string,
  source: ActivitySource = ActivitySource.Ton,
) {
  const openModal = (data: any) => {
    navigation.push('SheetsProvider', {
      $$action: SheetActions.ADD,
      component: ActivityActionModal,
      params: data,
      path: 'TRANSACTION_DETAILS',
    });
  };

  try {
    if (source === ActivitySource.Tron) {
      const cachedData = tk.wallet.activityLoader.getTronAction(actionId);
      if (cachedData) {
        openModal(cachedData);
      } else {
        Toast.loading();
        const data = await tk.wallet.activityLoader.loadTronAction(actionId);
        if (data) {
          openModal(data);
        }
        Toast.hide();
      }
    } else {
      const cachedData = tk.wallet.activityLoader.getTonAction(actionId);
      if (cachedData) {
        openModal(cachedData);
      } else {
        Toast.loading();
        const data = await tk.wallet.activityLoader.loadTonAction(actionId);
        if (data) {
          openModal(data);
        }
        Toast.hide();
      }
    }
  } catch (err) {
    console.log(err);
    Toast.fail('Error load event');
  }
}
