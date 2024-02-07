export class InjectEngine {
  #methods = new Map<
    string,
    {
      handler: (src: any) => Promise<any>;
    }
  >();

  registerMethod<T, R>(name: string, handler: (src: T) => Promise<R>) {
    if (this.#methods.has(name)) {
      throw Error('Method ' + name + ' already exist');
    }
    this.#methods.set(name, { handler });
  }

  async execute(src: any): Promise<any> {
    try {
      let method = this.#methods.get(src.name);
      if (!method) {
        throw Error('Invalid method name');
      }
      // Execute
      let res = await method.handler(src.args);
      return { type: 'ok', data: res };
    } catch (e) {
      if (e && typeof (e as any).message === 'string') {
        return { type: 'error', message: (e as any).message };
      } else {
        return { type: 'error', message: 'Unknown error' };
      }
    }
  }
}
