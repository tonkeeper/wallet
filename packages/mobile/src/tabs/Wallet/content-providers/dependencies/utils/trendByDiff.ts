import { Trend } from '../../utils/types';

export function getTrendByDiff(diff: string) {
  if (diff.startsWith('+')) {
    return Trend.Positive;
  } else if (diff.startsWith('0')) {
    return Trend.Neutral;
  } else {
    return Trend.Negative;
  }
}
