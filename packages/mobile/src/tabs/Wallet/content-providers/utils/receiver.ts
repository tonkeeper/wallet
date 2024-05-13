import { ContentProviderPrototype } from './prototype';
import debounce from 'lodash/debounce';
import { TonPriceDependency } from '../dependencies/tonPrice';
import { TONContentProvider } from '../ton';
import { TonBalancesDependency } from '../dependencies/tonBalances';
import { CellItemToRender } from './types';
import { TokensContentProvider } from '../tokens';
import { StakingJettonsDependency } from '../dependencies/stakingJettons';
import { TokenApprovalDependency } from '../dependencies/tokenApproval';
import { JettonBalancesDependency } from '../dependencies/jettons';
import { StakingContentProvider } from '../staking';
import { StakingDependency } from '../dependencies/staking';
import { InscriptionsContentProvider } from '../inscriptions';
import { InscriptionsDependency } from '../dependencies/inscriptions';
import { NamespacedLogger, logger } from '$logger';
import BigNumber from 'bignumber.js';
import { Wallet } from '$wallet/Wallet';
import { tk } from '$wallet';
import { NotCoinVouchersDependency } from '../dependencies/notcoinVouchers';
import { VouchersContentProvider } from '../vouchers';

type Subscriber = (cells: CellItemToRender[]) => void;

export class WalletContentReceiver {
  private subscribedTo = new Map<string, () => void>();
  private subscribers = new Set<Subscriber>();

  private logger: NamespacedLogger;
  private wallet: Wallet = tk.wallet;

  private tonPrice = new TonPriceDependency(tk.tonPrice.state);
  private tonBalances = new TonBalancesDependency(this.wallet);
  private stakingJettons = new StakingJettonsDependency(this.wallet);
  private tokenApproval = new TokenApprovalDependency(this.wallet);
  private jettonBalances = new JettonBalancesDependency(this.wallet);
  private staking = new StakingDependency(this.wallet);
  private inscriptions = new InscriptionsDependency(this.wallet);
  private notCoinVouchers = new NotCoinVouchersDependency(this.wallet);

  private memoizedCells = new Map<string, CellItemToRender[] | false>();

  private depsList = [
    this.tonPrice,
    this.tonBalances,
    this.stakingJettons,
    this.tokenApproval,
    this.jettonBalances,
    this.staking,
    this.inscriptions,
    this.notCoinVouchers,
  ];

  constructor() {
    this.subscribeToProvidersChanges(this.providersList);
    this.logger = logger.extend('WalletListContent');
  }

  private providersList: ContentProviderPrototype<any>[] = [
    new TONContentProvider(this.tonPrice, this.tonBalances),
    new TokensContentProvider(
      this.tonPrice,
      this.stakingJettons,
      this.tokenApproval,
      this.jettonBalances,
    ),
    new StakingContentProvider(this.tonPrice, this.jettonBalances, this.staking),
    new InscriptionsContentProvider(this.tonPrice, this.inscriptions, this.tokenApproval),
    new VouchersContentProvider(this.tonPrice, this.jettonBalances, this.notCoinVouchers),
  ];

  public destroy() {
    this.logger.warn('Destroy');
    this.depsList.forEach((provider) => {
      provider.destroy();
    });
  }

  public sortCellItems(cellItems: CellItemToRender[]): CellItemToRender[] {
    let content: CellItemToRender[] = cellItems;

    content = content.slice().sort((a, b) => {
      const comparedPriority = b.renderPriority - a.renderPriority;

      if (comparedPriority !== 0) {
        return comparedPriority;
      }

      if (!a.fiatRate && b.fiatRate) {
        return 1;
      }
      if (a.fiatRate && !b.fiatRate) {
        return -1;
      }

      if (!a.fiatRate && !b.fiatRate) {
        return 0;
      }

      return new BigNumber(b.fiatRate.total.raw).comparedTo(a.fiatRate.total.raw);
    });

    // Make list; set corners. Mutates objects so we need to copy them
    if (content[0]) {
      content[0] = Object.assign({ isFirst: true }, content[0]);
      content[content.length - 1] = Object.assign(
        { isLast: true },
        content[content.length - 1],
      );
    }

    return content;
  }

  get cellItems() {
    return this.sortCellItems(
      this.providersList.flatMap((provider) => {
        const memoized = this.memoizedCells.get(provider.name);
        if (memoized) {
          return memoized;
        }
        const cellItems = provider.cellItems;
        this.memoizedCells.set(provider.name, cellItems);
        return cellItems;
      }),
    );
  }

  private debouncedEmit = debounce(() => {
    this.subscribers.forEach((subscriber) => {
      subscriber(this.cellItems);
    });
  }, 50);

  private subscribeToProvidersChanges(provider: ContentProviderPrototype<any>[]) {
    provider.forEach((provider) => {
      const unsubscribe = provider.subscribe(() => {
        this.memoizedCells.set(provider.name, false);
        this.debouncedEmit();
      });
      this.subscribedTo.set(provider.name, unsubscribe);
    });
  }

  public subscribe(subscriber: Subscriber) {
    this.subscribers.add(subscriber);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }
}
