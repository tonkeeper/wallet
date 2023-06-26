import { Ton } from "$libs/Ton";
import { CryptoCurrencies, Decimals } from "$shared/constants";
import { t } from "$translation";
import { compareAddresses, format, truncateDecimal } from "$utils";
import { formatCryptoCurrency } from "$utils/currency";
import { AccountEvent, EventAction, SimplePreview } from "./Events.types";

const getSenderAccount = (isReceive: boolean, action: SimplePreview) => {
  const senderAccount = isReceive ? action.sender : action.recipient;
  if (senderAccount) {
    if (senderAccount.name) {
      return senderAccount.name
    }

    return Ton.formatAddress(senderAccount.address, { cut: true });
  }

  return '';
}

const myAddress = 'EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n';

export function EventsMapper(event: AccountEvent, action: SimplePreview) {
  const details = {};




  const item = {
    isReceive: false,//action.accounts.find( compareAddresses(action.recipient?.address, myAddress)
  };

  item.iconName = 'ic-gear-28';
  item.title = action.name || 'Unknown',
  item.subtitle = action.description;

  console.log(action)

  return { item };


  // const senderAccount = getSenderAccount(item.isReceive, action);
  // const arrowIcon = item.isReceive ? 'ic-tray-arrow-down-28' : 'ic-tray-arrow-up-28';
  // const time = format(new Date(event.timestamp * 1000), 'HH:mm');
  // const amountPrefix = item.isReceive ? '+ ' : '- ';

  // // item.subtitle = senderAccount;
  // // item.subvalue = time;
  // // item.value = '-';


  // // if (action.amount) { // TODO: rewrite
  // //   const amount = TonWeb.utils.fromNano(Math.abs(action.amount).toString());
  // //   item.value = amountPrefix + ' ' + truncateDecimal(amount.toString(), 2, false, true) + ' ' +
  // //     formatCryptoCurrency(
  // //       '',
  // //       CryptoCurrencies.Ton,
  // //       Decimals[CryptoCurrencies.Ton],
  // //       undefined,
  // //       true,
  // //     ).trim();
  // // }

  switch (action) {
    // case EventActionType.TonTransfer: 
    //   item.iconName = arrowIcon;
    //   item.title = item.isReceive ? t('activity.received') : t('activity.sent');    
    //   break;
    // case EventActionType.Subscribe: 
    //   item.iconName = 'ic-bell-28';
    //   item.title = t('transaction_type_subscription');
    //   break;
    // case EventActionType.UnSubscribe: 
    //   item.iconName = 'ic-bell-28';
    //   item.title = t('transaction_type_unsubscription');
    //   break;
    // case EventActionType.ContractDeploy: 
    //   const isInitialized = compareAddresses(action.address, myAddress);
    //   item.iconName = isInitialized ? 'ic-donemark-28' : 'ic-gear-28';
    //   item.title = isInitialized 
    //     ? t('transaction_type_wallet_initialized')
    //     : t('transaction_type_contract_deploy');
        
    //     console.log(action);
    //   break;
    // // TODO:
    // case EventActionType.JettonTransfer:
    // case EventActionType.NftItemTransfer:
    //   item.value = 'NFT';
    // case EventActionType.ContractDeploy:
    // case EventActionType.AuctionBid:
    // case EventActionType.Unknown:
    // default: // Simple Preview
    //   item.iconName = 'ic-gear-28';
    //   item.title = action.simple_preview.name || 'Unknown',
    //   item.subtitle = action.simple_preview.short_description;
    //   break;
  }

  // return { item, details };


}

export function EventsActionMapper() {

}