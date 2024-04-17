import React, { memo } from 'react';
import { Button, Modal, Spacer, Text, View } from '@tonkeeper/uikit';
import { Steezy } from '@tonkeeper/uikit';
import { navigation, SheetActions, useNavigation } from '@tonkeeper/router';
import { t } from '@tonkeeper/shared/i18n';

export interface AboutRiskAmountModalProps {
  title: string;
  withNft?: boolean;
}

export const AboutRiskAmountModal = memo<AboutRiskAmountModalProps>((props) => {
  const nav = useNavigation();
  return (
    <Modal>
      <Modal.Header />
      <Modal.Content>
        <View style={styles.wrap}>
          <Text textAlign="center" type="h2">
            {props.title}
          </Text>
          <Spacer y={4} />
          <Text textAlign="center" color="textSecondary" type="body1">
            {t(
              props.withNft
                ? 'about_risk_modal.description_with_nft'
                : 'about_risk_modal.description',
            )}
          </Text>
        </View>
        <Spacer y={32} />
      </Modal.Content>
      <Modal.Footer>
        <View style={styles.buttonContainer}>
          <Button onPress={nav.goBack} size="large" title={'OK'} color="secondary" />
        </View>
        <Spacer y={16} />
      </Modal.Footer>
    </Modal>
  );
});

export function openAboutRiskAmountModal(title: string, withNft?: boolean) {
  return navigation.push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: AboutRiskAmountModal,
    params: { title, withNft },
    path: 'AboutRiskAmountModal',
  });
}

const styles = Steezy.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: 32,
    textAlign: 'center',
    paddingTop: 48,
  },
  footerWrap: {
    paddingHorizontal: 16,
  },
  checkboxWithLabel: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 16,
  },
});
