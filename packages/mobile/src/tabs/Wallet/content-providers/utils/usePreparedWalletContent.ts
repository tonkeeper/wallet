import { useCallback, useEffect, useRef, useState } from 'react';
import { CellItemToRender } from './types';
import BigNumber from 'bignumber.js';
import { useInstance } from '$hooks/useInstance';
import { WalletContentReceiver } from './receiver';
import { useContentProvider } from './useContentProvider';
import { TONContentProvider } from '../ton';
import { InscriptionsContentProvider } from '../inscriptions';
import { StakingContentProvider } from '../staking';
import { TokensContentProvider } from '../tokens';

export const usePreparedWalletContent = () => {
  const tonContentProvider = useContentProvider(() => new TONContentProvider());
  const tokensContentProvider = useContentProvider(() => new TokensContentProvider());
  const stakingContentProvider = useContentProvider(() => new StakingContentProvider());
  const inscriptionsContentProvider = useContentProvider(
    () => new InscriptionsContentProvider(),
  );
  const providers = useRef([
    tonContentProvider,
    tokensContentProvider,
    stakingContentProvider,
    inscriptionsContentProvider,
  ]).current;

  const providersReceiver = useInstance(() => new WalletContentReceiver(providers));
  const [preparedContent, setPreparedContent] = useState<CellItemToRender[]>([]);

  const getPreparedContent = useCallback(() => {
    let content: CellItemToRender[] = [];

    providers.map((provider) => {
      content.push(...provider.cellItems);
    });

    content = content.sort((a, b) => {
      const comparedPriority = b.renderPriority - a.renderPriority;

      if (comparedPriority !== 0) {
        return comparedPriority;
      }

      if (!a.fiatRate && b.fiatRate) {
        return 1;
      }
      if (a.fiatRate && !b.fiatRate) {
        return -1;
      }

      if (!a.fiatRate && !b.fiatRate) {
        return 0;
      }

      return new BigNumber(b.fiatRate.total.raw).comparedTo(a.fiatRate.total.raw);
    });

    const firstTokenElement = content[0] as CellItemToRender;
    const lastTokenElement = content[content.length - 1] as CellItemToRender;

    // Make list; set corners
    if (firstTokenElement) {
      firstTokenElement.isFirst = true;
      lastTokenElement.isLast = true;
    }

    return content;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsubscribe = providersReceiver.subscribe(() => {
      setPreparedContent(getPreparedContent());
    });

    setPreparedContent(getPreparedContent());

    return () => {
      unsubscribe();
    };
  }, [getPreparedContent, providersReceiver]);

  return preparedContent;
};
