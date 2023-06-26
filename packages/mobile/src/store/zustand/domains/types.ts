export type RawAddress = string;
export type ExpiringAt = number;

export type ExpiringDomains = {
  domains: { [key in RawAddress]: ExpiringAt };
  actions: {
    load: (account_id: string) => void;
    remove: (address: string) => void;
  };
};
