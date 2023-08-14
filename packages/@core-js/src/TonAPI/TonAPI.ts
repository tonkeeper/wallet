import { HttpClient, HttpClientOptions } from './HttpClient';
import { TonAPIGenerated } from './TonAPIGenerated';

export class TonAPI extends TonAPIGenerated<any> {
  constructor(opts: HttpClientOptions) {
    super(new (HttpClient as any)(opts));
  }
}
