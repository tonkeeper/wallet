import { mainActions } from '$store/main';
import { NFTModel, TonDiamondMetadata } from '$store/models';
import { AccentKey, getAccentIdByDiamondsNFT } from '$styled';
import { useNftsState } from '@tonkeeper/shared/hooks';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export const useDiamondsChecker = () => {
  const selectedDiamond = useNftsState((s) => s.selectedDiamond);

  const dispatch = useDispatch();

  useEffect(() => {
    const accent = selectedDiamond
      ? getAccentIdByDiamondsNFT(
          selectedDiamond as unknown as NFTModel<TonDiamondMetadata>,
        )
      : AccentKey.default;
    console.log('accent', accent);
    dispatch(mainActions.setAccent(accent));
    dispatch(
      mainActions.setTonCustomIcon(
        selectedDiamond ? selectedDiamond.metadata.image_diamond : null,
      ),
    );
  }, [dispatch, selectedDiamond]);
};
