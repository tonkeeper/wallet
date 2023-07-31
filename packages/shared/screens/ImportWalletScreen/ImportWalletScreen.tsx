import { PagerViewWizard, usePagerViewWizard } from '../../components/PagerViewWizard';
import { CreatePasscodePage } from './CreatePasscodePage';
import { RecoveryPhrasePage } from './EnterWordsPage/RecoveryPhrasePage';
import { Screen, Steezy, PagerView } from '@tonkeeper/uikit';
import { memo } from 'react';

export const ImportWalletScreen = memo(() => {
  const wizard = usePagerViewWizard({ steps: 2 });

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
          <CreatePasscodePage />
        </PagerView.Page>
      </PagerViewWizard>
    </Screen>
  );
});

const styles = Steezy.create({});
