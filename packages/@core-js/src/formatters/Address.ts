import TonWeb, { AddressType } from 'tonweb';

const ContractVersions = ['lockup-0.1', 'v3R1', 'v3R2', 'v4R1', 'v4R2'] as const;

export type AddressFormats = {
  friendly: string;
  short: string;
  raw: string;
};

export type AddressesByVersion = {
  [key in (typeof ContractVersions)[number]]: AddressFormats;
};

type FormatOptions = {
  testOnly?: boolean;
  bounceable?: boolean;
  urlSafe?: boolean;
};

type DefaultFormatOptions = {
  bounceable: (() => boolean) | boolean;
  testOnly: (() => boolean) | boolean;
  urlSafe: (() => boolean) | boolean;
};

const defaultFormatOptions = {
  bounceable: true,
  testOnly: false,
  urlSafe: true,
};

export class Address {
  protected formatOptions: DefaultFormatOptions;
  private address: AddressType;

  constructor(source: string, formatOptions: Partial<DefaultFormatOptions> = {}) {
    this.formatOptions = { ...defaultFormatOptions, ...formatOptions };
    this.address = new TonWeb.Address(source);
  }

  static parse(source: string, options?: Partial<DefaultFormatOptions>) {
    return new Address(source, options);
  }

  static toShort(address?: string, symbolsInPart: number = 4) {
    if (!address) {
      address = '';
    }

    const initialPart = address.substring(0, symbolsInPart);
    const finalPart = address.substring(address.length - symbolsInPart);
    const ellipsis = '...';

    return initialPart + ellipsis + finalPart;
  }

  static isValid(address: string) {
    return TonWeb.Address.isValid(address);
  }

  static isBounceable(address: string) {
    const addr = new TonWeb.Address(address);
    return !addr.isUserFriendly || addr.isBounceable;
  }

  static isTestnet(address: string) {
    const addr = new TonWeb.Address(address);
    return addr.isTestOnly;
  }

  static compare(adr1?: string, adr2?: string) {
    if (adr1 === undefined || adr2 === undefined) {
      return false;
    }

    if (!TonWeb.Address.isValid(adr1) || !TonWeb.Address.isValid(adr2)) {
      return false;
    }

    try {
      const address1 = new TonWeb.Address(adr1).toString(false);
      const address2 = new TonWeb.Address(adr2).toString(false);

      return address1 === address2;
    } catch {
      return false;
    }
  }

  static async fromPubkey(
    pubkey: string | null,
    isTestnet: boolean,
    lockupConfig?: {
      workchain: number;
      configPubKey?: string;
      allowedDestinations?: string;
    },
  ): Promise<AddressesByVersion | null> {
    if (!pubkey) return null;

    const tonweb = new TonWeb();
    const addresses = {} as AddressesByVersion;

    const publicKey = Uint8Array.from(Buffer.from(pubkey, 'hex'));
    for (let contractVersion of ContractVersions) {
      if (contractVersion === 'lockup-0.1') {
        continue;
      }

      const wallet = new tonweb.wallet.all[contractVersion](tonweb.provider, {
        publicKey,
        wc: 0,
      });

      const address = await wallet.getAddress();
      const raw = address.toString(false, false);
      const friendly = address.toString(true, true, false, isTestnet);
      const short = Address.toShort(friendly);

      addresses[contractVersion] = {
        friendly,
        raw,
        short,
      };
    }

    if (lockupConfig) {
      const wallet = new tonweb.lockupWallet.all['lockup-0.1'](tonweb.provider, {
        publicKey,
        wc: lockupConfig.workchain,
        config: {
          wallet_type: 'lockup-0.1',
          config_public_key: lockupConfig.configPubKey,
          allowed_destinations: lockupConfig.allowedDestinations,
        },
      });

      const address = await wallet.getAddress();
      const raw = address.toString(false, false);
      const friendly = address.toString(true, true, false, isTestnet);
      const short = Address.toShort(friendly);

      addresses['lockup-0.1'] = {
        friendly,
        raw,
        short,
      };
    }

    return addresses;
  }

  public toAll(options?: FormatOptions): AddressFormats {
    const { bounceable, testOnly, urlSafe } = this.mergeOptions(options);
    const friendly = this.address.toString(true, urlSafe, bounceable, testOnly);
    const raw = this.address.toString(false, false, bounceable, testOnly);
    const short = Address.toShort(friendly);

    return { friendly, raw, short };
  }

  public toFriendly(options?: FormatOptions) {
    const { bounceable, urlSafe, testOnly } = this.mergeOptions(options);
    return this.address.toString(true, urlSafe, bounceable, testOnly);
  }

  public toRaw(options?: FormatOptions) {
    const { bounceable, testOnly } = this.mergeOptions(options);
    return this.address.toString(false, false, bounceable, testOnly);
  }

  // toFriendly alias
  public toString(options?: FormatOptions) {
    return this.toFriendly(options);
  }

  public toShort(symbolsInPart: number = 4) {
    const friendly = this.toFriendly();
    return Address.toShort(friendly, symbolsInPart);
  }

  public toTonWeb() {
    return this.address;
  }

  private mergeOptions(options: FormatOptions = {}): Required<FormatOptions> {
    return {
      bounceable: this.getFormatOption(this.formatOptions.bounceable),
      testOnly: this.getFormatOption(this.formatOptions.testOnly),
      urlSafe: this.getFormatOption(this.formatOptions.urlSafe),
      ...options,
    };
  }

  private getFormatOption(option: (() => boolean) | boolean) {
    if (typeof option === 'function') {
      return option();
    }

    return option;
  }
}

// Wrap for isolate global app options
export class AddressFormatter {
  constructor(private options?: Partial<DefaultFormatOptions>) {} // Save and redirect to Address class

  public parse(source: string, options?: Partial<DefaultFormatOptions>) {
    return Address.parse(source, { ...this.options, ...options });
  }

  public fromPubkey = Address.fromPubkey;
  public compare = Address.compare;
  public isValid = Address.isValid;
  public toShort = Address.toShort;
}
