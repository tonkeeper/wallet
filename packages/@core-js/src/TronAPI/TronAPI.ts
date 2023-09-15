import { HttpClient, HttpClientOptions } from '../TonAPI/HttpClient';
import { TronAPIGenerated } from './TronAPIGenerated';

export class TronAPI extends TronAPIGenerated<any> {
  constructor(opts: HttpClientOptions) {
    super(new (HttpClient as any)(opts));
  }
}
