import React, { memo } from 'react';
import { OnboardBanner } from './components/OnboardBanner';
import { Spacer, Steezy, View } from '@tonkeeper/uikit';
import { CardsList } from './components/CardsList';
import { tk } from '$wallet';
import { useCardsState } from '$wallet/hooks';

export const CardsWidget = memo(() => {
  const state = useCardsState();

  const shouldRenderCardsList =
    state.accounts.filter((account) =>
      ['PENDING_CONTRACT', 'ACTIVE'].includes(account.state),
    ).length || state.prepaidCards.length;

  return (
    <View style={styles.container}>
      {!state.accounts.length && !state.onboardBannerDismissed ? (
        <OnboardBanner onDismissBanner={() => tk.wallet.cards.dismissOnboardBanner()} />
      ) : null}
      {shouldRenderCardsList ? (
        <>
          <CardsList prepaidCards={state.prepaidCards} accounts={state.accounts} />
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
