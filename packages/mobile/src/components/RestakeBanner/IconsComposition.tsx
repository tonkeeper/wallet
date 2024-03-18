import { Steezy, View } from '@tonkeeper/uikit';
import { Image } from 'react-native';
import { liquidTfIconSource, tonIconSource } from '@tonkeeper/uikit/assets/staking';

export const IconsComposition = () => {
  return (
    <View style={styles.container}>
      <Image style={styles.image.static} source={tonIconSource} />
      <View>
        <View style={styles.border} />
        <Image style={[styles.image.static]} source={liquidTfIconSource} />
      </View>
    </View>
  );
};

export const styles = Steezy.create(({ colors }) => ({
  container: {
    flexDirection: 'row',
    gap: -12,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  border: {
    position: 'absolute',
    top: -3,
    bottom: -3,
    left: -3,
    right: -3,
    backgroundColor: colors.backgroundContent,
    borderRadius: 35,
  },
}));
