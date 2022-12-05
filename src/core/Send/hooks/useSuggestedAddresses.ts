import { ActionType, TAction } from '$store/models';
import { compareAddresses, SearchIndexer } from '$utils';
import { favoritesActions, favoritesSelector } from '$store/favorites';
import uniqBy from 'lodash/uniqBy';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SuggestedAddress, SuggestedAddressType } from '../Send.interface';
import { eventsEventsInfoSelector } from '$store/events';
import { walletAddressSelector } from '$store/wallet';
import { CryptoCurrencies } from '$shared/constants';
import { Tonapi } from '$libs/Tonapi';

const TonWeb = require('tonweb');

export const DOMAIN_ADDRESS_NOT_FOUND = 'DOMAIN_ADDRESS_NOT_FOUND';

let favoriteDnsLastUpdated = 0;
const shouldUpdateDomains = () => favoriteDnsLastUpdated + 600 * 1000 < Date.now();

export const useSuggestedAddresses = () => {
  const eventsInfo = useSelector(eventsEventsInfoSelector);
  const dispatch = useDispatch();
  const { favorites, hiddenRecentAddresses, updatedDnsAddresses } =
    useSelector(favoritesSelector);
  const address = useSelector(walletAddressSelector);

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
    const events = Object.values(eventsInfo);
    let actions: (TAction & { timestamp: number })[] = [];

    events.forEach((event) => {
      let mainAction = event.actions.find((action) =>
        [ActionType.JettonTransfer, ActionType.NftItemTransfer].includes(
          ActionType[action.type],
        ),
      );
      if (mainAction) {
        actions.push({
          ...mainAction[ActionType[mainAction.type]],
          timestamp: event.timestamp,
        });
        return;
      }
      event.actions.forEach((action) =>
        actions.push({ ...action[ActionType[action.type]], timestamp: event.timestamp }),
      );
    });

    const addresses = actions
      .filter((action) => {
        if (
          !action?.recipient ||
          compareAddresses(address[CryptoCurrencies.Ton], action.recipient.address)
        ) {
          return false;
        }
        const isFavorite =
          favoriteAddresses.findIndex((favorite) =>
            compareAddresses(favorite.address, action.recipient.address),
          ) !== -1;

        const friendlyAddress = new TonWeb.Address(action.recipient.address).toString(
          true,
          true,
          true,
        );
        if (hiddenRecentAddresses.includes(friendlyAddress) || isFavorite) {
          return false;
        }

        return true;
      })
      .map(
        (action): SuggestedAddress => ({
          name: action.recipient.name,
          address: new TonWeb.Address(action.recipient.address).toString(
            true,
            true,
            true,
          ),
          type: SuggestedAddressType.RECENT,
          timestamp: action.timestamp,
        }),
      );

    return uniqBy(addresses, (item) => item.address).slice(0, 8);
  }, [eventsInfo, address, favoriteAddresses, hiddenRecentAddresses]);

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

      if (fetchedAddress && !compareAddresses(favorite.address, fetchedAddress)) {
        dispatch(
          favoritesActions.updateFavorite({
            ...favorite,
            address: new TonWeb.Address(fetchedAddress).toString(true, true, true),
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
