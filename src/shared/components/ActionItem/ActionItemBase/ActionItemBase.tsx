import React, { FC, useMemo } from 'react';

import * as S from './ActionItemBase.style';
import { ns } from '$utils';
import { useTheme, useTranslator } from '$hooks';
import { Badge, Icon, Text } from '$uikit';
import { ActionItemBaseProps } from './ActionItemBase.interface';
import { Image, View } from 'react-native';

export const ActionItemBase: FC<ActionItemBaseProps> = (props) => {
  const {
    comment,
    isInProgress,
    borderStart,
    borderEnd,
    label,
    typeLabel,
    type,
    infoRows,
    currency,
    labelColor = 'foregroundPrimary',
    bottomContent,
    isSpam,
    handleOpenAction,
  } = props;
  const t = useTranslator();
  const theme = useTheme();

  const iconName = useMemo(() => {
    if (type === 'subscription') {
      return 'ic-bell-28';
    } else if (type === 'unsubscription') {
      return 'ic-xmark-28';
    } else if (type === 'sent') {
      return 'ic-tray-arrow-up-28';
    } else if (type === 'return') {
      return 'ic-return-28';
    } else if (type === 'contract_deploy') {
      return 'ic-gear-28';
    } else if (type === 'wallet_initialized') {
      return 'ic-donemark-28';
    } else {
      return 'ic-tray-arrow-down-28';
    }
  }, [type]);

  return (
    <View>
      <S.Background borderStart={borderStart} borderEnd={borderEnd} />
      <S.Wrap onPress={handleOpenAction} borderStart={borderStart} borderEnd={borderEnd}>
        {(isHighlighted) => (
          <S.ContWrap>
            <S.Icon
              style={{
                backgroundColor: type === 'tg_dns' 
                  ? 'transparent'
                  : theme.colors[
                    isHighlighted ? 'backgroundQuaternary' : 'backgroundTertiary'
                  ],
              }}
            >
              {type === 'tg_dns' ? (
                <Image 
                  style={{ width: 44, height: 44 }} 
                  source={require('$assets/tg-logo.png')} 
                />
              ) : (
                <Icon name={iconName} color="foregroundSecondary" />
              )}
              {isInProgress && (
                <S.Sending>
                  <Icon name="ic-clock-16" color="foregroundPrimary" />
                </S.Sending>
              )}
            </S.Icon>
            <S.Cont>
              <S.Item>
                <S.Group>
                  <S.LargeText>{typeLabel}</S.LargeText>
                  {isSpam && (
                    <Badge style={{ marginLeft: ns(8) }}>
                      {t('spam_action').toUpperCase()}
                    </Badge>
                  )}
                </S.Group>
                <S.Group
                  style={{ flex: 1, justifyContent: 'flex-end', marginLeft: ns(16) }}
                >
                  <S.LargeText
                    style={{
                      flexShrink: 1,
                    }}
                    color={labelColor}
                  >
                    {label}
                  </S.LargeText>
                  {currency ? (
                    <S.LargeText color={labelColor}>{` ${currency}`}</S.LargeText>
                  ) : null}
                </S.Group>
              </S.Item>
              {infoRows?.map((row, i) => (
                <S.Item key={i}>
                  <S.Left>
                    <S.SmallText numberOfLines={1} ellipsizeMode={'tail'}>
                      {row.label}
                    </S.SmallText>
                  </S.Left>
                  <S.SmallText numberOfLines={1}>{row.value}</S.SmallText>
                </S.Item>
              ))}
              {bottomContent}
              {comment ? (
                <S.Comment
                  style={{
                    backgroundColor:
                      theme.colors[
                        isHighlighted ? 'backgroundQuaternary' : 'backgroundTertiary'
                      ],
                  }}
                >
                  <Text variant="body2">{comment}</Text>
                </S.Comment>
              ) : null}
            </S.Cont>
          </S.ContWrap>
        )}
      </S.Wrap>
    </View>
  );
};
