type Subscriber<TData> = (state: TData) => void;

export type DefaultStateData = Record<string, any>;

export class State<TData extends DefaultStateData> {
  public subscribers = new Set<Subscriber<TData>>();

  constructor(public data: TData) {}

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
  };

  private emit() {
    this.subscribers.forEach((subscriber) => subscriber(this.data));
  }
}
