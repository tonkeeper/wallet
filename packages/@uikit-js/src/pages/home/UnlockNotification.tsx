import { useMutation } from '@tanstack/react-query';
import { IAppSdk } from '@tonkeeper/core-js/src/AppSdk';
import { AuthState } from '@tonkeeper/core-js/src/entries/password';
import { getAccountState } from '@tonkeeper/core-js/src/service/accountService';
import { validateWalletMnemonic } from '@tonkeeper/core-js/src/service/menmonicService';
import { getWalletState } from '@tonkeeper/core-js/src/service/walletService';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Button, ButtonRow } from '../../components/fields/Button';
import { Input } from '../../components/fields/Input';
import {
  Notification,
  NotificationTitleRow,
} from '../../components/Notification';
import { useStorage } from '../../hooks/storage';
import { useTranslation } from '../../hooks/translation';

export const getPasswordByNotification = async (
  sdk: IAppSdk,
  auth: AuthState
): Promise<string> => {
  const id = Date.now();
  return new Promise<string>((resolve, reject) => {
    sdk.uiEvents.emit('getPassword', {
      method: 'getPassword',
      id,
      params: auth,
    });

    const onCallback = (message: {
      method: 'response';
      id?: number | undefined;
      params: string | Error;
    }) => {
      if (message.id === id) {
        const { params } = message;
        sdk.uiEvents.off('response', onCallback);

        if (typeof params === 'string') {
          resolve(params);
        } else {
          reject(params);
        }
      }
    };

    sdk.uiEvents.on('response', onCallback);
  });
};

const Block = styled.form`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  justify-content: center;
  gap: 2rem;
  width: 100%;
`;

const Logo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 400%;

  margin-bottom: 2rem;
`;

const useMutateUnlock = (sdk: IAppSdk, requestId: number) => {
  const storage = useStorage();

  return useMutation<void, Error, string>(async (password) => {
    const account = await getAccountState(storage);
    if (account.publicKeys.length === 0) {
      throw new Error('Missing wallets');
    }
    const [publicKey] = account.publicKeys;
    const wallet = await getWalletState(storage, publicKey);
    if (!wallet) {
      throw new Error('Missing wallet');
    }

    const isValid = await validateWalletMnemonic(storage, publicKey, password);
    if (!isValid) {
      throw new Error('Mnemonic not valid');
    }

    sdk.uiEvents.emit('response', {
      method: 'response',
      id: requestId,
      params: password,
    });
  });
};

const PasswordUnlock: FC<{
  sdk: IAppSdk;
  onClose: () => void;
  requestId: number;
}> = ({ sdk, onClose, requestId }) => {
  const { t } = useTranslation();

  const ref = useRef<HTMLInputElement | null>(null);
  const { mutateAsync, isLoading, isError, reset } = useMutateUnlock(
    sdk,
    requestId
  );
  const [password, setPassword] = useState('');

  const [active, setActive] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (!active) {
      setActive(true);
    } else {
      onClose();
    }
  }, [location]);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, [ref.current]);

  const onChange = (value: string) => {
    reset();
    setPassword(value);
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    console.log('submit');
    e.preventDefault();
    await mutateAsync(password);
    onClose();
  };

  const onCancel = () => {
    console.log('cancel');
    sdk.uiEvents.emit('response', {
      method: 'response',
      id: requestId,
      params: new Error('Cancel auth request'),
    });
    onClose();
  };

  return (
    <>
      <NotificationTitleRow handleClose={onCancel}>
        {t('enter_password')}
      </NotificationTitleRow>
      <Block onSubmit={onSubmit}>
        <Input
          ref={ref}
          value={password}
          onChange={onChange}
          type="password"
          label={t('Password')}
          isValid={!isError}
          disabled={isLoading}
        />
        <ButtonRow>
          <Button
            size="large"
            fullWidth
            onClick={onCancel}
            type="button"
            loading={isLoading}
          >
            {t('settings_reset')}
          </Button>
          <Button
            size="large"
            primary
            fullWidth
            type="submit"
            disabled={password.length < 5}
            loading={isLoading}
          >
            {t('Unlock')}
          </Button>
        </ButtonRow>
      </Block>
    </>
  );
};

export const UnlockNotification: FC<{ sdk: IAppSdk }> = ({ sdk }) => {
  const [auth, setAuth] = useState<AuthState | undefined>(undefined);
  const [requestId, setId] = useState<number | undefined>(undefined);

  const close = useCallback(() => {
    setAuth(undefined);
    setId(undefined);
  }, []);

  useEffect(() => {
    const handler = (options: {
      method: 'getPassword';
      id?: number | undefined;
      params: AuthState;
    }) => {
      setAuth(options.params);
      setId(options.id);
    };
    sdk.uiEvents.on('getPassword', handler);

    return () => {
      sdk.uiEvents.off('getPassword', handler);
    };
  }, [sdk]);

  const Content = useCallback(() => {
    if (!auth || !requestId) return undefined;
    return <PasswordUnlock sdk={sdk} onClose={close} requestId={requestId} />;
  }, [auth, requestId]);

  return (
    <Notification isOpen={auth != null} hideButton handleClose={close}>
      {Content}
    </Notification>
  );
};
