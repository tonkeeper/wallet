import React, { FC, memo, useMemo } from 'react';
import { AppItem } from '../AppItem/AppItem';
import { openDAppBrowser } from '$navigation';
import * as S from './AppsList.style';
import { APPS_ITEMS_IN_ROW } from '$core/DAppsExplore/constants';
import { Icon } from '$uikit';
import { AppItemSkeleton } from '../AppItem/AppItemSkeleton';

interface Props {
  title: string;
  data: { name: string; icon: string; url: string }[];
  rowsLimit?: number;
  moreTitle?: string;
  skeleton?: boolean;
  onMorePress?: () => void;
  onItemLongPress?: (url: string) => void;
}

const AppsListComponent: FC<Props> = (props) => {
  const { title, data, rowsLimit, moreTitle, skeleton, onMorePress, onItemLongPress } =
    props;

  const skeletonCount = APPS_ITEMS_IN_ROW * (rowsLimit || 1);

  const apps = useMemo(() => {
    if (rowsLimit) {
      const end = APPS_ITEMS_IN_ROW * rowsLimit;
      return data.slice(0, moreTitle ? end - 1 : end);
    }

    return data;
  }, [data, moreTitle, rowsLimit]);

  return (
    <S.Container>
      <S.Title>{title}</S.Title>
      <S.List>
        {skeleton ? (
          <>
            {Array(skeletonCount)
              .fill(null)
              .map((_, index) => (
                <AppItemSkeleton key={`AppItemSkeleton_${index}`} index={index} />
              ))}
          </>
        ) : (
          <>
            {apps.map((app, index) => (
              <AppItem
                key={`${app.name}_${app.url}`}
                index={index}
                name={app.name}
                iconUri={app.icon}
                onPress={() => openDAppBrowser(app.url)}
                onLongPress={() => onItemLongPress?.(app.url)}
              />
            ))}
            {moreTitle ? (
              <AppItem
                name={moreTitle}
                icon={
                  <S.MoreIconContainer>
                    <Icon name="ic-chevron-right-16" color="foregroundPrimary" />
                  </S.MoreIconContainer>
                }
                onPress={onMorePress}
              />
            ) : null}
          </>
        )}
      </S.List>
    </S.Container>
  );
};

export const AppsList = memo(AppsListComponent);
