import { SheetActions, navigation } from '@tonkeeper/router';
import { AddWalletModal } from '@tonkeeper/shared/modals/AddWalletModal';

export function openRequireWalletModal() {
  navigation.navigate('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: AddWalletModal,
    params: {},
    path: '/add-wallet',
  });
}
