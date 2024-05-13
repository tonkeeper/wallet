import { RechargeMethods } from '@tonkeeper/core/src/BatteryAPI';

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type RechargeMethod = ArrayElement<RechargeMethods['methods']>;
