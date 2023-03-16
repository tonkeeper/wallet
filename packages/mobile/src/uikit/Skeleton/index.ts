import { SkeletonLine } from './SkeletonLine';
import { SkeletonList } from './SkeletonList';

export { SkeletonProvider } from './SkeletonProvider';

export const Skeleton = Object.assign(
  {},
  {
    Line: SkeletonLine,
    List: SkeletonList,
  },
);
