import { PagerViewWizard, usePagerViewWizard } from '../../components/PagerViewWizard';
import { Screen, Steezy, PagerView } from '@tonkeeper/uikit';
import { memo } from 'react';

export const CreateWalletScreen = memo(() => {
  const wizard = usePagerViewWizard({ steps: 2 });

  return (
    <Screen>
      <Screen.Header onBackPress={wizard.onBackPress} title={wizard.indicator} />
      <PagerViewWizard wizard={wizard}>
        <PagerView.Page>
          {/* <CreatePinCodePage 
            onNext
          /> */}
        </PagerView.Page>
      </PagerViewWizard>
    </Screen>
  );
});

const styles = Steezy.create({});
