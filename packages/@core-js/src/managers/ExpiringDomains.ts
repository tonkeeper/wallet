import { NftAddress, NftItem, NftModel } from '../models/NftModel';
import { Storage } from '../declarations/Storage';
import { TonRawAddress } from '../WalletTypes';
import { State } from '../utils/State';
import { TonAPI } from '../TonAPI';

type ExpiringDomainsMap = { [key in NftAddress]: NftItem };

export type ExpiringDomainsState = {
  domains: ExpiringDomainsMap;
};

export class ExpiringDomains {
  public state = new State<ExpiringDomainsState>({
    domains: {},
  });

  constructor(
    private address: TonRawAddress,
    private tonapi: TonAPI,
    private storage: Storage,
  ) {
    this.state.persist({
      partialize: ({ domains }) => ({ domains }),
      storage: this.storage,
      key: 'ExpiringDomains',
    });
  }

  public async load() {
    try {
      const expiring = await this.tonapi.accounts.getAccountDnsExpiring({
        accountId: this.address,
        period: 30,
      });

      const domains = expiring.items.reduce<ExpiringDomainsMap>((domains, item) => {
        if (item.dns_item) {
          domains[item.dns_item.address] = NftModel.createItem(item.dns_item);
        }

        return domains;
      }, {});

      this.state.set({ domains });
    } catch (err) {
      console.log('[ExpiringDomains]: load error', err);
    }
  }

  public remove(domainAddress: NftAddress) {
    this.state.set(({ domains }) => {
      if (domains[domainAddress]) {
        delete domains[domainAddress];
      }

      return { domains };
    });
  }

  public async preload() {
    return this.load();
  }

  public rehydrate() {
    this.state.rehydrate();
  }
}
