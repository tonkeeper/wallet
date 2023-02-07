import { IAppSdk } from '@tonkeeper/core-js/src/AppSdk';
import { EventEmitter } from '@tonkeeper/core-js/src/entries/eventEmitter';
import copyToClipboard from 'copy-to-clipboard';

export class BrowserAppSdk implements IAppSdk {
  copyToClipboard = (value: string, notification?: string) => {
    copyToClipboard(value);
    this.uiEvents.emit('copy', {
      method: 'copy',
      params: notification,
    });
  };
  openPage = async (url: string) => {
    window.open(url, '_black');
  };
  uiEvents = new EventEmitter();
  version = process.env.REACT_APP_VERSION ?? 'Unknown';
}
