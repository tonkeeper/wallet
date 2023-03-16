import { SkeletonLine } from './SkeletonLine';
import { SkeletonLineOpacityAnimation } from './SkeletonLineOpacityAnimation';
import { SkeletonList } from './SkeletonList';

export { SkeletonProvider } from './SkeletonProvider';

export const Skeleton = Object.assign(
  {},
  {
    Line: SkeletonLine,
    LineOpacity: SkeletonLineOpacityAnimation,
    List: SkeletonList,
  },
);
