import { ContentProviderPrototype } from './prototype';
import debounce from 'lodash/debounce';

type Subscriber = () => void;

export class WalletContentReceiver {
  private subscribedTo = new Map<string, () => void>();
  private subscribers = new Set<Subscriber>();

  private debouncedEmit = debounce(() => {
    this.subscribers.forEach((subscriber) => {
      subscriber();
    });
  }, 120);

  constructor(private providersList: ContentProviderPrototype<any>[]) {
    this.subscribeToProvidersChanges(providersList);
  }

  private subscribeToProvidersChanges(provider: ContentProviderPrototype<any>[]) {
    provider.forEach((provider) => {
      const unsubscribe = provider.subscribe(() => {
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
