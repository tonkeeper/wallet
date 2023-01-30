import React, { FC, memo, useCallback, useEffect, useRef } from 'react';
import { useAppsListStore } from '$store';
import { openDAppBrowser } from '$navigation';
import { List } from '$uikit';
import { PopularAppCell } from '../PopularAppCell/PopularAppCell';
import * as S from './PopularApps.style';
import { StepView, StepViewItem, StepViewRef } from '$shared/components';
import { useTranslator } from '$hooks';

interface Props {
  activeCategory: string;
  setActiveCategory: (activeCategory: string) => void;
}

const PopularAppsComponent: FC<Props> = (props) => {
  const { activeCategory, setActiveCategory } = props;

  const stepViewRef = useRef<StepViewRef>(null);

  const {
    categories,
    moreEnabled,
    moreUrl,
    actions: { fetchPopularApps },
  } = useAppsListStore();

  const t = useTranslator();

  const handleChangeStep = useCallback(
    (currentStepId: string | number) => {
      setActiveCategory(currentStepId as string);
    },
    [setActiveCategory],
  );

  useEffect(() => {
    fetchPopularApps();
  }, [fetchPopularApps]);

  useEffect(() => {
    stepViewRef.current?.go(activeCategory);
  }, [activeCategory]);

  if (categories.length === 0) {
    return null;
  }

  return (
    <>
      <StepView ref={stepViewRef} autoHeight={true} onChangeStep={handleChangeStep}>
        {categories.map((category) => (
          <StepViewItem id={category.id} key={category.id}>
            <S.Container>
              <List separator={false}>
                {category.apps.map((item, index) => (
                  <PopularAppCell
                    key={index}
                    separator={index < category.apps.length - 1}
                    icon={item.icon}
                    url={item.url}
                    name={item.name}
                    description={item.description}
                  />
                ))}
              </List>
            </S.Container>
          </StepViewItem>
        ))}
      </StepView>
      {moreEnabled && moreUrl ? (
        <S.Container>
          <List separator={false}>
            <PopularAppCell
              isMore={true}
              url={moreUrl}
              name={t('browser.more_title')}
              description={t('browser.more_description')}
            />
          </List>
        </S.Container>
      ) : null}
    </>
  );
};

export const PopularApps = memo(PopularAppsComponent);
