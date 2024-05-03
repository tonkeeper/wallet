import React, { useCallback, useMemo, useState } from 'react';

import { Loader, Spacer, View } from '$uikit';
import * as S from '../core/Exchange/Exchange.style';
import { ExchangeItem } from '../core/Exchange/ExchangeItem/ExchangeItem';
import { t } from '@tonkeeper/shared/i18n';
import { LayoutAnimation } from 'react-native';
import { Button, Modal, SegmentedControl, Text } from '@tonkeeper/uikit';
import { Steezy } from '$styles';
import { useMethodsToBuyStore } from '$store/zustand/methodsToBuy/useMethodsToBuyStore';
import { CategoryType } from '$store/zustand/methodsToBuy/types';
import { openChooseCountry } from '$navigation';
import { useSelectedCountry } from '$store/zustand/methodsToBuy/useSelectedCountry';
import { CountryButton } from '@tonkeeper/shared/components';
import { config } from '$config';
import { useWallet } from '@tonkeeper/shared/hooks';

export const ExchangeModal = () => {
  const [showAll, setShowAll] = React.useState(false);
  const { defaultLayout, layoutByCountry, buy, sell } = useMethodsToBuyStore(
    (state) => state,
  );

  const selectedCountry = useSelectedCountry();

  const otherWaysAvailable = !!config.get('exchangePostUrl');

  const allRegions = selectedCountry === '*';

  const [filteredBuy, filteredSell] = useMemo(() => {
    const usedLayout =
      layoutByCountry.find((layout) => layout.countryCode === selectedCountry) ||
      defaultLayout;

    return [buy, sell].map((tab) =>
      tab.map((category) => {
        if (category.type !== CategoryType.BUY) {
          return category;
        }

        const items =
          showAll || allRegions
            ? category.items
            : category.items.filter((item) => usedLayout.methods.includes(item.id));

        return {
          ...category,
          items: items.sort((a, b) => {
            const aIdx = usedLayout.methods.indexOf(a.id);
            const bIdx = usedLayout.methods.indexOf(b.id);
            if (aIdx === -1) {
              return 1;
            }
            if (bIdx === -1) {
              return -1;
            }
            return aIdx - bIdx;
          }),
        };
      }),
    );
  }, [layoutByCountry, defaultLayout, buy, sell, selectedCountry, showAll, allRegions]);

  const handleShowAll = useCallback(() => {
    setShowAll(!showAll);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [showAll]);

  const wallet = useWallet();
  const watchOnly = wallet && wallet.isWatchOnly;

  const [segmentIndex, setSegmentIndex] = useState(0);

  const isLoading = buy.length === 0 && sell.length === 0;

  const categories = segmentIndex === 0 ? filteredBuy : filteredSell;

  return (
    <Modal>
      <Modal.Header
        center
        leftContent={
          <CountryButton selectedCountry={selectedCountry} onPress={openChooseCountry} />
        }
        title={
          watchOnly ? (
            categories && categories[0] && categories[0].title
          ) : (
            <SegmentedControl
              onChange={(segment) => setSegmentIndex(segment)}
              index={segmentIndex}
              items={[t('exchange_modal.buy'), t('exchange_modal.sell')]}
            />
          )
        }
      />
      <Modal.ScrollView safeArea>
        <View style={styles.container}>
          {isLoading ? (
            <S.LoaderWrap>
              <Loader size="medium" />
            </S.LoaderWrap>
          ) : (
            <>
              {categories.map((category, cIndex) => (
                <React.Fragment key={cIndex}>
                  {cIndex > 0 ? <Spacer y={16} /> : null}
                  {!(watchOnly && cIndex === 0) ? (
                    <S.TitleContainer>
                      <Text type="h3">{category.title}</Text>
                    </S.TitleContainer>
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
                  {otherWaysAvailable && category.type === 'buy' && !allRegions ? (
                    <View style={styles.otherWaysContainer}>
                      <Button
                        key={showAll ? 'hide' : 'show'}
                        color="secondary"
                        size="small"
                        title={t(
                          showAll ? 'exchange_modal.hide' : 'exchange_modal.show_all',
                        )}
                        onPress={handleShowAll}
                      />
                    </View>
                  ) : null}
                </React.Fragment>
              ))}
            </>
          )}
        </View>
      </Modal.ScrollView>
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
