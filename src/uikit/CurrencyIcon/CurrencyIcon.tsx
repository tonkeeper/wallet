import React, { FC, useMemo } from 'react';

import { CurrencyIconProps } from './CurrencyIcon.interface';
import * as S from './CurrencyIcon.style';
import { ns } from '$utils';
import { CryptoCurrencies, CurrenciesIcons } from '$shared/constants';
import { useSelector } from 'react-redux';
import { accentSelector, accentTonIconSelector } from '$store/main';
import { AccentKey } from '$styled';
import { TonDiamondIcon } from '$uikit/TonDiamondIcon/TonDiamondIcon';

export const CurrencyIcon: FC<CurrencyIconProps> = ({
  currency,
  uri,
  isJetton = false,
  size = 48,
  style = {},
}) => {
  const accentTonIcon = useSelector(accentTonIconSelector);
  const accent = useSelector(accentSelector);

  const isTon = currency === CryptoCurrencies.Ton;

  const shouldShowCustomTonIcon = isTon && accent !== AccentKey.default;

  const sizePrepared = useMemo(() => {
    return ns(size);
  }, [size]);

  return (
    <S.Wrap
      style={[
        {
          width: sizePrepared,
          height: sizePrepared,
          borderRadius: sizePrepared / 2,
        },
        style,
      ]}
    >
      {shouldShowCustomTonIcon && accentTonIcon ? (
        <TonDiamondIcon id={accent} size={size} nftIcon={accentTonIcon} />
      ) : (
        <S.Icon
          source={
            isJetton ? { uri } : CurrenciesIcons[currency as keyof typeof CurrenciesIcons]
          }
          style={{
            width: sizePrepared,
            height: sizePrepared,
          }}
          resizeMode="contain"
        />
      )}
    </S.Wrap>
  );
};
