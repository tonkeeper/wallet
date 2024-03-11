import React from 'react';
import { Screen } from '$uikit';
import { CellSection, CellSectionItem } from '$shared/components';
import { AttachScreenButton } from '$navigation/AttachScreen';
import { useNavigation } from '@tonkeeper/router';

export const DevComponentList: React.FC = () => {
  const nav = useNavigation();

  return (
    <Screen>
      <Screen.Header title="UI Kit & other" rightContent={<AttachScreenButton />} />

      <Screen.ScrollView>
        <CellSection>
          <CellSectionItem onPress={() => nav.navigate('DevSignRawExamples')}>
            Sign Raw Examples
          </CellSectionItem>
          <CellSectionItem onPress={() => nav.navigate('DevDeeplinking')}>
            Deeplinks
          </CellSectionItem>
          <CellSectionItem onPress={() => nav.navigate('DevText')}>
            Typography
          </CellSectionItem>
          <CellSectionItem onPress={() => nav.navigate('DevToast')}>
            Toast
          </CellSectionItem>
          <CellSectionItem onPress={() => nav.navigate('DevListComponent')}>
            Lists
          </CellSectionItem>
          <CellSectionItem onPress={() => nav.navigate('DevWalletStore')}>
            Wallet Store
          </CellSectionItem>
        </CellSection>
      </Screen.ScrollView>
    </Screen>
  );
};
