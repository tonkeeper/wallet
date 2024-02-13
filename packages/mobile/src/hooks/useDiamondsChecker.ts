import { mainActions } from '$store/main';
import { AccentKey, AppearanceAccents } from '$styled';
import { useNftsState } from '@tonkeeper/shared/hooks';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export const useDiamondsChecker = () => {
  const selectedDiamond = useNftsState((s) => s.selectedDiamond);

  const dispatch = useDispatch();

  useEffect(() => {
    const accent =
      Object.values(AppearanceAccents).find(
        (item) => item.colors.accentPrimary === selectedDiamond?.metadata.theme.main,
      )?.id ?? AccentKey.default;
    dispatch(mainActions.setAccent(accent));
    dispatch(
      mainActions.setTonCustomIcon(
        selectedDiamond ? selectedDiamond.metadata.image_diamond : null,
      ),
    );
  }, [dispatch, selectedDiamond]);
};
