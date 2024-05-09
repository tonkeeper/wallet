import { memo } from 'react';
import * as S from './ScanQR.style';

export const ScannerMask = memo(() => (
  <>
    <S.Rect>
      <S.LeftTopCorner>
        <S.CornerHelper />
        <S.CornerImage />
      </S.LeftTopCorner>
      <S.RightTopCorner>
        <S.CornerHelper />
        <S.CornerImage />
      </S.RightTopCorner>
      <S.RightBottomCorner>
        <S.CornerHelper />
        <S.CornerImage />
      </S.RightBottomCorner>
      <S.LeftBottomCorner>
        <S.CornerHelper />
        <S.CornerImage />
      </S.LeftBottomCorner>
    </S.Rect>
    <S.MaskOuter>
      <S.MaskRow />
      <S.MaskCenter>
        <S.MaskOverlay />
        <S.MaskInner />
        <S.MaskOverlay />
      </S.MaskCenter>
      <S.MaskRow />
    </S.MaskOuter>
  </>
));
