import { accentSelector, accentTonIconSelector } from '$store/main';
import { AccentKey } from '$styled';
import { useSelector } from 'react-redux';

export const useDiamondIcon = () => {
  const accentTonIcon = useSelector(accentTonIconSelector);
  const accent = useSelector(accentSelector);

  const shouldShowCustomTonIcon = accent !== AccentKey.default;
  return {
    hasDiamond: shouldShowCustomTonIcon && accentTonIcon,
    accentTonIcon,
    accent,
  };
};
