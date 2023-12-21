import { SearchIndexer } from '$utils';
import { favoritesActions, favoritesSelector } from '$store/favorites';
import uniqBy from 'lodash/uniqBy';
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SuggestedAddress, SuggestedAddressType } from '../Send.interface';
import { walletAddressSelector } from '$store/wallet';
import { CryptoCurrencies } from '$shared/constants';
import { Tonapi } from '$libs/Tonapi';
import { useStakingStore } from '$store';
import { ActionItem, ActionType, Address } from '@tonkeeper/core';
import { tk } from '@tonkeeper/shared/tonkeeper';

export const DOMAIN_ADDRESS_NOT_FOUND = 'DOMAIN_ADDRESS_NOT_FOUND';

let favoriteDnsLastUpdated = 0;
const shouldUpdateDomains = () => favoriteDnsLastUpdated + 600 * 1000 < Date.now();

export const useSuggestedAddresses = () => {
  const dispatch = useDispatch();
  const { favorites, hiddenRecentAddresses, updatedDnsAddresses } =
    useSelector(favoritesSelector);
  const address = useSelector(walletAddressSelector);

  const stakingPools = useStakingStore((s) => s.pools.map((pool) => pool.address));

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

    const walletAddress = address[CryptoCurrencies.Ton];
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
          payload.recipient?.is_scam
        ) {
          return false;
        }

        const isFavorite =
          favoriteAddresses.findIndex((favorite) =>
            Address.compare(favorite.address, recipientAddress),
          ) !== -1;

        const isStakingPool =
          stakingPools.findIndex((poolAddress) =>
            Address.compare(poolAddress, recipientAddress),
          ) !== -1;

        const rawAddress = Address.parse(recipientAddress).toRaw();

        if (
          hiddenRecentAddresses.some((addr) => Address.compare(addr, rawAddress)) ||
          isFavorite ||
          isStakingPool
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
  }, [address, favoriteAddresses, hiddenRecentAddresses, stakingPools]);

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
      const resolved = await Tonapi.resolveDns(favorite.domain!);
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
