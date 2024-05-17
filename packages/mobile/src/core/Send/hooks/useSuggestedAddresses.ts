import { SearchIndexer } from '$utils';
import { favoritesActions, favoritesSelector } from '$store/favorites';
import uniqBy from 'lodash/uniqBy';
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SuggestedAddress, SuggestedAddressType } from '../Send.interface';
import { Address } from '@tonkeeper/core';
import { tk } from '$wallet';
import { useWallet } from '@tonkeeper/shared/hooks';
import { ActionItem, ActionType } from '$wallet/models/ActivityModel';
import { compareAddresses } from '$utils/address';

export const DOMAIN_ADDRESS_NOT_FOUND = 'DOMAIN_ADDRESS_NOT_FOUND';

let favoriteDnsLastUpdated = 0;
const shouldUpdateDomains = () => favoriteDnsLastUpdated + 600 * 1000 < Date.now();

export const useSuggestedAddresses = () => {
  const dispatch = useDispatch();
  const { favorites, hiddenRecentAddresses, updatedDnsAddresses } =
    useSelector(favoritesSelector);
  const wallet = useWallet();

  const favoriteAddresses = useMemo(
    (): SuggestedAddress[] =>
      favorites
        .map((item) => ({
          ...item,
          type: SuggestedAddressType.FAVORITE,
          domainUpdated: !!item.domain && !!updatedDnsAddresses[item.domain],
          domain:
            !!item.domain && updatedDnsAddresses[item.domain] !== DOMAIN_ADDRESS_NOT_FOUND
              ? item.domain
              : undefined,
        }))
        .reverse(),
    [favorites, updatedDnsAddresses],
  );

  const recentAddresses = useMemo(() => {
    const actions = tk.wallet.activityLoader.getLoadedActions();
    const pickTypes = [
      ActionType.JettonTransfer,
      ActionType.NftItemTransfer,
      ActionType.TonTransfer,
    ] as const;

    const walletAddress = wallet.address.ton.raw;
    const addresses = (
      actions.filter((action) => {
        if (
          !pickTypes.includes(action.type as (typeof pickTypes)[number]) ||
          action.initialActionType === ActionType.SmartContractExec
        ) {
          return false;
        }

        const { payload } = action as ActionItem<(typeof pickTypes)[number]>;

        const recipientAddress = payload.recipient?.address;

        if (
          !recipientAddress ||
          Address.compare(walletAddress, recipientAddress) ||
          payload.sender?.is_scam ||
          payload.recipient?.is_scam ||
          !payload.recipient?.name ||
          !payload.recipient?.is_wallet
        ) {
          return false;
        }

        const isFavorite =
          favoriteAddresses.findIndex((favorite) =>
            Address.compare(favorite.address, recipientAddress),
          ) !== -1;

        const rawAddress = Address.parse(recipientAddress).toRaw();

        if (compareAddresses(tk.wallet.battery.state.data.fundReceiver, rawAddress)) {
          return false;
        }

        if (
          hiddenRecentAddresses.some((addr) => Address.compare(addr, rawAddress)) ||
          isFavorite
        ) {
          return false;
        }

        return true;
      }) as ActionItem<(typeof pickTypes)[number]>[]
    ).map(
      (action): SuggestedAddress => ({
        address: Address.parse(action.payload.recipient!.address, {
          bounceable: !action.payload.recipient?.is_wallet,
        }).toFriendly(),
        name: action.payload.recipient!.name,
        type: SuggestedAddressType.RECENT,
        timestamp: action.event.timestamp,
      }),
    );

    return uniqBy(addresses, (item) => item.address).slice(0, 8);
  }, [favoriteAddresses, hiddenRecentAddresses, wallet]);

  const suggestedAddresses = useMemo(
    () => [...favoriteAddresses, ...recentAddresses],
    [favoriteAddresses, recentAddresses],
  );

  const indexedFavoriteAddresses = useMemo(
    () => new SearchIndexer(favoriteAddresses.map((item) => item.name || '')),
    [favoriteAddresses],
  );

  const updateDomains = useCallback(async () => {
    const dnsFavorites = favorites.filter((favorite) => !!favorite.domain);

    if (dnsFavorites.length === 0) {
      return;
    }

    for (const favorite of dnsFavorites) {
      const resolved = await tk.wallet.tonapi.dns.dnsResolve(favorite.domain!);
      const fetchedAddress = resolved?.wallet?.address;

      if (fetchedAddress && !Address.compare(favorite.address, fetchedAddress)) {
        dispatch(
          favoritesActions.updateFavorite({
            ...favorite,
            address: Address.parse(fetchedAddress).toFriendly(),
          }),
        );
      }

      dispatch(
        favoritesActions.updateDnsAddresses({
          [favorite.domain!]: fetchedAddress || DOMAIN_ADDRESS_NOT_FOUND,
        }),
      );

      favoriteDnsLastUpdated = Date.now();
    }
  }, [dispatch, favorites]);

  useEffect(() => {
    if (shouldUpdateDomains()) {
      updateDomains();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useMemo(
    () => ({
      favoriteAddresses,
      indexedFavoriteAddresses,
      recentAddresses,
      suggestedAddresses,
    }),
    [favoriteAddresses, indexedFavoriteAddresses, recentAddresses, suggestedAddresses],
  );
};
