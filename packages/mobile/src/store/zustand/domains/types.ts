export type RawAddress = string;
export type ExpiringAt = number;

export interface ExpiringDomainItem {
  expiring_at: number;
  name: string;
  dns_item: DnsItem;
}

export interface DnsItem {
  address: string;
  index: number;
  owner: Owner;
  collection: Collection;
  verified: boolean;
  metadata: Metadata;
  previews: Preview[];
  dns: string;
  approved_by: string[];
}

export interface Owner {
  address: string;
  is_scam: boolean;
}

export interface Collection {
  address: string;
  name: string;
  description: string;
}

export interface Metadata {
  name: string;
}

export interface Preview {
  resolution: string;
  url: string;
}

export type ExpiringDomains = {
  domains: { [key in RawAddress]: ExpiringAt };
  items: ExpiringDomainItem[];
  actions: {
    load: (account_id: string) => void;
    remove: (address: string) => void;
  };
};
