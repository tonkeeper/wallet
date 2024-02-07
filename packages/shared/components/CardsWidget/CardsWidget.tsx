import React, { memo } from 'react';
import { OnboardBanner } from './components/OnboardBanner';
import { Steezy, View } from '@tonkeeper/uikit';
import { tk } from '@tonkeeper/mobile/src/wallet';
import { useCardsState } from '../../query/hooks/useCardsState';

export const CardsWidget = memo(() => {
  const state = useCardsState();

  return (
    <View style={styles.container}>
      {!state.onboardBannerDismissed && (
        <OnboardBanner onDismissBanner={() => tk.wallet.cards.dismissOnboardBanner()} />
      )}
    </View>
  );
});

const styles = Steezy.create({
  container: {
    paddingHorizontal: 16,
  },
});
