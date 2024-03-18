import { SuggestedAddress, SuggestedAddressType } from '../../../../Send.interface';
import { t } from '@tonkeeper/shared/i18n';
import { Icon, PopupSelect, Text } from '$uikit';
import React, { FC, memo, useCallback, useMemo } from 'react';
import * as S from './AddressSuggestCell.style';
import { differenceInCalendarYears, isToday, isYesterday } from 'date-fns';
import { format, isAndroid } from '$utils';
import { Alert, Keyboard } from 'react-native';
import { useDispatch } from 'react-redux';
import { favoritesActions } from '$store/favorites';
import Animated from 'react-native-reanimated';
import { Separator } from '$uikit/Separator/Separator.style';
import {
  openAddFavorite,
  openEditFavorite,
} from '$core/ModalContainer/AddEditFavoriteAddress/AddEditFavoriteAddress';
import { Address } from '@tonkeeper/core';

enum SuggestActionType {
  ADD,
  HIDE,
  EDIT,
  DELETE,
}

interface SuggestAction {
  type: SuggestActionType;
  label: string;
}

interface Props {
  separator: boolean;
  scrollY: Animated.SharedValue<number>;
  suggest: SuggestedAddress;
  onPress?: (suggest: SuggestedAddress) => void;
  disabled?: boolean;
}

const AddressSuggestCellComponent: FC<Props> = (props) => {
  const { separator, scrollY, suggest, onPress } = props;

  const dispatch = useDispatch();

  const preparedAddress = Address.toShort(suggest.address);

  const formattedDate = useMemo(() => {
    if (!suggest.timestamp) {
      return '';
    }

    const transactionDate = new Date(suggest.timestamp * 1000);

    if (isToday(transactionDate)) {
      return t('today');
    }

    if (isYesterday(transactionDate)) {
      return t('yesterday');
    }

    return format(
      transactionDate,
      differenceInCalendarYears(transactionDate, new Date()) === 0
        ? 'd MMM'
        : 'd MMM yyyy',
    );
  }, [suggest.timestamp]);

  const isFavorite = suggest.type === SuggestedAddressType.FAVORITE;

  const title = isFavorite ? suggest.name : preparedAddress;

  const subtitle = isFavorite ? preparedAddress : formattedDate;

  const isDns = !!suggest.domain;

  const isDomainUpdating = isDns && !suggest.domainUpdated;

  const slicedDomain = suggest.domain?.split('.')?.[0] || '';
  const domainZone = suggest.domain?.split('.')?.slice(1)?.join('.');

  const actions = useMemo((): SuggestAction[] => {
    if (isFavorite) {
      return [
        {
          type: SuggestActionType.EDIT,
          label: t('send_screen_steps.address.suggest_actions.edit'),
        },
        {
          type: SuggestActionType.DELETE,
          label: t('send_screen_steps.address.suggest_actions.delete'),
        },
      ];
    }

    return [
      {
        type: SuggestActionType.ADD,
        label: t('send_screen_steps.address.suggest_actions.add'),
      },
      {
        type: SuggestActionType.HIDE,
        label: t('send_screen_steps.address.suggest_actions.hide'),
      },
    ];
  }, [isFavorite]);

  const handleDelete = useCallback(() => {
    const { name = '', address } = suggest;

    const text = t('send_screen_steps.address.delete_alert_text', { name });

    Alert.alert(isAndroid ? '' : text, isAndroid ? text : '', [
      {
        text: t('cancel'),
      },
      {
        text: t('send_screen_steps.address.suggest_actions.delete'),
        style: 'destructive',
        onPress: () => {
          dispatch(favoritesActions.deleteFavorite({ name, address }));
        },
      },
    ]);
  }, [dispatch, suggest]);

  const handlePressAction = useCallback(
    (action: SuggestAction) => {
      const { name = '', address } = suggest;

      switch (action.type) {
        case SuggestActionType.ADD:
          return openAddFavorite({ name, address });
        case SuggestActionType.EDIT:
          return openEditFavorite({ name, address });
        case SuggestActionType.DELETE:
          return handleDelete();
        case SuggestActionType.HIDE:
          return dispatch(favoritesActions.hideRecentAddress(address));
      }
    },
    [dispatch, handleDelete, suggest],
  );

  const handlePress = useCallback(() => {
    onPress?.(suggest);
  }, [onPress, suggest]);

  return (
    <>
      <S.Cell onPress={handlePress} isDisabled={props.disabled || !onPress}>
        <S.Container>
          <S.Content>
            <S.TitleContainer>
              <S.Title>
                {isDns ? (
                  <>
                    {slicedDomain}
                    <S.Domain>.{domainZone}</S.Domain>
                  </>
                ) : (
                  title
                )}
              </S.Title>
              {!isFavorite && !!suggest.name ? (
                <S.AddressName>{suggest.name}</S.AddressName>
              ) : null}
              {isFavorite ? (
                <S.IconContainer>
                  <Icon name="ic-star-12" color="accentPrimary" />
                </S.IconContainer>
              ) : null}
            </S.TitleContainer>
            <S.SubTitleContainer>
              <S.SubTitle visible={!isDomainUpdating}>{subtitle}</S.SubTitle>
              {isDomainUpdating ? <S.SubTitleSkeleton /> : null}
            </S.SubTitleContainer>
          </S.Content>
          <PopupSelect
            items={actions}
            onChange={handlePressAction}
            renderItem={(item) => <Text variant="label1">{item.label}</Text>}
            keyExtractor={(item) => item.label}
            autoWidth={true}
            scrollY={scrollY}
          >
            <S.MoreTouchable onPress={() => Keyboard.dismiss()}>
              <Icon name="ic-ellipsis-16" color="foregroundSecondary" />
            </S.MoreTouchable>
          </PopupSelect>
        </S.Container>
      </S.Cell>
      {separator ? <Separator /> : null}
    </>
  );
};

export const AddressSuggestCell = memo(AddressSuggestCellComponent);
