import React, { memo } from 'react';
import { OnboardBanner } from './components/OnboardBanner';
import { tk } from '@tonkeeper/mobile/src/wallet';
import { Spacer, Steezy, View } from '@tonkeeper/uikit';
import { useCardsState } from '../../query/hooks/useCardsState';
import { CardsList } from './components/CardsList';

export const CardsWidget = memo(() => {
  const state = useCardsState();

  return (
    <View style={styles.container}>
      {!state.accounts.length && !state.onboardBannerDismissed ? (
        <OnboardBanner onDismissBanner={() => tk.wallet.cards.dismissOnboardBanner()} />
      ) : null}
      {state.accounts.length ? (
        <>
          <CardsList accounts={state.accounts} />
          <Spacer y={32} />
        </>
      ) : null}
    </View>
  );
});

const styles = Steezy.create({
  container: {
    paddingHorizontal: 16,
  },
});
