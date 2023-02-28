import { useTranslator, useCopyText } from '$hooks';
import { goBack } from '$navigation';
import { Icon, PopupSelect, Text } from '$uikit';
import { getDomainFromURL, maskifyAddress } from '$utils';
import React, { FC, memo, useCallback, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Share from 'react-native-share';
import * as S from './BrowserNavBar.style';

enum PopupActionType {
  REFRESH,
  SHARE,
  COPY_LINK,
  DISCONNECT,
}

interface PopupAction {
  type: PopupActionType;
  label: string;
}

interface Props {
  title: string;
  url: string;
  isConnected: boolean;
  walletAddress: string;
  canGoBack: boolean;
  onBackPress: () => void;
  onTitlePress: () => void;
  onRefreshPress: () => void;
  disconnect: () => Promise<void>;
}

const BrowserNavBarComponent: FC<Props> = (props) => {
  const {
    title,
    url,
    isConnected,
    walletAddress,
    canGoBack,
    onBackPress,
    onTitlePress,
    onRefreshPress,
    disconnect,
  } = props;

  const t = useTranslator();

  const copyText = useCopyText();

  const { top: topInset } = useSafeAreaInsets();

  const isHTTPS = url.startsWith('https');

  const domain = getDomainFromURL(url);

  const shortAddress = maskifyAddress(walletAddress);

  const popupItems = useMemo(() => {
    const items: PopupAction[] = [
      {
        type: PopupActionType.REFRESH,
        label: t('browser.actions.refresh'),
      },
      {
        type: PopupActionType.SHARE,
        label: t('browser.actions.share'),
      },
      {
        type: PopupActionType.COPY_LINK,
        label: t('browser.actions.copy_link'),
      },
    ];

    if (isConnected) {
      items.push({
        type: PopupActionType.DISCONNECT,
        label: t('browser.actions.disconnect'),
      });
    }

    return items;
  }, [isConnected, t]);

  const handlePressAction = useCallback(
    (action: PopupAction) => {
      switch (action.type) {
        case PopupActionType.REFRESH:
          return onRefreshPress();
        case PopupActionType.SHARE:
          setTimeout(() => {
            Share.open({ failOnCancel: false, urls: [url] }).catch((err) => {
              console.log('cant share', err);
            });
          }, 0);
          return;
        case PopupActionType.COPY_LINK:
          return copyText(url);
        case PopupActionType.DISCONNECT:
          return disconnect();
      }
    },
    [copyText, disconnect, onRefreshPress, url],
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
      <S.MiddleContainer onPress={onTitlePress}>
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
              autoWidth={true}
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
