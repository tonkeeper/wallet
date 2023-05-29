import React, { FC, memo, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Button, InlineHeader, Loader, Spacer, View } from '$uikit';
import * as S from '../core/Exchange/Exchange.style';
import { exchangeSelector } from '$store/exchange';
import { ExchangeItem } from '../core/Exchange/ExchangeItem/ExchangeItem';
import { useTranslator } from '$hooks';
import { getServerConfig, getServerConfigSafe } from '$shared/constants';
import { Linking } from 'react-native';
import { Modal } from '$libs/navigation';
import { Steezy } from '$styles';

export const ExchangeModal = () => {
  const t = useTranslator();

  const { isLoading, categories } = useSelector(exchangeSelector);

  const otherWaysAvailable = getServerConfigSafe('exchangePostUrl') !== 'none';

  const openOtherWays = useCallback(() => {
    try {
      const url = getServerConfig('exchangePostUrl');

      Linking.openURL(url);
    } catch {}
  }, []);

  return (
    <Modal>
      <Modal.Header title={t('exchange_modal.title')} />
      <Modal.Content safeArea>
        <View style={styles.container}>
          {isLoading ? (
            <S.LoaderWrap>
              <Loader size="medium" />
            </S.LoaderWrap>
          ) : (
            <>
              {categories.map((category, cIndex) => (
                <React.Fragment key={category.title}>
                  {cIndex > 0 ? <Spacer y={32} /> : null}
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
                  {otherWaysAvailable && category.type === 'buy' ? (
                    <View style={styles.otherWaysContainer}>
                      <Button
                        size="medium_rounded"
                        mode="secondary"
                        onPress={openOtherWays}
                      >
                        {t('exchange_modal.other_ways_to_buy')}
                      </Button>
                    </View>
                  ) : null}
                </React.Fragment>
              ))}
            </>
          )}
        </View>
      </Modal.Content>
    </Modal>
  );
};

const styles = Steezy.create({
  container: {
    paddingBottom: 16,
  },
  otherWaysContainer: {
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
