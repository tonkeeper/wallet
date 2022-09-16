import { StackCardStyleInterpolator } from '@react-navigation/stack';
import { Animated } from 'react-native';

import { deviceHeight, isIphoneX, ns, safeAreaInsets, statusBarHeight } from '$utils';

export const popoutInterpolator: StackCardStyleInterpolator = ({
  current,
  next,
  inverted,
  layouts: { screen },
}) => {
  const progress = Animated.add(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    }),
    next
      ? next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        })
      : 0,
  );

  return {
    overlayStyle: {
      backgroundColor: 'rgba(0, 0, 0, 0.72)',
      opacity: Animated.multiply(
        progress.interpolate({
          inputRange: [0, 1, 2],
          outputRange: [0, 1, 1],
          extrapolate: 'clamp',
        }),
        inverted,
      ),
    },
    cardStyle: {
      opacity: Animated.multiply(
        progress.interpolate({
          inputRange: [0, 0.2, 1, 2],
          outputRange: [0, 1, 1, 1],
          extrapolate: 'clamp',
        }),
        inverted,
      ),
      transform: [
        {
          translateY: Animated.multiply(
            progress.interpolate({
              inputRange: [0, 1, 2],
              outputRange: [screen.height / 2, 0, 0],
              extrapolate: 'clamp',
            }),
            inverted,
          ),
        },
      ],
    },
  };
};

export const modalInterpolator: StackCardStyleInterpolator = (props) => {
  const {
    current,
    next,
    inverted,
    layouts: { screen },
  } = props;

  const progress = Animated.add(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    }),
    next
      ? next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        })
      : 0,
  );

  if (!next) {
    return {
      overlayStyle: {
        backgroundColor: 'rgba(0, 0, 0, 0.42)',
        opacity: Animated.multiply(
          progress.interpolate({
            inputRange: [0, 1, 2],
            outputRange: [0, 1, 1],
            extrapolate: 'clamp',
          }),
          inverted,
        ),
      },
      cardStyle: {
        borderRadius: 16,
        overflow: 'hidden',
        transform: [
          {
            translateY: progress.interpolate({
              inputRange: [0, 1, 2],
              outputRange: [
                screen.height, // Focused, but offscreen in the beginning
                0, // Fully focused
                0, // Fully unfocused
              ],
              extrapolate: 'clamp',
            }),
          },
        ],
      },
    };
  }

  const insetTop = statusBarHeight + safeAreaInsets.top;
  const cardStyle = {
    borderRadius: 16,
    overflow: 'hidden',
    transform: [
      {
        translateY: Animated.multiply(
          progress.interpolate({
            inputRange: [0, 1, 2],
            outputRange: [
              0, // Focused, but offscreen in the beginning
              0, // Fully focused
              -deviceHeight / 2 + insetTop, // Fully unfocused
            ],
            extrapolate: 'clamp',
          }),
          inverted,
        ),
      },
      {
        scale: Animated.multiply(
          progress.interpolate({
            inputRange: [0, 1, 2],
            outputRange: [
              1, // Focused, but offscreen in the beginning
              1, // Fully focused
              0.92, // Fully unfocused
            ],
            extrapolate: 'clamp',
          }),
          inverted,
        ),
      },
      {
        translateY: Animated.multiply(
          progress.interpolate({
            inputRange: [0, 1, 2],
            outputRange: [
              0, // Focused, but offscreen in the beginning
              0, // Fully focused
              deviceHeight / 2, // Fully unfocused
            ],
            extrapolate: 'clamp',
          }),
          inverted,
        ),
      },
    ],
  };

  if (isIphoneX) {
    // @ts-ignore
    cardStyle.borderRadius = Animated.multiply(
      progress.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [
          ns(38), // Focused, but offscreen in the beginning
          ns(38), // Fully focused
          ns(12), // Fully unfocused
        ],
        extrapolate: 'clamp',
      }),
      inverted,
    );
  }

  return {
    containerStyle: {
      backgroundColor: '#000',
    },
    cardStyle,
  };
};

export const fadeInterpolator: StackCardStyleInterpolator = ({
  current,
  next,
  inverted,
  layouts: { screen },
}) => {
  const progress = Animated.add(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    }),
    next
      ? next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        })
      : 0,
  );

  return {
    cardStyle: {
      backgroundColor: 'rgba(0, 0, 0, 0.72)',
      opacity: Animated.multiply(
        progress.interpolate({
          inputRange: [0, 1, 2],
          outputRange: [0, 1, 1],
          extrapolate: 'clamp',
        }),
        inverted,
      ),
    },
  };
};
