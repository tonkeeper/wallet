import { Button } from '$uikit';
import * as S from './InfoAboutInactive.style';
import { t } from '@tonkeeper/shared/i18n';
import { ns } from '$utils';
import { Modal, View } from '@tonkeeper/uikit';
import { SheetActions, useNavigation } from '@tonkeeper/router';
import { push } from '$navigation/imperative';

export const InfoAboutInactive = () => {
  const nav = useNavigation();

  return (
    <Modal>
      <Modal.Header title={t('info_about_inactive_title')} />
      <Modal.Content safeArea>
        <View style={{ marginBottom: 16 }}>
          <S.Wrap>
            <S.Text>{t('info_about_inactive_desc1')}</S.Text>
            <S.Text>{t('info_about_inactive_desc2')}</S.Text>
            <S.Text>
              {t('info_about_inactive_desc3_1')}
              <S.TextBold>{t('info_about_inactive_desc3_bold')}</S.TextBold>
              {t('info_about_inactive_desc3_2')}
            </S.Text>
            <Button
              onPress={() => nav.goBack()}
              style={{ marginTop: ns(20) }}
              mode="secondary"
            >
              {t('info_about_inactive_back')}
            </Button>
          </S.Wrap>
        </View>
      </Modal.Content>
    </Modal>
  );
};

export async function openInactiveInfo() {
  push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: InfoAboutInactive,
    params: {},
    path: 'INFO_ABOUT_INACTIVE',
  });
}
