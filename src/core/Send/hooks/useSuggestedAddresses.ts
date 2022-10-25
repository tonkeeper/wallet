import { ActionType, TAction } from '$store/models';
import { compareAddresses, SearchIndexer } from '$utils';
import { getServerConfig } from '$shared/constants';
import { favoritesActions, favoritesSelector } from '$store/favorites';
import uniqBy from 'lodash/uniqBy';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SuggestedAddress, SuggestedAddressType } from '../Send.interface';
import { eventsSelector } from '$store/events';
import { walletSelector } from '$store/wallet';
import { CryptoCurrencies } from '$shared/constants';

const TonWeb = require('tonweb');

const DOMAIN_ADDRESS_NOT_FOUND = 'DOMAIN_ADDRESS_NOT_FOUND';

const getAddressByDomain = async (domain: string) => {
  try {
    const tonweb = new TonWeb(
      new TonWeb.HttpProvider(getServerConfig('tonEndpoint'), {
        apiKey: getServerConfig('tonEndpointAPIKey'),
      }),
    );

    const response = await tonweb.dns.getWalletAddress(domain);

    return response.toString(true, true, true) as string;
  } catch (e) {
    console.log('err', e);

    return null;
  }
};

let favoriteDnsLastUpdated = 0;

const shouldUpdateDomains = () => favoriteDnsLastUpdated + 600 * 1000 < Date.now();

export const useSuggestedAddresses = () => {
  const { eventsInfo } = useSelector(eventsSelector);
  const dispatch = useDispatch();
  const { favorites, hiddenRecentAddresses } = useSelector(favoritesSelector);
  const { address } = useSelector(walletSelector);

  const [updatedDnsAddresses, setUpdatedDnsAddresses] = useState<Record<string, string>>(
    shouldUpdateDomains()
      ? {}
      : favorites
          .filter((favorite) => !!favorite.domain)
          .reduce((acc, cur) => {
            acc[cur.domain!] = cur.address;
            return acc;
          }, {}),
  );

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

        const friendlyAddress = new TonWeb.Address(action.recipient.address).toString(true, true, true)
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

    dnsFavorites.forEach(async (favorite) => {
      const fetchedAddress = await getAddressByDomain(favorite.domain!);

      if (fetchedAddress && favorite.address !== fetchedAddress) {
        dispatch(
          favoritesActions.updateFavorite({ ...favorite, address: fetchedAddress }),
        );
      }

      setUpdatedDnsAddresses((s) => ({
        ...s,
        [favorite.domain!]: fetchedAddress || DOMAIN_ADDRESS_NOT_FOUND,
      }));

      favoriteDnsLastUpdated = Date.now();
    });
  }, [dispatch, favorites]);

  useEffect(() => {
    if (shouldUpdateDomains()) {
      updateDomains();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    favoriteAddresses,
    indexedFavoriteAddresses,
    recentAddresses,
    suggestedAddresses,
  };
};
