import React, { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { BottomSheet, Loader } from '$uikit';
import * as S from './Exchange.style';
import { exchangeSelector } from '$store/exchange';
import { ExchangeItem } from '$core/Exchange/ExchangeItem/ExchangeItem';
import { useTranslator } from '$hooks';

export const Exchange: FC = () => {
  const t = useTranslator();

  const { isLoading, categories } = useSelector(exchangeSelector);

  const items = useMemo(() => {
    let result: string[] = [];
    for (const category of categories) {
      result.push(...category.items);
    }
    return result;
  }, [categories]);

  function renderContent() {
    if (isLoading) {
      return (
        <S.LoaderWrap>
          <Loader size="medium" />
        </S.LoaderWrap>
      );
    }

    return (
      <S.Contain>
        {items.map((item, idx, arr) => (
          <ExchangeItem
            topRadius={idx === 0}
            bottomRadius={idx === arr.length - 1}
            key={item}
            methodId={item}
          />
        ))}
      </S.Contain>
    );
  }

  return <BottomSheet title={t('exchange_title')}>{renderContent()}</BottomSheet>;
};
