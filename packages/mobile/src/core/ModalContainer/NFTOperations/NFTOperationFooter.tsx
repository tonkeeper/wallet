import React from 'react';
import { Alert, Linking, View } from 'react-native';
import { Icon, Loader, Text, TransitionOpacity } from '$uikit';
import {
  debugLog,
  delay,
  triggerNotificationError,
  triggerNotificationSuccess,
} from '$utils';
import { NFTOperationError } from './NFTOperationError';
import { getTimeSec } from '$utils/getTimeSec';
import { TxBodyOptions, TxResponseOptions } from './TXRequest.types';
import { UnlockVaultError } from '$store/wallet/sagas';
import { useDispatch, useSelector } from 'react-redux';
import { toastActions } from '$store/toast';
import { t } from '$translation';
import * as S from './NFTOperations.styles';
import { useNavigation } from '$libs/navigation';
import { eventsActions } from '$store/events';
import axios from 'axios';
import { isTimeSyncedSelector } from '$store/main';

enum States {
  INITIAL,
  LOADING,
  SUCCESS,
  RETURN,
  ERROR,
}

type ConfirmFn = (options: { startLoading: () => void }) => Promise<void>;

// Wrapper action footer for TxRequest
// TODO: Rename NFTOperation -> Action
export const useNFTOperationState = (txBody?: TxBodyOptions) => {
  const { footerRef, onConfirm: invokeConfirm } = useActionFooter();
  const dispatch = useDispatch();
  const isTimeSynced = useSelector(isTimeSyncedSelector);

  const onConfirm = (confirm: ConfirmFn) => async () => {
    try {
      if (txBody && txBody.expires_sec < getTimeSec()) {
        throw new NFTOperationError(t('nft_operations_expired'));
      }

      await invokeConfirm(confirm)();
      if (txBody?.response_options?.callback_url) {
        const callbackUrl = txBody.response_options.callback_url;

        try {
          await axios.get(callbackUrl);
        } catch (err) {
          debugLog(
            '[NFTOperationCallback]:',
            err,
            err.response.status,
            err.response.data,
          );
        }
      }

      if (txBody?.response_options?.return_url) {
        const returnUrl = txBody.response_options.return_url;
        try {
          await delay(2000);
          await Linking.openURL(returnUrl);
        } catch (err) {
          debugLog(err);
        }
      }
    } catch (error) {
      if (error instanceof NFTOperationError) {
        if (error?.message) {
          footerRef.current?.setError(error.message);
        }
      } else {
        debugLog(error);
      }
    }
  };

  return { footerRef, onConfirm };
};

export const useActionFooter = () => {
  const ref = React.useRef<ActionFooterRef>(null);
  const dispatch = useDispatch();

  const onConfirm = (confirm: ConfirmFn) => async () => {
    try {
      await confirm({
        startLoading: () => {
          ref.current?.setState(States.LOADING);
        },
      });

      ref.current?.setState(States.SUCCESS);
    } catch (error) {
      if (error instanceof UnlockVaultError) {
        dispatch(toastActions.fail(error?.message));
      } else if (error instanceof NFTOperationError) {
        if (error?.message) {
          ref.current?.setError(error.message);
        }
      } else {
        ref.current?.setError(t('error_occurred'));
        debugLog(error);
      }
    }
  };

  const setError = (msg: string) => {
    ref.current?.setError(msg);
  };

  return { footerRef: ref, setError, onConfirm };
};

type ActionFooterRef = {
  setState: (state: States) => Promise<void>;
  setError: (msg: string) => void;
};

interface ActionFooterProps {
  responseOptions?: TxResponseOptions;
  onPressConfirm: () => Promise<void>;
  onCloseModal?: () => void;
}

export const ActionFooter = React.forwardRef<ActionFooterRef, ActionFooterProps>(
  (props, ref) => {
    const [errorText, setErrorText] = React.useState(t('error_occurred'));
    const [state, setState] = React.useState(States.INITIAL);
    const nav = useNavigation();
    const dispatch = useDispatch();

    const closeModal = React.useCallback(() => {
      if (props.onCloseModal) {
        props.onCloseModal();
      } else {
        nav.goBack();
      }
    }, [props.onCloseModal, nav.goBack]);

    React.useImperativeHandle(ref, () => ({
      async setState(state) {
        setState(state);
        if (state === States.SUCCESS) {
          triggerNotificationSuccess();

          await delay(1750);

          dispatch(eventsActions.pollEvents());
          closeModal();

          props.responseOptions?.onDone?.();
        } else if (state === States.ERROR) {
          triggerNotificationError();
        }
      },
      setError(msg) {
        setErrorText(msg);
        setState(States.ERROR);
        triggerNotificationError();
      },
    }));

    return (
      <View style={S.styles.footer}>
        <TransitionOpacity
          style={S.styles.transitionContainer}
          isVisible={state === States.INITIAL}
          entranceAnimation={false}
        >
          <View style={S.styles.footerButtons}>
            <S.CancelButton mode="secondary" onPress={closeModal}>
              {t('cancel')}
            </S.CancelButton>
            <S.ActionButton onPress={() => props.onPressConfirm()}>
              {t('nft_confirm_operation')}
            </S.ActionButton>
          </View>
        </TransitionOpacity>
        <TransitionOpacity
          style={S.styles.transitionContainer}
          isVisible={state === States.SUCCESS}
        >
          <View style={S.styles.center}>
            <View style={S.styles.iconContainer}>
              <Icon name="ic-checkmark-circle-32" color="accentPositive" />
            </View>
            <Text variant="label2" color="accentPositive">
              {t('nft_operation_success')}
            </Text>
          </View>
        </TransitionOpacity>
        <TransitionOpacity
          style={S.styles.transitionContainer}
          isVisible={state === States.LOADING}
        >
          <View style={S.styles.center}>
            <Loader size="medium" />
          </View>
        </TransitionOpacity>
        <TransitionOpacity
          style={S.styles.transitionContainer}
          isVisible={state === States.ERROR}
        >
          <View style={S.styles.center}>
            <View style={S.styles.iconContainer}>
              <Icon color="accentNegative" name="ic-exclamationmark-circle-32" />
            </View>
            <Text
              color="accentNegative"
              textAlign="center"
              variant="label2"
              numberOfLines={2}
            >
              {errorText}
            </Text>
          </View>
        </TransitionOpacity>
      </View>
    );
  },
);

export const NFTOperationFooter = ActionFooter;
