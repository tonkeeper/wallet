import React, { FC, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Clipboard from '@react-native-community/clipboard';

import * as S from './Logs.style';
import { NavBar, RoundedSectionList, Text } from '$uikit';
import { mainSelector } from '$store/main';
import { format, ns } from '$utils';

import { Toast } from '$store';
import { t } from '@tonkeeper/shared/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const Logs: FC = () => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const { logs } = useSelector(mainSelector);

  const data = useMemo(() => {
    const items = logs.map((log, i) => ({
      key: `${i}`,
      time: format(log.ts, 'hh:mm:ss dd MMMM yyyy'),
      message: JSON.stringify(log.payload),
      trace: log.trace,
      screen: log.screen,
    }));

    return [
      {
        data: items,
      },
    ];
  }, [logs]);

  const handleItemPress = useCallback((item) => {
    const payload = [
      `Screen: ${item.screen}`,
      `Time: ${item.time}`,
      `Message: ${item.message}`,
      `Stack: ${item.trace}`,
    ].join('\n');

    Clipboard.setString(payload);
    Toast.success(t('copied'));
  }, []);

  return (
    <S.Wrap>
      <NavBar>Logs</NavBar>
      <RoundedSectionList
        contentContainerStyle={{
          paddingBottom: insets.bottom + ns(16),
        }}
        sections={data}
        renderItem={(item) => {
          return (
            <S.Item>
              <Text fontSize={13} color="foregroundSecondary" lineHeight={15}>
                {item.time} on {item.screen}
              </Text>
              <S.ItemMessageWrapper>
                <Text numberOfLines={3} lineHeight={20}>
                  {item.message}
                </Text>
              </S.ItemMessageWrapper>
              <S.ItemTraceWrapper>
                <Text
                  color="foregroundSecondary"
                  variant="body2"
                  numberOfLines={1}
                  lineHeight={18}
                >
                  {item.trace}
                </Text>
              </S.ItemTraceWrapper>
            </S.Item>
          );
        }}
        onItemPress={handleItemPress}
      />
    </S.Wrap>
  );
};
