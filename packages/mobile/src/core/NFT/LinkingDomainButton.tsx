import { t } from '@tonkeeper/shared/i18n';
import { Button, Text } from '$uikit';
import { debugLog } from '$utils/debugLog';
import { getTimeSec } from '$utils/getTimeSec';
import * as React from 'react';
import { View } from 'react-native';
import { useDispatch } from 'react-redux';
import { favoritesActions } from '$store/favorites';
import { DOMAIN_ADDRESS_NOT_FOUND } from '$core/Send/hooks/useSuggestedAddresses';
import {
  LinkingDomainActions,
  openLinkingDomain,
} from '$core/ModalContainer/LinkingDomainModal';
import { Toast } from '$store';
import {
  checkIsInsufficient,
  openInsufficientFundsModal,
} from '$core/ModalContainer/InsufficientFunds/InsufficientFunds';
import { Address } from '@tonkeeper/core';
import { useFlags } from '$utils/flags';
import { useWallet } from '@tonkeeper/shared/hooks';
import { tk } from '$wallet';

const TonWeb = require('tonweb'); // Fix ts types;

type DNSRecord = {
  walletAddress?: string;
  ownerAddress?: string;
};

type CachedDNSRecord =
  | (DNSRecord & {
      timestamp: number;
    })
  | null;

const CacheDNSRecord: {
  cache: { [key in string]: CachedDNSRecord };
  set: (key: string, data: DNSRecord, timeSec?: number) => void;
  get: (key: string) => CachedDNSRecord;
  delete: (key: string) => void;
} = {
  cache: {},
  set(key: string, data: DNSRecord, timeSec = 10) {
    this.cache[key] = { ...data, timestamp: getTimeSec() + timeSec };
  },
  get(key: string) {
    const cached = this.cache[key];
    if (cached) {
      const curTime = getTimeSec();
      if (curTime > cached.timestamp) {
        delete this.cache[key];
      }
    }

    return this.cache[key];
  },
  delete(key: string) {
    delete this.cache[key];
  },
};

interface LinkingDomainButtonProps {
  onLink?: (options: { ownerAddress: string }) => void;
  domainAddress: string;
  ownerAddress?: string;
  domain: string;
  disabled?: boolean;
  isTGUsername?: boolean;
}

export const LinkingDomainButton = React.memo<LinkingDomainButtonProps>((props) => {
  const flags = useFlags(['address_style_nobounce']);

  const wallet = useWallet();
  const dispatch = useDispatch();
  const [loading, setLoading] = React.useState(false);
  const [record, setRecord] = React.useState<DNSRecord>({
    ownerAddress: props.ownerAddress,
  });

  const needClaim = React.useMemo(() => !record.ownerAddress, [record.ownerAddress]);

  const isLinked = React.useMemo(
    () => Boolean(record.walletAddress),
    [record.walletAddress],
  );

  const getDNSRecord = React.useCallback(async (domain) => {
    try {
      const dnsRecord = await tk.wallet.tonapi.dns.dnsResolve(domain);

      if (dnsRecord?.wallet?.address) {
        const walletAddress = new TonWeb.Address(dnsRecord.wallet.address).toString(
          true,
          true,
          true,
        );
        return { walletAddress };
      }
    } catch {}

    return { walletAddress: null };
  }, []);

  React.useEffect(() => {
    (async () => {
      const cachedRecord = CacheDNSRecord.get(props.domain);

      if (cachedRecord) {
        setRecord({
          walletAddress: cachedRecord.walletAddress,
          ownerAddress: cachedRecord.ownerAddress,
        });
      } else if (record.ownerAddress) {
        try {
          setLoading(true);

          const record = await getDNSRecord(props.domain);
          const state = {
            walletAddress: record.walletAddress ?? undefined,
            ownerAddress: props.ownerAddress,
          };

          CacheDNSRecord.set(props.domain, state);

          if (record.walletAddress) {
            setRecord(state);
          }

          setLoading(false);
        } catch (err) {
          debugLog(err);
        }
      }
    })();
  }, []);

  const isLinkedOtherAddress = React.useMemo(() => {
    if (Boolean(record.walletAddress) && Boolean(record.ownerAddress)) {
      if (Object.values(wallet.tonAllAddresses).length > 0) {
        const linked = Object.values(wallet.tonAllAddresses).find((address) => {
          return Address.compare(address.raw, record.walletAddress);
        });

        return !linked;
      }
    }

    return false;
  }, [wallet, record.walletAddress, record.ownerAddress]);

  const handlePressButton = React.useCallback(async () => {
    Toast.loading();
    const currentWalletAddress = wallet.tonAllAddresses[wallet.config.version].friendly;
    const linkingActions = new LinkingDomainActions(
      props.domainAddress,
      isLinked ? undefined : currentWalletAddress,
    );
    const fee = await linkingActions.calculateFee();

    // compare balance and transfer amount, because transfer will fail
    if (fee === '0') {
      const checkResult = await checkIsInsufficient(
        linkingActions.transferAmount,
        tk.wallet,
      );
      if (checkResult.insufficient) {
        Toast.hide();
        return openInsufficientFundsModal({
          totalAmount: linkingActions.transferAmount,
          balance: checkResult.balance,
        });
      }
    }

    Toast.hide();

    openLinkingDomain({
      walletAddress: isLinked ? undefined : currentWalletAddress,
      domainAddress: props.domainAddress,
      domain: props.domain,
      fee,
      onDone: ({ walletAddress }) => {
        const record = {
          ownerAddress: currentWalletAddress,
          walletAddress,
        };

        dispatch(
          favoritesActions.updateDnsAddresses({
            [props.domain]: walletAddress || DOMAIN_ADDRESS_NOT_FOUND,
          }),
        );

        setRecord(record);
        CacheDNSRecord.set(props.domain, record, 20);

        props.onLink?.({
          ownerAddress: record.ownerAddress,
        });
      },
    });
  }, [wallet.tonAllAddresses, wallet.config.version, props, isLinked, dispatch]);

  const buttonTitle = React.useMemo(() => {
    if (record.walletAddress) {
      const address = Address.parse(record.walletAddress!, {
        bounceable: !flags.address_style_nobounce,
      }).toShort();
      return ' ' + t('nft_unlink_domain_button', { address });
    }

    return t(props.isTGUsername ? 'nft_link_username_button' : 'nft_link_domain_button');
  }, [record.walletAddress, props.isTGUsername, flags.address_style_nobounce]);

  return (
    <View style={{ marginBottom: 4 }}>
      <Button
        style={{ marginBottom: 12 }}
        onPress={handlePressButton}
        isLoading={loading}
        disabled={props.disabled || loading}
        mode="secondary"
        size="large"
      >
        {buttonTitle}
      </Button>
      {!loading && (
        <>
          {needClaim && (
            <Text variant="body2" color="foregroundSecondary" style={{ marginBottom: 6 }}>
              {t(
                props.isTGUsername
                  ? 'nft_link_username_caption'
                  : 'nft_link_domain_caption',
              )}
            </Text>
          )}
          {isLinkedOtherAddress && (
            <Text variant="body2" color="accentOrange" style={{ marginBottom: 6 }}>
              {t(
                props.isTGUsername
                  ? 'nft_link_username_mismatch_warn'
                  : 'nft_link_domain_mismatch_warn',
              )}
            </Text>
          )}
        </>
      )}
    </View>
  );
});
