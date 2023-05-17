import { Modal, useNavigation } from '$libs/navigation';
import { SheetActions } from '$libs/navigation/components/Modal/Sheet/SheetsProvider';
import { push } from '$navigation';
import React, { memo, useCallback, useMemo } from 'react';
import {
  TokenApprovalStatus,
  TokenApprovalType,
} from '$store/zustand/tokenApproval/types';
import { useTokenApprovalStore } from '$store/zustand/tokenApproval/useTokenApprovalStore';
import { getTokenStatus } from '$store/zustand/tokenApproval/selectors';
import { JettonVerification } from '$store/models';
import { Button, Highlight, Icon, Spacer, Text, View, List } from '$uikit';
import { Steezy } from '$styles';
import { t } from '$translation';
import { format, maskifyAddress } from '$utils';
import * as S from '$core/ModalContainer/NFTOperations/NFTOperations.styles';
import FastImage from 'react-native-fast-image';
import { Toast } from '$store';
import Clipboard from '@react-native-community/clipboard';
import { Address } from '$libs/Ton';

export enum ImageType {
  ROUND = 'round',
  SQUARE = 'square',
}
export interface ApproveTokenModalParams {
  tokenAddress: string;
  type: TokenApprovalType;
  verification?: JettonVerification;
  imageType?: ImageType;
  name?: string;
  image?: string;
}
export const ApproveToken = memo((props: ApproveTokenModalParams) => {
  const nav = useNavigation();
  const currentStatus = useTokenApprovalStore((state) =>
    getTokenStatus(state, props.tokenAddress),
  );
  const updateTokenStatus = useTokenApprovalStore(
    (state) => state.actions.updateTokenStatus,
  );

  const handleUpdateStatus = useCallback(
    (approvalStatus: TokenApprovalStatus) => () => {
      updateTokenStatus(props.tokenAddress, approvalStatus, props.type);
      nav.goBack();
    },
    [nav, props.tokenAddress, props.type, updateTokenStatus],
  );

  const handleCopyAddress = useCallback(() => {
    Clipboard.setString(props.tokenAddress);
    Toast.show(t('approval.token_copied'));
  }, [props.tokenAddress]);

  const modalState = useMemo(() => {
    if (!currentStatus && props.verification === JettonVerification.NONE) {
      return 'pending';
    } else if (
      props.verification === JettonVerification.BLACKLIST ||
      currentStatus?.current === TokenApprovalStatus.Declined
    ) {
      return 'declined';
    } else if (
      props.verification === JettonVerification.WHITELIST ||
      currentStatus?.current === TokenApprovalStatus.Approved
    ) {
      return 'approved';
    }
    return 'pending';
  }, [currentStatus, props.verification]);

  const title = useMemo(() => {
    if (props.type === TokenApprovalType.Token) {
      if (modalState === 'pending') {
        return t('approval.verify_token');
      } else {
        return t('approval.token_details');
      }
    } else {
      if (modalState === 'pending') {
        return t('approval.verify_collection');
      } else {
        return t('approval.collection_details');
      }
    }
  }, [modalState, props.type]);

  const subtitle = useMemo(() => {
    if (modalState === 'declined') {
      if (!currentStatus) {
        return t(
          props.type === TokenApprovalType.Token
            ? 'approval.blacklisted_token'
            : 'approval.blacklisted_collection',
        );
      }
      return t('approval.declined_at', {
        date: format(currentStatus?.updated_at, 'd MMM yyyy'),
      });
    }
    if (modalState === 'approved') {
      if (!currentStatus) {
        return t(
          props.type === TokenApprovalType.Token
            ? 'approval.whitelisted_token'
            : 'approval.whitelisted_collection',
        );
      }
      return t('approval.accepted_at', {
        date: format(currentStatus?.updated_at, 'd MMM yyyy, hh:mm'),
      });
    }
    if (props.type === TokenApprovalType.Token) {
      return t('approval.verify_token_description');
    } else {
      return t('approval.verify_tokens_description');
    }
  }, [currentStatus, modalState, props.type]);

  const renderActions = useCallback(() => {
    switch (modalState) {
      case 'pending':
        return (
          <>
            <Button
              onPress={handleUpdateStatus(TokenApprovalStatus.Approved)}
              mode="secondary"
            >
              {t('approval.accept')}
            </Button>
            <Spacer y={16} />
            <Button
              onPress={handleUpdateStatus(TokenApprovalStatus.Declined)}
              mode="secondary"
            >
              {t('approval.decline')}
            </Button>
          </>
        );
      case 'approved':
        return (
          <Button
            onPress={handleUpdateStatus(TokenApprovalStatus.Declined)}
            mode="secondary"
          >
            {t('approval.move_to_declined')}
          </Button>
        );
      case 'declined':
        return (
          <Button
            onPress={handleUpdateStatus(TokenApprovalStatus.Approved)}
            mode="secondary"
          >
            {t('approval.move_to_accepted')}
          </Button>
        );
    }
  }, [handleUpdateStatus, modalState]);

  return (
    <Modal>
      <Modal.Header />
      <Modal.Content>
        <View style={styles.wrap}>
          <View style={styles.textWrap}>
            <Text textAlign="center" variant="h2">
              {title}
            </Text>
            <Spacer y={4} />
            <Text variant="body2" color="textSecondary" textAlign="center">
              {subtitle}
            </Text>
          </View>
          <Spacer y={32} />
          <List indent={false} compact={false}>
            <List.Item
              title={t('approval.name')}
              subtitle={props.name}
              value={
                <FastImage
                  style={
                    props.imageType !== ImageType.SQUARE
                      ? styles.round.static
                      : styles.square.static
                  }
                  source={{ uri: props.image }}
                />
              }
            />
            <List.Item
              onPress={handleCopyAddress}
              title={
                props.type === TokenApprovalType.Token
                  ? t('approval.token_id')
                  : t('approval.collection_id')
              }
              subtitle={maskifyAddress(
                new Address(props.tokenAddress).toString(true, true, true),
                6,
              )}
              value={
                <View style={styles.copyIconContainer}>
                  <Icon name={'ic-copy-16'} />
                </View>
              }
            />
          </List>
        </View>
        <Spacer y={16} />
      </Modal.Content>
      <Modal.Footer>
        <View style={styles.footerWrap}>{renderActions()}</View>
        <Spacer y={16} />
      </Modal.Footer>
    </Modal>
  );
});

export const openApproveTokenModal = async (params: ApproveTokenModalParams) => {
  push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: ApproveToken,
    path: 'ApproveToken',
    params,
  });

  return true;
};

const styles = Steezy.create({
  wrap: {
    paddingHorizontal: 16,
  },
  textWrap: {
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  footerWrap: {
    paddingHorizontal: 16,
  },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  square: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  copyIconContainer: {
    margin: 4,
  },
});
