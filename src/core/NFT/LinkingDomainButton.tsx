
import { useAllAddresses } from '$hooks/useAllAddresses';
import { openLinkingDomain } from '$navigation';
import { walletSelector } from '$store/wallet';
import { t } from '$translation';
import { Button, Text } from '$uikit';
import { debugLog, maskifyAddress } from '$utils';
import { getTimeSec } from '$utils/getTimeSec';
import * as React from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';

const TonWeb = require('tonweb'); // Fix ts types;

type DNSRecord = {
  walletAddress?: string;
  ownerAddress?: string;
};

type CachedDNSRecord = DNSRecord & {
  timestamp: number;
} | null;

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
  }
};

interface LinkingDomainButtonProps {
  onLink?: (options: { ownerAddress: string }) => void
  domainAddress: string;
  ownerAddress?: string;
  domain: string;
  disabled?: boolean;
}

export const LinkingDomainButton = React.memo<LinkingDomainButtonProps>((props) => {
  const { wallet, version } = useSelector(walletSelector);
  const allAddesses = useAllAddresses();
  const [loading, setLoading] = React.useState(false);
  const [record, setRecord] = React.useState<DNSRecord>({ 
    ownerAddress: props.ownerAddress,
  });

  const needClaim = React.useMemo(
    () => !Boolean(record.ownerAddress),
    [record.ownerAddress]
  );

  const isLinked = React.useMemo(
    () =>  Boolean(record.walletAddress), 
    [record.walletAddress]
  );

  const getDNSRecord = React.useCallback(async (domainAddress) => {
    const dnsItem = new TonWeb.dns.DnsItem(
      wallet!.vault.tonWallet.provider, 
      { address: domainAddress }
    );

    const dnsRecordWallet = await dnsItem.resolve('.', TonWeb.dns.DNS_CATEGORY_WALLET);
    if (dnsRecordWallet) {
      const walletAddress = dnsRecordWallet.toString(true, true, true);
     
      return { walletAddress };
    }

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
      } else if (Boolean(record.ownerAddress)) {
        try {
          setLoading(true);

          const record = await getDNSRecord(props.domainAddress);
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
      if (Object.values(allAddesses).length > 0) {
        const linked = Object.values(allAddesses).find((address) => {
          return address === record.walletAddress
        });

        return !Boolean(linked);
      }
    }
    
    return false;
  }, [allAddesses, record.walletAddress, record.ownerAddress]);
  
  const handlePressButton = React.useCallback(() => {
    const currentWalletAddress = allAddesses[version];

    openLinkingDomain({
      walletAddress: isLinked ? undefined : currentWalletAddress,
      domainAddress: props.domainAddress,
      domain: props.domain,
      onDone: ({ walletAddress }) => {
        const record = {
          ownerAddress: currentWalletAddress,
          walletAddress,
        };

        setRecord(record);
        CacheDNSRecord.set(props.domain, record, 20);
        
        props.onLink?.({ 
          ownerAddress: record.ownerAddress 
        });
      }
    });
  }, [isLinked, allAddesses, version]);

  const buttonTitle = React.useMemo(() => {
    if (Boolean(record.walletAddress)) {
      const address = maskifyAddress(record.walletAddress!);
      return ' ' + t('nft_unlink_domain_button', { address });
    }

    return t('nft_link_domain_button');
  }, [record.walletAddress]);

  return (
    <View style={{ marginBottom: 8 }}>
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
            <Text
              variant="body2"
              color="foregroundSecondary"
            >
              {t('nft_link_domain_caption')}
            </Text>
          )}
          {isLinkedOtherAddress && (
            <Text
              variant="body2"
              color="accentOrange"
            >
              {t('nft_link_domain_mismatch_warn')}
            </Text>
          )}
        </>
      )}
    </View>
  );
});
