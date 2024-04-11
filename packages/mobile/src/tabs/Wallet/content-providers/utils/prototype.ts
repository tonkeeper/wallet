import { CellItemToRender } from './types';
import { Wallet } from '$wallet/Wallet';
import { tk } from '$wallet';
import { DependencyPrototype } from '../dependencies/utils/prototype';

type Subscriber = () => void;

export type ExternalStateSelector<TStateData, TSelectedData> = (
  state: TStateData,
) => TSelectedData;

export class ContentProviderPrototype<
  T extends Record<string, DependencyPrototype<any>> = {},
> {
  public name: string = '';
  protected renderPriority?: number;

  protected wallet: Wallet = tk.wallet;
  public subscribers = new Set<Subscriber>();

  constructor(protected deps: T = {} as T) {
    Object.values(deps).map((dep) => {
      dep.subscribe(() => {
        this.emitSubscribers();
      });
    });
  }

  protected emitSubscribers() {
    this.subscribers.forEach((subscriber) => {
      subscriber();
    });
  }

  public subscribe(subscriber: Subscriber) {
    this.subscribers.add(subscriber);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  get itemsArray(): any[] {
    return [];
  }

  get cellItems(): CellItemToRender[] {
    return this.itemsArray.map((item) => this.makeCellItemFromData(item));
  }

  makeCellItemFromData(data: any): CellItemToRender {
    return {
      key: 'key',
      renderPriority: this.renderPriority,
      title: 'title',
      subtitle: 'subtitle',
      value: 'value',
    };
  }
}
