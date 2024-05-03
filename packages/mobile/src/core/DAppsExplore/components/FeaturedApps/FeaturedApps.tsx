import { config } from '$config';
import { openDAppBrowser } from '$navigation';
import { IAppMetadata } from '$store';
import { getRandomInt } from '$utils';
import { trackEvent } from '$utils/stats';
import { Picture, Spacer, Steezy, Text, View, ns } from '@tonkeeper/uikit';
import { FC, memo, useCallback, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Carousel from 'react-native-reanimated-carousel';

interface Props {
  items: IAppMetadata[];
}

interface ItemProps {
  metadata: IAppMetadata;
}

const CarouselItem = memo<ItemProps>(({ metadata }) => {
  const handlePress = useCallback(() => {
    const { url, name } = metadata;

    trackEvent('click_dapp', { url, name });

    openDAppBrowser(url);
  }, [metadata]);

  return (
    <View style={styles.wrapper}>
      <Picture uri={metadata.poster} style={styles.container}>
        <TouchableWithoutFeedback style={styles.content.static} onPress={handlePress}>
          <View style={styles.contentRow}>
            <Picture uri={metadata.icon} style={styles.icon} />
            <Spacer x={12} />
            <View style={styles.textContainer}>
              <Text
                type="label2"
                numberOfLines={1}
                color="constantWhite"
                style={!!metadata.textColor && { color: metadata.textColor }}
              >
                {metadata.name}
              </Text>
              <Text
                type="body3Alt"
                numberOfLines={2}
                color="constantWhite"
                style={[
                  styles.description.static,
                  !!metadata.textColor && { color: metadata.textColor },
                ]}
              >
                {metadata.description}
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Picture>
    </View>
  );
});

const FeaturedAppsComponent: FC<Props> = (props) => {
  const { items } = props;

  const { width } = useWindowDimensions();

  const initialIndex = useRef(getRandomInt(0, items.length - 1)).current;

  return (
    <Carousel
      loop
      width={width - ns(24)}
      style={{ width: width }}
      height={(width - ns(32)) / 2}
      autoPlay={true}
      data={items}
      defaultIndex={initialIndex}
      autoPlayInterval={config.get('featured_play_interval') ?? 3000}
      panGestureHandlerProps={{
        activeOffsetX: [-10, 10],
      }}
      renderItem={({ item }) => <CarouselItem metadata={item} />}
    />
  );
};

const styles = Steezy.create(({ colors, corners }) => ({
  wrapper: {
    flex: 1,
    paddingHorizontal: 4,
    transform: [{ translateX: 12 }],
  },
  container: {
    flex: 1,
    borderRadius: corners.medium,
    overflow: 'hidden',
    backgroundColor: colors.backgroundContent,
  },
  content: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: 'relative',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: corners.small,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    height: 60,
  },
  description: {
    opacity: 0.76,
  },
}));

export const FeaturedApps = memo(FeaturedAppsComponent);
