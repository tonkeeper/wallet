import React, { FC, memo, useCallback, useState } from 'react';
import * as S from './AddEditFavoriteAddress.style';

import { AddEditFavoriteAddressProps } from './AddEditFavoriteAddress.interface';
import { Input, Text } from '$uikit';
import { List, ListCell } from '$uikit/List/old/List';
import { useCopyText } from '$hooks/useCopyText';
import { Alert, Keyboard } from 'react-native';
import { useDispatch } from 'react-redux';
import { favoritesActions } from '$store/favorites';
import { isAndroid } from '$utils';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { t } from '@tonkeeper/shared/i18n';
import { Modal, View } from '@tonkeeper/uikit';
import { SheetActions, useNavigation } from '@tonkeeper/router';
import { push } from '$navigation/imperative';
import { Address } from '@tonkeeper/core';

const MAX_LENGTH = 24;

const AddEditFavoriteAddressComponent: FC<AddEditFavoriteAddressProps> = (props) => {
  const { address, name: initialName, domain, isEdit, onSave } = props;

  const copyText = useCopyText();
  const nav = useNavigation();

  const dispatch = useDispatch();
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
          nav.goBack();
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

    nav.goBack();

    onSave?.();
  }, [address, dispatch, domain, name, onSave]);

  const handleCopy = useCallback(() => {
    copyText(address, t('address_copied'));
  }, [address, copyText, t]);

  const title = isEdit
    ? t('add_edit_favorite.edit_title')
    : t('add_edit_favorite.add_title');

  return (
    <Modal>
      <Modal.Header title={title} />
      <Modal.Content safeArea>
        <View style={{ marginBottom: 16 }}>
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
              component={Modal.Input}
            />
            <S.AddressContainer>
              {isEdit ? (
                <List align="left">
                  <ListCell
                    label={t('add_edit_favorite.address_label')}
                    onPress={handleCopy}
                  >
                    <Text>{Address.toShort(address, 4)}</Text>
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
        </View>
      </Modal.Content>
    </Modal>
  );
};

export const AddEditFavoriteAddress = memo(AddEditFavoriteAddressComponent);

export function openAddFavorite(props: Omit<AddEditFavoriteAddressProps, 'isEdit'>) {
  push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: AddEditFavoriteAddressComponent,
    params: { isEdit: false, ...props },
    path: 'ADD_EDIT_FAVORITE_ADDRESS',
  });
}

export function openEditFavorite(props: Omit<AddEditFavoriteAddressProps, 'isEdit'>) {
  push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: AddEditFavoriteAddressComponent,
    params: { isEdit: true, ...props },
    path: 'ADD_EDIT_FAVORITE_ADDRESS',
  });
}
