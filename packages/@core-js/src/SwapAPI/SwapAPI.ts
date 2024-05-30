import { HttpClient, HttpClientOptions } from '../TonAPI/HttpClient';
import { SwapGenerated } from './SwapGenerated';

export class SwapAPI extends SwapGenerated<any> {
  constructor(opts: HttpClientOptions) {
    super(new (HttpClient as any)(opts));
  }
}
