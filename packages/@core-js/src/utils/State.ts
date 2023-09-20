import { Storage } from '../declarations/Storage';

type Subscriber<TData> = (state: TData) => void;

export type DefaultStateData = Record<string, any>;

export interface StatePersistOptions<TData extends DefaultStateData> {
  key: string;
  storage: Storage;
  partialize?: (data: TData) => Partial<TData>;
}

export class State<TData extends DefaultStateData> {
  public subscribers = new Set<Subscriber<TData>>();

  private persistOptions?: StatePersistOptions<TData>;

  constructor(public data: TData) {}

  private async storeIfNeeded() {
    if (!this.persistOptions) {
      return;
    }

    const { key, storage, partialize } = this.persistOptions;

    try {
      const data = partialize ? partialize(this.data) : this.data;
      await storage.setItem(key, JSON.stringify(data));
    } catch {}
  }

  public persist(options: StatePersistOptions<TData>) {
    this.persistOptions = options;

    return this;
  }

  public async rehydrate() {
    if (!this.persistOptions) {
      return;
    }

    const { key, storage } = this.persistOptions;

    try {
      const data = await storage.getItem(key);
      if (data === null) {
        return;
      }
      const parsedData = JSON.parse(data);
      this.data = { ...this.data, ...parsedData };
      this.emit();
    } catch {}
  }

  public subscribe = (subscriber: Subscriber<TData>) => {
    this.subscribers.add(subscriber);
    return () => this.subscribers.delete(subscriber);
  };

  public cleaSubscribers = () => {
    this.subscribers.clear();
  };

  public getSnapshot = () => {
    return this.data;
  };

  public set = (updater: Partial<TData> | ((data: TData) => Partial<TData>)) => {
    const newData = typeof updater === 'function' ? updater(this.data) : updater;
    this.data = { ...this.data, ...newData };
    this.emit();
    this.storeIfNeeded();
  };

  private emit() {
    this.subscribers.forEach((subscriber) => subscriber(this.data));
  }
}
