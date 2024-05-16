import { Storage } from '../declarations/Storage';

type Subscriber<TData> = (state: TData) => void;

export type DefaultStateData = Record<string, any>;

export interface StatePersistOptions<TData extends DefaultStateData> {
  key: string;
  storage: Storage;
  partialize?: (data: TData) => Partial<TData>;
  rehydrated?: (data: TData) => void;
  version?: number;
  onUpdate?: (prevVersion: number | undefined, prevData: any) => Partial<TData>;
}

export class State<TData extends DefaultStateData> {
  private initialState: TData;
  public subscribers = new Set<Subscriber<TData>>();

  private persistOptions?: StatePersistOptions<TData>;

  constructor(public data: TData) {
    this.initialState = data;
  }

  private async storeIfNeeded() {
    if (!this.persistOptions) {
      return;
    }

    const { key, storage, partialize } = this.persistOptions;

    try {
      const data: Partial<TData> & { __version?: number } = partialize
        ? partialize(this.data)
        : this.data;

      // We should keep last version in storage
      data.__version = this.persistOptions.version;

      await storage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.log('[State]: error persist for key', key, err);
    }
  }

  public persist(options: StatePersistOptions<TData>) {
    this.persistOptions = options;
    return this;
  }

  public async rehydrate() {
    if (!this.persistOptions) {
      return;
    }

    const { key, storage, rehydrated } = this.persistOptions;

    try {
      const data = await storage.getItem(key);

      if (data === null) {
        return;
      }
      const parsedData = JSON.parse(data);

      this.data = { ...this.data, ...parsedData };

      if (
        this.persistOptions.onUpdate &&
        this.persistOptions.version &&
        (!parsedData.__version || this.persistOptions.version > parsedData.__version)
      ) {
        this.data = {
          ...this.data,
          ...this.persistOptions.onUpdate(parsedData.__version, this.data),
        };
        this.storeIfNeeded();
      }

      if (rehydrated) {
        rehydrated(this.data);
      }

      this.emit();
    } catch (err) {
      console.log('[State]: error rehydrate for key', key, err);
    }
  }

  public subscribe = (subscriber: Subscriber<TData>) => {
    this.subscribers.add(subscriber);
    return () => this.subscribers.delete(subscriber);
  };

  public getSnapshot = () => {
    return this.data;
  };

  public clear() {
    this.data = this.initialState;
    this.emit();
  }

  public async clearPersist() {
    if (!this.persistOptions) {
      return;
    }

    const { key, storage } = this.persistOptions;
    return await storage.removeItem(key);
  }

  public set = (updater: Partial<TData> | ((data: TData) => Partial<TData>)) => {
    const newData = typeof updater === 'function' ? updater(this.data) : updater;
    this.data = { ...this.data, ...newData };
    this.emit();
    this.storeIfNeeded();
  };

  public setAsync = async (
    updater: Partial<TData> | ((data: TData) => Partial<TData>),
  ) => {
    const newData = typeof updater === 'function' ? updater(this.data) : updater;
    this.data = { ...this.data, ...newData };
    this.emit();
    await this.storeIfNeeded();
  };

  private emit() {
    this.subscribers.forEach((subscriber) => subscriber(this.data));
  }
}
