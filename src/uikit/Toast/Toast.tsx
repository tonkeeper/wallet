import React, { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FullWindowOverlay } from 'react-native-screens';

import { toastSelector } from '$store/toast';
import { triggerNotificationError, triggerNotificationSuccess } from '$utils';

import { Loader } from '../Loader/Loader';
import { useToastAnimation } from './hooks';
import { isSuccessToast, isFailToast, isLoadingToast } from './Toast.utils';
import * as S from './Toast.style';

export const Toast: FC = () => {
  const { activity, label, type } = useSelector(toastSelector);
  const { progress, hide } = useToastAnimation(activity);
  const { top } = useSafeAreaInsets();

  useEffect(() => {
    if (!activity) {
      return;
    }

    if (isSuccessToast(activity)) {
      triggerNotificationSuccess();
    }

    if (isFailToast(activity)) {
      triggerNotificationError();
    }
  }, [activity]);

  if (!activity) {
    return null;
  }

  const loading = isLoadingToast(activity);
  const wrapperStyles = {
    top: top + 3,
  };

  const Content = type === 'small' ? S.ContentSmall : S.Content;

  return (
    <FullWindowOverlay style={{ position: 'absolute', width: '100%', height: '100%' }}>
      <S.Wrap onPress={hide} activeOpacity={1} style={wrapperStyles}>
        <Content
          style={{
            transform: [
              {
                translateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-60, 0],
                }),
              },
            ],
          }}
          {...{ loading }}
        >
          {loading && (
            <S.LoaderWrapper>
              <Loader color="foregroundPrimary" size="medium" />
            </S.LoaderWrapper>
          )}

          {type === 'small' ? (
            <S.LabelSmall {...{ loading }}>{label}</S.LabelSmall>
          ) : (
            <S.Label {...{ loading }}>{label}</S.Label>
          )}  
        </Content>
      </S.Wrap>
    </FullWindowOverlay>
  );
};
