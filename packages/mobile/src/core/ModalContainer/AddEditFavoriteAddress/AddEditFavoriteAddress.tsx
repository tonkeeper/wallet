import React, { FC, memo, useCallback, useState } from 'react';
import * as S from './AddEditFavoriteAddress.style';

import { AddEditFavoriteAddressProps } from './AddEditFavoriteAddress.interface';
import { BottomSheet, Input, List, ListCell, Text } from '$uikit';
import { useCopyText, useTranslator } from '$hooks';
import { Alert, Keyboard } from 'react-native';
import { useDispatch } from 'react-redux';
import { favoritesActions } from '$store/favorites';
import { isAndroid, maskifyAddress } from '$utils';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

const MAX_LENGTH = 24;

const AddEditFavoriteAddressComponent: FC<AddEditFavoriteAddressProps> = (props) => {
  const { address, name: initialName, domain, isEdit, onSave } = props;

  const t = useTranslator();

  const copyText = useCopyText();

  const dispatch = useDispatch();

  const [isClosed, setClosed] = useState(false);
  const [name, setName] = useState(initialName || domain || '');
  const [failed, setFailed] = useState(false);

  const handleChangeText = useCallback((value: string) => {
    setFailed(false);
    setName(value);
  }, []);

  const handleDelete = useCallback(() => {
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
          setClosed(true);
        },
      },
    ]);
  }, [address, dispatch, name, t]);

  const handleContinue = useCallback(() => {
    const normalizedName = name.trim();

    if (normalizedName.length === 0) {
      setFailed(true);
      return;
    }

    Keyboard.dismiss();

    dispatch(
      favoritesActions.updateFavorite({
        name: normalizedName,
        address,
        domain: domain && normalizedName === domain ? domain : undefined,
      }),
    );

    setClosed(true);

    onSave?.();
  }, [address, dispatch, domain, name, onSave]);

  const handleCopy = useCallback(() => {
    copyText(address, t('address_copied'));
  }, [address, copyText, t]);

  const title = isEdit
    ? t('add_edit_favorite.edit_title')
    : t('add_edit_favorite.add_title');

  return (
    <BottomSheet
      title={title}
      triggerClose={isClosed}
      onClosePress={() => Keyboard.dismiss()}
    >
      <S.Wrap>
        <Input
          placeholder={t('add_edit_favorite.name_placeholder')}
          autoFocus={true}
          onChangeText={handleChangeText}
          onSubmitEditing={handleContinue}
          maxLength={MAX_LENGTH}
          returnKeyType="done"
          value={name}
          isFailed={failed}
        />
        <S.AddressContainer>
          {isEdit ? (
            <List align="left">
              <ListCell label={t('add_edit_favorite.address_label')} onPress={handleCopy}>
                <Text>{maskifyAddress(address, 4)}</Text>
              </ListCell>
            </List>
          ) : (
            <TouchableWithoutFeedback onPress={handleCopy}>
              <S.Address>
                <Text color="foregroundSecondary">
                  {t('add_edit_favorite.address_label')}
                </Text>
                <Text>{address}</Text>
              </S.Address>
            </TouchableWithoutFeedback>
          )}
        </S.AddressContainer>
      </S.Wrap>
      <S.Buttons>
        {isEdit ? (
          <>
            <S.FlexButton mode="secondary" onPress={handleDelete}>
              {t('add_edit_favorite.delete')}
            </S.FlexButton>
            <S.ButtonsSpacer />
          </>
        ) : null}
        <S.FlexButton onPress={handleContinue}>
          {t('add_edit_favorite.save')}
        </S.FlexButton>
      </S.Buttons>
    </BottomSheet>
  );
};

export const AddEditFavoriteAddress = memo(AddEditFavoriteAddressComponent);
