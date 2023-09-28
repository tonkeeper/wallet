import React, { useCallback, useMemo } from 'react';

import { Button, Loader, Spacer, View } from '$uikit';
import * as S from '../core/Exchange/Exchange.style';
import { ExchangeItem } from '../core/Exchange/ExchangeItem/ExchangeItem';
import { t } from '@tonkeeper/shared/i18n';
import { getServerConfigSafe } from '$shared/constants';
import { LayoutAnimation } from 'react-native';
import { Modal } from '@tonkeeper/uikit';
import { Steezy } from '$styles';
import { useMethodsToBuyStore } from '$store/zustand/methodsToBuy/useMethodsToBuyStore';
import { CategoryType } from '$store/zustand/methodsToBuy/types';
import { openChooseCountry } from '$navigation';

export const ExchangeModal = () => {
  const [showAll, setShowAll] = React.useState(false);
  const { categories, defaultLayout, layoutByCountry, selectedCountry } =
    useMethodsToBuyStore((state) => state);

  const otherWaysAvailable = getServerConfigSafe('exchangePostUrl') !== 'none';

  const filteredCategories = useMemo(() => {
    const usedLayout =
      layoutByCountry.find((layout) => layout.countryCode === selectedCountry) ||
      defaultLayout;

    return categories.map((category) => {
      if (category.type !== CategoryType.BUY) {
        return category;
      }

      const items = showAll
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
    });
  }, [showAll, categories, defaultLayout, layoutByCountry, selectedCountry]);

  const handleShowAll = useCallback(() => {
    setShowAll(!showAll);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [showAll]);

  return (
    <Modal>
      <Modal.Header
        center
        onIconLeftPress={openChooseCountry}
        iconLeft={'ic-globe-16'}
        title={t('exchange_modal.title')}
      />
      <Modal.ScrollView>
        <Modal.Content safeArea>
          <View style={styles.container}>
            {!categories.length ? (
              <S.LoaderWrap>
                <Loader size="medium" />
              </S.LoaderWrap>
            ) : (
              <>
                {filteredCategories.map((category, cIndex) => (
                  <React.Fragment key={cIndex}>
                    {cIndex > 0 ? <Spacer y={32} /> : null}
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
                    {otherWaysAvailable && category.type === 'buy' ? (
                      <View style={styles.otherWaysContainer}>
                        <Button
                          key={showAll ? 'hide' : 'show'}
                          size="medium_rounded"
                          mode="secondary"
                          onPress={handleShowAll}
                        >
                          {t(showAll ? 'exchange_modal.hide' : 'exchange_modal.show_all')}
                        </Button>
                      </View>
                    ) : null}
                  </React.Fragment>
                ))}
              </>
            )}
          </View>
        </Modal.Content>
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
