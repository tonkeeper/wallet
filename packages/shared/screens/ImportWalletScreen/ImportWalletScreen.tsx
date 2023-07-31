import { PagerViewWizard, usePagerViewWizard } from '../../components/PagerViewWizard';
import { CreatePasscodePage } from './CreatePasscodePage';
import { RecoveryPhrasePage } from './EnterWordsPage/RecoveryPhrasePage';
import { Screen, Steezy, PagerView } from '@tonkeeper/uikit';
import { memo } from 'react';
import { WalletNamePage } from './WalletNamePage';
import { useNavigation } from '@tonkeeper/router';

export const ImportWalletScreen = memo(() => {
  const wizard = usePagerViewWizard({ steps: 2 });
  const nav = useNavigation();

  return (
    <Screen>
      <Screen.Header onBackPress={wizard.onBackPress} title={wizard.indicator} />
      <PagerViewWizard wizard={wizard}>
        <PagerView.Page>
          <RecoveryPhrasePage
            onNext={({ phrase }) => {
              console.log(phrase);
              wizard.pagerViewRef?.current?.setPage(1);
              wizard.enableSwipe();
            }}
          />
        </PagerView.Page>
        <PagerView.Page>
          <WalletNamePage 
            onNext={() => nav.navigate('Tabs')}
          />
          
          {/* <CreatePasscodePage /> */}
        </PagerView.Page>
      </PagerViewWizard>
    </Screen>
  );
});

const styles = Steezy.create({});
