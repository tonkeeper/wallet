import React, { memo } from 'react';
import { OnboardBanner } from './components/OnboardBanner';
import { Spacer, Steezy, View } from '@tonkeeper/uikit';
import { CardsList } from './components/CardsList';
import { tk } from '$wallet';
import { useCardsState } from '$wallet/hooks';

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
          <Spacer y={16} />
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
