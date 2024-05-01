import { Wallet } from '$wallet/Wallet';
import { tk } from '$wallet';
import { DefaultStateData, State } from '@tonkeeper/core';
import { shallow } from 'zustand/shallow';

type Subscriber = () => void;

export type ExternalStateSelector<TStateData, TSelectedData> = (
  state: TStateData,
) => TSelectedData;

export class DependencyPrototype<
  TStateData extends DefaultStateData,
  TSelected = TStateData,
> {
  protected wallet: Wallet = tk.wallet;
  public subscribers = new Set<Subscriber>();

  protected unsubscribe?: () => void;
  protected latestSnapshot: TSelected;

  protected shouldEmit(prev: TSelected, cur: TSelected): boolean {
    return !shallow(cur, prev);
  }

  get state() {
    return this.latestSnapshot;
  }

  constructor(
    protected dataProvider: State<TStateData>,
    protected selector: ExternalStateSelector<TStateData, TSelected>,
  ) {
    const data = this.dataProvider?.getSnapshot();
    this.latestSnapshot = this.selector(data);
    this.subscribeToDataProvider();
  }

  protected subscribeToDataProvider() {
    this.unsubscribe?.();
    this.unsubscribe = this.dataProvider?.subscribe(() => {
      this.onStateChanged();
    });
  }

  private onStateChanged() {
    const prevState = this.latestSnapshot;
    const currentState = this.selector(this.dataProvider?.getSnapshot());
    if (this.shouldEmit(prevState, currentState)) {
      this.latestSnapshot = currentState;
      this.emitSubscribers();
    }
  }

  protected emitSubscribers() {
    this.subscribers.forEach((subscriber) => {
      try {
        subscriber();
      } catch (error) {
        console.error('An error occurred when executing a subscriber: ', error);
      }
    });
  }

  public subscribe(subscriber: Subscriber) {
    this.subscribers.add(subscriber);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  public destroy() {
    this.unsubscribe?.();
  }
}
