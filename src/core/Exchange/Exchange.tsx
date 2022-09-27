import React, { FC } from 'react';
import { useSelector } from 'react-redux';

import { BottomSheet, InlineHeader, Loader } from '$uikit';
import * as S from './Exchange.style';
import { exchangeSelector } from '$store/exchange';
import { ExchangeItem } from './ExchangeItem/ExchangeItem';
import { useTranslator } from '$hooks';

export const Exchange: FC = () => {
  const t = useTranslator();

  const { isLoading, categories } = useSelector(exchangeSelector);

  return (
    <BottomSheet title={categories[0]?.title || t('exchange_title')}>
      {isLoading ? (
        <S.LoaderWrap>
          <Loader size="medium" />
        </S.LoaderWrap>
      ) : (
        <>
          {categories.map((category, cIndex) => (
            <React.Fragment key={category.title}>
              {cIndex > 0 ? (
                <S.HeaderContainer>
                  <InlineHeader>{category.title}</InlineHeader>
                </S.HeaderContainer>
              ) : null}
              <S.Contain>
                {category.items.map((item, idx, arr) => (
                  <ExchangeItem
                    topRadius={idx === 0}
                    bottomRadius={idx === arr.length - 1}
                    key={item}
                    methodId={item}
                  />
                ))}
              </S.Contain>
            </React.Fragment>
          ))}
        </>
      )}
    </BottomSheet>
  );
};
