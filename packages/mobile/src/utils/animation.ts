import Animated, {
  not,
  set,
  call,
  cond,
  Clock,
  block,
  Value,
  Easing,
  stopClock,
  startClock,
  clockRunning,
  timing as reTiming,
} from 'react-native-reanimated';

export const clamp = (num: number, min: number, max: number): number =>
  Math.min(Math.max(num, min), max);

const onInit = (
  clock: Animated.Clock,
  sequence: Animated.Adaptable<number>,
  other = [],
) => cond(not(clockRunning(clock)), sequence, other);

interface AnimateParams<S, C> {
  clock: Animated.Clock;
  fn: (clock: Animated.Clock, state: S, config: C) => Animated.Adaptable<number>;
  state: S;
  config: C;
  from: Animated.Adaptable<number>;
}

interface TimingAnimation {
  state: Animated.TimingState;
  config: Animated.TimingConfig;
}

export interface TimingParams {
  clock?: Animated.Clock;
  from?: Animated.Adaptable<number>;
  to?: Animated.Adaptable<number>;
  pause?: Animated.Adaptable<number>;
  duration?: Animated.Adaptable<number>;
  easing?: Animated.EasingFunction;
}

const animate = <T extends Animation>({
                                        fn,
                                        clock,
                                        state,
                                        config,
                                        from,
                                        callback = () => {},
                                      }: AnimateParams<T['state'], T['config']>) =>
  block([
    onInit(clock, [
      set(state.finished, 0),
      set(state.time, 0),
      set(state.position, from),
      startClock(clock),
    ]),
    fn(clock, state, config),
    cond(state.finished, stopClock(clock)),
    cond(
      state.finished,
      call([state.position], ([value]) => {
        if (typeof callback === 'function') callback(value);
      }),
    ),
    state.position,
  ]);

export const timing = (params: TimingParams) => {
  const { clock, easing, duration, from, to, pause, callback } = {
    clock: new Clock(),
    easing: Easing.linear,
    duration: 250,
    from: 0,
    to: 1,
    pause: new Value(0),
    callback: () => {},
    ...params,
  };

  const state: Animated.TimingState = {
    paused: new Value(0),
    finished: new Value(0),
    position: new Value(0),
    started: new Value(0),
    time: new Value(0),
    frameTime: new Value(0),
  };

  const config = {
    toValue: new Value(0),
    duration,
    easing,
  };

  return block([
    onInit(
      clock,
      [set(config.toValue, to), set(state.frameTime, 0)],
      [
        cond(
          pause,
          [set(state.paused, 1), set(state.time, clock)],
          [set(state.paused, 0), set(config.toValue, to)],
        ),
      ],
    ),
    animate<TimingAnimation>({
      clock,
      fn: reTiming,
      state,
      config,
      from,
      callback,
    }),
  ]);
};
