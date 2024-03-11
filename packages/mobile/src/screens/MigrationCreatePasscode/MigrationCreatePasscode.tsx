import { FC, useCallback, useState } from 'react';
import { RouteProp } from '@react-navigation/native';
import {
  MigrationStackParamList,
  MigrationStackRouteNames,
} from '$navigation/MigrationStack/types';
import * as S from '../../core/AccessConfirmation/AccessConfirmation.style';
import { NavBar } from '$uikit';
import { BlockingLoader, Toast } from '@tonkeeper/uikit';
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
        BlockingLoader.show();

        await doMigration(mnemonic, passcode);
      } catch (error) {
        if (error instanceof TypeError) {
          Toast.fail(t('error_network'));
        }
      } finally {
        setTimeout(() => {
          setAttempt((prev) => prev + 1);
        }, 300);
        BlockingLoader.hide();
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
