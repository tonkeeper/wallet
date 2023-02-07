import { APPS_ITEMS_IN_ROW } from '$core/DAppsExplore/constants';
import { useSkeletonAnimation } from '$uikit/Skeleton/SkeletonContext';
import { ns } from '$utils';
import React, { FC, memo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import * as S from './AppItem.style';

interface Props {
  index: number;
}

const flareWidth = ns(96);

const AppItemSkeletonComponent: FC<Props> = (props) => {
  const { index } = props;

  const withoutMargin = index === undefined || (index + 1) % APPS_ITEMS_IN_ROW === 0;

  const containerRef = React.useRef<View>(null);

  const animation = useSkeletonAnimation();
  const dimensions = useWindowDimensions();

  const xpos = useSharedValue(-1);
  const viewSize = useSharedValue({ width: 0, height: 0 });

  const animationStyle = useAnimatedStyle(() => {
    const indent = dimensions.width - (xpos.value + viewSize.value.width);
    const start = dimensions.width - viewSize.value.width - indent + flareWidth;
    const end = viewSize.value.width + indent;

    return {
      width: viewSize.value.width,
      height: viewSize.value.height,
      transform: [
        {
          translateX: interpolate(animation.value, [0, 1], [-start, end]),
        },
      ],
    };
  });

  React.useEffect(() => {
    containerRef.current?.measureInWindow((x, _y, width, height) => {
      xpos.value = x;
      viewSize.value = { width, height };
    });
  }, [viewSize, xpos]);

  return (
    <S.Container withoutMargin={withoutMargin}>
      <View ref={containerRef}>
        <S.IconContainer>
          <Animated.View style={animationStyle}>
            <LinearGradient
              colors={['rgba(46, 56, 71, 0)', '#2e38478e', 'rgba(46, 56, 71, 0)']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1 }}
            />
          </Animated.View>
        </S.IconContainer>
      </View>
      <S.Title numberOfLines={1} />
    </S.Container>
  );
};

export const AppItemSkeleton = memo(AppItemSkeletonComponent);
