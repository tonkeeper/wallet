import React, { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import * as S from './Intro.style';
import { BottomButtonWrap, BottomButtonWrapHelper } from '$shared/components';
import {Button, Icon, Text} from '$uikit';
import { useTheme, useTranslator } from '$hooks';
import { mainActions } from '$store/main';
import { ns } from '$utils';

export const Intro: FC = () => {
  const theme = useTheme();
  const t = useTranslator();
  const dispatch = useDispatch();

  const handleContinue = useCallback(() => {
    dispatch(mainActions.completeIntro());
  }, [dispatch]);

  return (
    <S.Wrap>
      <S.Content showsVerticalScrollIndicator={false} alwaysBounceVertical={false}>
        <Text variant="h1">
          {t('intro_title')}
          <Text variant="h1" color="accentPrimary">
            {t('app_name')}
          </Text>
        </Text>
        <S.Items>
          <S.Item>
            <Icon name="ic-speed-28" color="accentPrimary" />
            <S.ItemCont>
              <Text variant="label1">{t('intro_item1_title')}</Text>
              <Text variant="body1" color="foregroundSecondary">
                {t('intro_item1_caption')}
              </Text>
            </S.ItemCont>
          </S.Item>
          <S.Item>
            <Icon name="ic-secure-28" color="accentPrimary" />
            <S.ItemCont>
              <Text variant="label1">{t('intro_item2_title')}</Text>
              <Text variant="body1" color="foregroundSecondary">
                {t('intro_item2_caption')}
              </Text>
            </S.ItemCont>
          </S.Item>
          {/*
          <S.Item>
            <Icon
              name="settings28"
              fill={theme.colors.accentPrimary}
            />
            <S.ItemCont>
              <S.ItemTitle>{t('intro_item3_title')}</S.ItemTitle>
              <S.ItemCaption>{t('intro_item3_caption')}</S.ItemCaption>
            </S.ItemCont>
          </S.Item>
         */}
        </S.Items>
        <BottomButtonWrapHelper />
      </S.Content>
      <BottomButtonWrap>
        <Button onPress={handleContinue} style={{ marginHorizontal: ns(16) }}>{t('intro_continue_btn')}</Button>
      </BottomButtonWrap>
    </S.Wrap>
  );
};
