import React, { FC, useCallback } from 'react';

import { InlineHeader, Loader } from '$uikit';
import * as S from './Exchange.style';
import { ExchangeItem } from './ExchangeItem/ExchangeItem';
import { getServerConfig, getServerConfigSafe } from '$shared/constants';
import { Linking } from 'react-native';
import { Modal } from '@tonkeeper/uikit';
import { useMethodsToBuyStore } from '$store/zustand/methodsToBuy/useMethodsToBuyStore';
import { t } from '@tonkeeper/shared/i18n';

export const OldExchange: FC = () => {
  const categories = useMethodsToBuyStore((state) => state.categories);

  const otherWaysAvailable = getServerConfigSafe('exchangePostUrl') !== 'none';

  const openOtherWays = useCallback(() => {
    try {
      const url = getServerConfig('exchangePostUrl');

      Linking.openURL(url);
    } catch {}
  }, []);

  return (
    <Modal>
      <Modal.Header title={categories[0]?.title || t('exchange_title')} />
      <Modal.ScrollView>
        {!categories.length ? (
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
                      key={item.id}
                      methodId={item.id}
                    />
                  ))}
                </S.Contain>
              </React.Fragment>
            ))}
            {otherWaysAvailable ? (
              <S.OtherWaysButtonContainer>
                <S.OtherWaysButton onPress={openOtherWays}>
                  <S.OtherWaysButtonLabel>
                    {t('exchange_other_ways')}
                  </S.OtherWaysButtonLabel>
                </S.OtherWaysButton>
              </S.OtherWaysButtonContainer>
            ) : null}
          </>
        )}
      </Modal.ScrollView>
      <Modal.Footer />
    </Modal>
  );
};
