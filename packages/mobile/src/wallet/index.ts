import { AppStorage } from '@tonkeeper/shared/modules/AppStorage';
import { Tonkeeper } from './Tonkeeper';
import { vault } from './AppVault';

export const storage = new AppStorage();

export const tk = new Tonkeeper({
  storage,
  vault,
});

export { vault };
