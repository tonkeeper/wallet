import { compareAddresses, formatDate, fromNano, getLocale } from "$utils";
import { differenceInCalendarMonths, format } from "date-fns";
import { useEffect, useState } from "react";
import { network } from "$libs/network";
import { getServerConfig } from "$shared/constants";
import { IconNames } from "$uikit/Icon/generated.types";
import { t } from "$translation";
import { Ton } from "$libs/Ton";

type EventActionSimplePreview = {
  short_description: string;
  full_description: string;
  name: string;
};

type EventAccount = {
  name?: string;
  address: string;
  is_scam: boolean;
}

type AccountEventAction = {
  type: string;
  simple_preview: EventActionSimplePreview
  status: string;
  recipient?: EventAccount;
  sender?: EventAccount;
  address?: string;
};

export type AccountEvent = {
  event_id: string;
  account: EventAccount;
  actions: AccountEventAction[];
  fee: any;
  in_progress: boolean;
  is_scam: boolean;
  lt: number;
  timestamp: number;
}

enum EventActionType {
  TonTransfer =  "TonTransfer",
  JettonTransfer =  "JettonTransfer",
  NftItemTransfer =  "NftItemTransfer",
  ContractDeploy =  "ContractDeploy",
  Subscribe =  "Subscribe",
  UnSubscribe =  "UnSubscribe",
  AuctionBid =  "AuctionBid",
  Unknown =  "Unknown",
}

type HistoryDataItem = {
  iconName?: IconNames;
  title?: string;
  subtitle?: string;
  value?: string;
  subvalue?: string;
  isReceive: boolean;
  badge?: boolean;
  iconImage?: string;
}

type HistoryData = {
  details: any;
  item: HistoryDataItem;
}

const myAddress = 'EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n';

const getSenderAccount = (isReceive: boolean, action: AccountEventAction) => {
  const senderAccount = isReceive ? action.sender : action.recipient;
  if (senderAccount) {
    if (senderAccount.name) {
      return senderAccount.name
    }

    return Ton.formatAddress(senderAccount.address, { cut: true });
  }

  return '';
}

function ActionHistoryMapper(event: AccountEvent, action: AccountEventAction): HistoryData {
  const details = {};
  const item: HistoryDataItem = {
    isReceive: compareAddresses(action.recipient?.address, myAddress)
  };

  const senderAccount = getSenderAccount(item.isReceive, action);
  const arrowIcon = item.isReceive ? 'ic-tray-arrow-down-28' : 'ic-tray-arrow-up-28';
  const time = format(new Date(event.timestamp * 1000), 'HH:mm');
  const amountPrefix = item.isReceive ? '+ ' : '- ';

  item.subtitle = senderAccount;
  item.subvalue = time;
  item.value = '-';

  // TODO:
  // item.value = fromNano(action.amount, action.jetton?.decimals ?? 9) + ' TON'

  switch (action.type) {
    case EventActionType.TonTransfer: 
      item.iconName = arrowIcon;
      item.title = item.isReceive ? t('activity.received') : t('activity.sent');
      item.value = amountPrefix + '100';
      break;
    case EventActionType.Subscribe: 
      item.iconName = 'ic-bell-28';
      item.title = t('transaction_type_subscription');
      item.value = amountPrefix + '100';
      break;
    case EventActionType.UnSubscribe: 
      item.iconName = 'ic-bell-28';
      item.title = t('transaction_type_unsubscription');
      item.value = amountPrefix + '100';
      break;
    case EventActionType.ContractDeploy: 
      const isInitialized = compareAddresses(action.address, myAddress);
      item.iconName = isInitialized ? 'ic-donemark-28' : 'ic-gear-28';
      item.title = isInitialized 
        ? t('transaction_type_wallet_initialized')
        : t('transaction_type_contract_deploy')
      break;
    // TODO:
    case EventActionType.JettonTransfer:
    case EventActionType.NftItemTransfer:
    case EventActionType.ContractDeploy:
    case EventActionType.AuctionBid:
    case EventActionType.Unknown:
    default: // Simple Preview
      item.iconName = 'ic-gear-28';
      item.title = action.simple_preview.name || 'Unknown',
      item.subtitle = action.simple_preview.short_description;
      break;
  }

  return { item, details };
}

const getAccountHistory = async (): Promise<(string | AccountEvent)[]> => {
  const host = getServerConfig('tonapiIOEndpoint') + '/v1/event/getAccountEvents';

  const { data } = await network.get(host, {
    headers: {
      Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
    },
    params: {
      account: myAddress,
      limit: 15,
      // beforeLt: '',
    }
  });

  data.events.sort((a, b) => {
    return a.timestamp > b.timestamp ? -1 : 1;
  });

  const events = data.events.map((event) => ({
    ...event,
    actions: event.actions.map((action) => 
      ActionHistoryMapper(event, {
        type: action.type,
        simple_preview: action.simple_preview,
        status: action.status,
        ...action[action.type],
      }))
  }))

  const formatGroupDate = (timestamp: number) => {
    const ts = timestamp * 1000;
    const now = new Date();

    if (differenceInCalendarMonths(now, new Date(ts)) < 1) {
      return format(new Date(ts), 'd MMMM', {
        locale: getLocale(),
      });
    } else {
      return format(new Date(ts), 'LLLL');
    }
  } 

  const groupsEvents = events.reduce((groups, event) => {
    const date = formatGroupDate(event.timestamp);

    if (!groups[date]) {
      groups[date] = [];
    }

    groups[date].push(event);

    return groups;
  }, {});

  return Object.keys(groupsEvents).reduce((acc, date) => {
    const txTime = groupsEvents[date][0].timestamp;

    acc.push(formatDate(new Date(txTime * 1000)))
    acc.push(...groupsEvents[date]);

    return acc;
  }, [] as (string | AccountEvent)[]);
}

export const useTransactions = () => {
  const [events, setEvents] = useState<(string | AccountEvent)[]>([]);

  useEffect(() => {
    getAccountHistory().then((events) => {
      setEvents(events)
    });
  }, []);

  return {
    refetch: () => {},
    fetchMore: () => {},
    isLoading: false,
    data: events
  }
}
