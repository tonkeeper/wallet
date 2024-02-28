class BlockingLoaderStore {
  private isShown: boolean;
  private listeners: Set<() => void>;

  constructor() {
    this.isShown = false;
    this.listeners = new Set();
  }

  private setShow(newState: boolean): void {
    if (this.isShown !== newState) {
      this.isShown = newState;
      this.listeners.forEach((listener) => listener());
    }
  }

  public show(): void {
    this.setShow(true);
  }

  public hide(): void {
    this.setShow(false);
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getSnapshot(): boolean {
    return this.isShown;
  }
}

export const BlockingLoader = new BlockingLoaderStore();
