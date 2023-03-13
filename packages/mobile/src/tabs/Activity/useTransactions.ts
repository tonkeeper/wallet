import { compareAddresses, formatDate, fromNano, getLocale, truncateDecimal } from "$utils";
import { differenceInCalendarMonths, format } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { network } from "$libs/network";
import { CryptoCurrencies, Decimals, getServerConfig } from "$shared/constants";
import { IconNames } from "$uikit/Icon/generated.types";
import { t } from "$translation";
import { Ton } from "$libs/Ton";
import { useDispatch, useSelector } from "react-redux";
import { eventsActions, eventsSelector } from "$store/events";
import { EventsMap } from '$store/events/interface';
import TonWeb from "tonweb";
import { formatCryptoCurrency } from "$utils/currency";

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


  if (action.amount) { // TODO: rewrite
    const amount = TonWeb.utils.fromNano(Math.abs(action.amount).toString());
    item.value = amountPrefix + ' ' + truncateDecimal(amount.toString(), 2, false, true) + ' ' +
      formatCryptoCurrency(
        '',
        CryptoCurrencies.Ton,
        Decimals[CryptoCurrencies.Ton],
        undefined,
        true,
      ).trim();
  }

  switch (action.type) {
    case EventActionType.TonTransfer: 
      item.iconName = arrowIcon;
      item.title = item.isReceive ? t('activity.received') : t('activity.sent');    
      break;
    case EventActionType.Subscribe: 
      item.iconName = 'ic-bell-28';
      item.title = t('transaction_type_subscription');
      break;
    case EventActionType.UnSubscribe: 
      item.iconName = 'ic-bell-28';
      item.title = t('transaction_type_unsubscription');
      break;
    case EventActionType.ContractDeploy: 
      const isInitialized = compareAddresses(action.address, myAddress);
      item.iconName = isInitialized ? 'ic-donemark-28' : 'ic-gear-28';
      item.title = isInitialized 
        ? t('transaction_type_wallet_initialized')
        : t('transaction_type_contract_deploy');
        
        console.log(action);
      break;
    // TODO:
    case EventActionType.JettonTransfer:
    case EventActionType.NftItemTransfer:
      item.value = 'NFT';
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

const convertEventsToTrasactions = (eventMap: EventsMap) => {
  const data = Object.values(eventMap);

  data.sort((a, b) => {
    return a.timestamp > b.timestamp ? -1 : 1;
  });

  const events = data.map((event) => ({
    ...event,
    actions: event.actions.map((action) => 
      ActionHistoryMapper({
        ...event,
        event_id: event.eventId, 
        in_progress: event.inProgress, 
      }, {
        type: action.type,
        simple_preview: action.simplePreview && {
          short_description: action.simplePreview.shortDescription,
          full_description: action.simplePreview.fullDescription,
          name: action.simplePreview.name,
        },
        status: action.status,
        ...action[action.type.charAt(0).toLowerCase()+action.type.slice(1)],
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
  const dispatch = useDispatch();
  const {
    isLoading,
    eventsInfo,
    canLoadMore,
  } = useSelector(eventsSelector);

  const fetchMore = useCallback(() => {

    console.log('LOADING MORE', canLoadMore, isLoading)
    if (isLoading || !canLoadMore) {
      return;
    }

    dispatch(eventsActions.loadEvents({ isLoadMore: true }));
  }, [dispatch, isLoading, canLoadMore]);
  

  const data = useMemo(() => {
    console.log(Object.keys(eventsInfo).length);
    return convertEventsToTrasactions(eventsInfo);
  }, [eventsInfo]);

  return {
    refetch: () => {},
    fetchMore,
    isLoading,
    data
  }
}
