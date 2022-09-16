import React, { FC, useCallback, useState } from 'react';

import { InfoAboutInactiveProps } from './InfoAboutInactive.interface';
import { BottomSheet, Button } from '$uikit';
import * as S from './InfoAboutInactive.style';
import { useTranslator } from '$hooks';
import { ns } from '$utils';

export const InfoAboutInactive: FC<InfoAboutInactiveProps> = () => {
  const t = useTranslator();
  const [isClosed, setClosed] = useState(false);

  const handleGoBack = useCallback(() => {
    setClosed(true);
  }, []);

  function renderContent() {
    return (
      <>
        <S.Wrap>
          <S.Text>{t('info_about_inactive_desc1')}</S.Text>
          <S.Text>{t('info_about_inactive_desc2')}</S.Text>
          <S.Text>
            {t('info_about_inactive_desc3_1')}
            <S.TextBold>{t('info_about_inactive_desc3_bold')}</S.TextBold>
            {t('info_about_inactive_desc3_2')}
          </S.Text>
          <Button onPress={handleGoBack} style={{ marginTop: ns(20) }} mode="secondary">
            {t('info_about_inactive_back')}
          </Button>
        </S.Wrap>
      </>
    );
  }

  return (
    <BottomSheet triggerClose={isClosed} title={t('info_about_inactive_title')}>
      {renderContent()}
    </BottomSheet>
  );
};
