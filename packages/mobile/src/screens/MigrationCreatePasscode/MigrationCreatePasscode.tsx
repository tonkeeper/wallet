import { FC, useCallback, useState } from 'react';
import { RouteProp } from '@react-navigation/native';
import {
  MigrationStackParamList,
  MigrationStackRouteNames,
} from '$navigation/MigrationStack/types';
import * as S from '../../core/AccessConfirmation/AccessConfirmation.style';
import { NavBar } from '$uikit';
import { Toast } from '@tonkeeper/uikit';
import { useMigration } from '$hooks/useMigration';
import { CreatePinForm } from '$shared/components';
import { t } from '@tonkeeper/shared/i18n';

export const MigrationCreatePasscode: FC<{
  route: RouteProp<MigrationStackParamList, MigrationStackRouteNames.CreatePasscode>;
}> = (props) => {
  const { mnemonic } = props.route.params;

  const [attempt, setAttempt] = useState(0);

  const { doMigration } = useMigration();

  const handlePinCreated = useCallback(
    async (passcode: string) => {
      try {
        Toast.loading();

        await doMigration(mnemonic, passcode);

        Toast.hide();
      } catch (error) {
        if (error instanceof TypeError) {
          Toast.fail(t('error_network'));
        } else {
          Toast.hide();
        }
      } finally {
        setTimeout(() => {
          setAttempt((prev) => prev + 1);
        }, 300);
      }
    },
    [doMigration, mnemonic],
  );

  return (
    <S.Wrap>
      <NavBar />
      <CreatePinForm key={attempt} onPinCreated={handlePinCreated} />
    </S.Wrap>
  );
};
