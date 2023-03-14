import React, { FC, memo, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Button, InlineHeader, Loader, View } from '$uikit';
import * as S from '../core/Exchange/Exchange.style';
import { exchangeSelector } from '$store/exchange';
import { ExchangeItem } from '../core/Exchange/ExchangeItem/ExchangeItem';
import { useTranslator } from '$hooks';
import { getServerConfig, getServerConfigSafe } from '$shared/constants';
import { Linking } from 'react-native';
import { Modal } from '$libs/navigation';
import { Steezy } from '$styles';

interface ExchangeModalProps {
  category: 'buy' | 'sell';
}

export const ExchangeModal = ({ category }: ExchangeModalProps) => {
  const t = useTranslator();

  const { isLoading, categories } = useSelector(exchangeSelector);

  const isSell = category === 'sell';

  const sellItems = useMemo(() => {
    return categories.filter((item) => {
      if (isSell) {
        return item.title === 'Sell TON';
      }
      
      return item.title === 'Buy TON';
    });
  }, [isSell]);

  const otherWaysAvailable = getServerConfigSafe('exchangePostUrl') !== 'none';

  const openOtherWays = useCallback(() => {
    try {
      const url = getServerConfig('exchangePostUrl');

      Linking.openURL(url);
    } catch {}
  }, []);

  return (
    <Modal>
      <Modal.Header 
        title={
          isSell
            ? t('exchange_modal.sell_title') 
            : t('exchange_modal.buy_title')
        } 
      />
      <Modal.Content safeArea>
        <View style={styles.container}>
          {isLoading ? (
            <S.LoaderWrap>
              <Loader size="medium" />
            </S.LoaderWrap>
          ) : (
            <>
              {sellItems.map((category, cIndex) => (
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
              {otherWaysAvailable && (
                <View style={styles.otherWaysContainer}>
                  <Button size="medium_rounded" mode="secondary" onPress={openOtherWays}>
                    {
                      isSell 
                        ? t('exchange_modal.other_ways_to_sell')
                        : t('exchange_modal.other_ways_to_buy')
                    }
                  </Button>
                </View>
              )}
            </>
          )}
        </View>
      </Modal.Content>
    </Modal>
  );
};

const styles = Steezy.create({
  container: {
    paddingBottom: 16
  },
  otherWaysContainer: {
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center'
  }
});