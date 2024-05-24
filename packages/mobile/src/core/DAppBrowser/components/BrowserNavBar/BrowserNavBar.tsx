import { useCopyText } from '$hooks/useCopyText';
import { Icon, PopupSelect, Text } from '$uikit';
import { getDomainFromURL } from '$utils';
import React, { FC, memo, useCallback, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Share from 'react-native-share';
import * as S from './BrowserNavBar.style';
import { PopupSelectItemProps } from '$uikit/PopupSelect/PopupSelect.interface';
import { Toast } from '$store';
import { goBack } from '$navigation/imperative';
import { t } from '@tonkeeper/shared/i18n';
import { Address } from '@tonkeeper/core';
import { getFlag } from '$utils/flags';

enum PopupActionType {
  REFRESH,
  SHARE,
  COPY_LINK,
  DISCONNECT,
  MUTE,
}

interface PopupAction {
  type: PopupActionType;
  label: string;
  icon?: PopupSelectItemProps['icon'];
}

interface Props {
  title: string;
  url: string;
  isConnected: boolean;
  isNotificationsEnabled: boolean;
  walletAddress: string;
  canGoBack: boolean;
  onBackPress: () => void;
  onTitlePress: () => void;
  onRefreshPress: () => void;
  disconnect: () => Promise<void>;
  unsubscribeFromNotifications: () => Promise<void>;
  disableSearchBar?: boolean;
}

const BrowserNavBarComponent: FC<Props> = (props) => {
  const {
    title,
    url,
    isConnected,
    isNotificationsEnabled,
    walletAddress,
    canGoBack,
    onBackPress,
    onTitlePress,
    onRefreshPress,
    disconnect,
    unsubscribeFromNotifications,
  } = props;

  const copyText = useCopyText();

  const { top: topInset } = useSafeAreaInsets();

  const isHTTPS = url.startsWith('https');

  const domain = getDomainFromURL(url);

  const shortAddress =
    walletAddress &&
    Address.parse(walletAddress, {
      bounceable: !getFlag('address_style_nobounce'),
      testOnly: Address.isTestnet(walletAddress),
    }).toShort();

  const popupItems = useMemo(() => {
    const items: PopupAction[] = [
      {
        type: PopupActionType.REFRESH,
        label: t('browser.actions.refresh'),
        icon: 'ic-refresh-16',
      },
    ];

    if (isNotificationsEnabled) {
      items.push({
        type: PopupActionType.MUTE,
        label: t('browser.actions.mute'),
        icon: 'ic-bell-disable-16',
      });
    }

    items.push(
      {
        type: PopupActionType.SHARE,
        label: t('browser.actions.share'),
        icon: 'ic-share-16',
      },
      {
        type: PopupActionType.COPY_LINK,
        label: t('browser.actions.copy_link'),
        icon: 'ic-copy-16',
      },
    );

    if (isConnected) {
      items.push({
        type: PopupActionType.DISCONNECT,
        label: t('browser.actions.disconnect'),
        icon: 'ic-disconnect-16',
      });
    }

    return items;
  }, [isConnected, isNotificationsEnabled]);

  const handlePressAction = useCallback(
    (action: PopupAction) => {
      switch (action.type) {
        case PopupActionType.REFRESH:
          return onRefreshPress();
        case PopupActionType.SHARE:
          setTimeout(() => {
            Share.open({ failOnCancel: false, url }).catch((err) => {
              console.log('cant share', err);
            });
          }, 300);
          return;
        case PopupActionType.COPY_LINK:
          return copyText(url);
        case PopupActionType.DISCONNECT:
          return disconnect();
        case PopupActionType.MUTE:
          Toast.success(t('notifications.muted'));
          unsubscribeFromNotifications();
          return;
      }
    },
    [copyText, disconnect, onRefreshPress, unsubscribeFromNotifications, url],
  );

  return (
    <S.Container topOffset={topInset}>
      <S.LeftContainer>
        {canGoBack ? (
          <S.BackButtonTouchable onPress={onBackPress}>
            <S.BackButton>
              <Icon name="ic-chevron-left-16" color="foregroundPrimary" />
            </S.BackButton>
          </S.BackButtonTouchable>
        ) : null}
      </S.LeftContainer>
      <S.MiddleContainer disabled={props.disableSearchBar} onPress={onTitlePress}>
        <S.Title>{title || '...'}</S.Title>
        {isConnected ? (
          <S.SubTitleRow>
            <S.ConnectedIcon />
            <S.SubTitle>{shortAddress}</S.SubTitle>
          </S.SubTitleRow>
        ) : (
          <S.SubTitleRow>
            {isHTTPS ? <S.SecureIcon /> : null}
            <S.SubTitle>{domain}</S.SubTitle>
          </S.SubTitleRow>
        )}
      </S.MiddleContainer>
      <S.RightContainer>
        <S.ActionsContainer>
          <S.ActionItem>
            <PopupSelect
              items={popupItems}
              onChange={handlePressAction}
              renderItem={(item) => <Text variant="label1">{item.label}</Text>}
              keyExtractor={(item) => item.label}
              autoWidth
              minWidth={180}
            >
              <S.ActionItemTouchable
                hitSlop={{
                  top: 12,
                  bottom: 12,
                  left: 12,
                  right: 0,
                }}
              >
                <S.ActionItemContent>
                  <Icon name="ic-ellipsis-16" color="foregroundPrimary" />
                </S.ActionItemContent>
              </S.ActionItemTouchable>
            </PopupSelect>
          </S.ActionItem>
          <S.ActionsDivider />
          <S.ActionItem>
            <S.ActionItemTouchable
              hitSlop={{
                top: 12,
                bottom: 12,
                left: 0,
                right: 12,
              }}
              onPress={goBack}
            >
              <S.ActionItemContent>
                <Icon name="ic-close-16" color="foregroundPrimary" />
              </S.ActionItemContent>
            </S.ActionItemTouchable>
          </S.ActionItem>
        </S.ActionsContainer>
      </S.RightContainer>
    </S.Container>
  );
};

export const BrowserNavBar = memo(BrowserNavBarComponent);
