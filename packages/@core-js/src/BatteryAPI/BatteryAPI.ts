import { HttpClient, HttpClientOptions } from '../TonAPI/HttpClient';
import { BatteryGenerated } from './BatteryGenerated';

export class BatteryAPI extends BatteryGenerated<any> {
  constructor(opts: HttpClientOptions) {
    super(new (HttpClient as any)(opts));
  }
}
