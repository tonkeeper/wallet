import {
  Screen,
  View,
  Steezy,
  Text,
  Spacer,
  Button,
  deviceHeight,
} from '@tonkeeper/uikit';
import Svg, { Path, Defs, LinearGradient, Stop, G, ClipPath } from 'react-native-svg';
import { useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { memo, useCallback } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { MainStackRouteNames } from '$navigation';
import { useDispatch } from 'react-redux';
import { walletActions } from '$store/wallet';
import { useNavigation } from '@tonkeeper/router';

const HEIGHT_RATIO = deviceHeight / 844;

export const StartScreen = memo(() => {
  const dimensions = useWindowDimensions();
  const dispatch = useDispatch();
  const nav = useNavigation();

  const origShapesWidth = 560;
  const origShapesHeight = 494;
  const origShapesScreenHeight = 844;
  const ratioHeight = dimensions.height / origShapesScreenHeight;
  const logoShapesPosX = origShapesWidth / 2 - dimensions.width / 2;
  const logoShapesPosY = origShapesHeight / 2 - (origShapesHeight * ratioHeight) / 2;

  const handleCreatePress = useCallback(() => {
    dispatch(walletActions.generateVault());
    nav.navigate(MainStackRouteNames.CreateWalletStack);
  }, [dispatch, nav]);

  return (
    <Screen>
      <View style={{ flex: 1 }}>
        <View
          style={{
            height: 494 * HEIGHT_RATIO,
          }}
        >
          <Animated.View
            style={[
              styles.absolute.static,
              {
                transform: [
                  { translateX: -logoShapesPosX },
                  { translateY: -logoShapesPosY },
                  { scale: HEIGHT_RATIO },
                ],
              },
            ]}
          >
            <LogoShapes />
          </Animated.View>
        </View>
        <View style={styles.info}>
          <Text type="h2" textAlign="center">
            Tonkeeper
          </Text>
          <Spacer y={4} />
          <Text type="body1" color="textSecondary" textAlign="center">
            {t('start_screen.caption')}
          </Text>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.buttons}>
          <Button
            title={t('start_screen.create_wallet_button')}
            onPress={handleCreatePress}
          />
          <Spacer y={16} />
          <Button
            title={t('start_screen.import_wallet_button')}
            color="secondary"
            navigate={MainStackRouteNames.ImportWalletStack}
          />
        </View>
      </View>
    </Screen>
  );
});

const styles = Steezy.create(({ safeArea }) => ({
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  logoIcon: {
    position: 'relative',
  },
  content: {
    paddingBottom: safeArea.bottom,
  },
  logo: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 1,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: 32,
    paddingBottom: 8,
  },
  buttons: {
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 32,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    height: 224,
    width: '100%',
    zIndex: 1,
  },
}));

const LogoShapes = () => (
  <Svg width={560} height={494} fill="none">
    <G clipPath="url(#a)">
      <Path fill="url(#b)" d="m280 412-600-270 600-270 600 270-600 270Z" opacity={0.12} />
      <Path
        fill="url(#c)"
        d="m700-172.998-420-189-420 189 419.997 650.996L700-172.998Z"
        opacity={0.12}
      />
      <Path
        fill="url(#d)"
        d="m-140-172.998 420-189 .003 839.996L-140-172.998Z"
        opacity={0.12}
      />
      <Path
        fill="#45AEF4"
        fillOpacity={0.01}
        stroke="#45AEF4"
        strokeWidth={0.5}
        d="M280 411.726-319.391 142 280-127.726 879.391 142 280 411.726Z"
        opacity={0.12}
      />
      <Path
        fill="#45AEF4"
        fillOpacity={0.01}
        stroke="#45AEF4"
        strokeWidth={0.5}
        d="M280-361.724 699.632-172.89 279.997 477.537-139.632-172.89 280-361.724Z"
        opacity={0.12}
      />
      <Path
        fill="#45AEF4"
        fillOpacity={0.01}
        stroke="#45AEF4"
        strokeWidth={0.5}
        d="M279.753 477.15 280-361.612-139.632-172.89l419.385 650.04Z"
        opacity={0.12}
      />
      <Path fill="url(#e)" d="M0 0h280v494H0z" />
      <Path fill="url(#f)" d="M560 0h320v560H560z" transform="rotate(90 560 0)" />
      <Path fill="url(#g)" d="M0 0h280v494H0z" transform="matrix(-1 0 0 1 560 0)" />
    </G>
    <Path fill="url(#h)" d="m280 412 60-27-60 93v-66Z" />
    <Path fill="url(#i)" d="m280 412-60-27 60 93v-66Z" />
    <Path fill="#45AEF5" d="m280 412-60-27 60-27 60 27-60 27Z" />
    <Defs>
      <LinearGradient
        id="b"
        x1={280}
        x2={280}
        y1={-128}
        y2={412}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#45AEF5" stopOpacity={0} />
        <Stop offset={1} stopColor="#45AEF5" stopOpacity={0.4} />
      </LinearGradient>
      <LinearGradient
        id="c"
        x1={280}
        x2={280}
        y1={-361.998}
        y2={477.998}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#45AEF5" stopOpacity={0} />
        <Stop offset={1} stopColor="#45AEF5" stopOpacity={0.4} />
      </LinearGradient>
      <LinearGradient
        id="d"
        x1={70.001}
        x2={70.001}
        y1={-361.998}
        y2={477.998}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#45AEF5" stopOpacity={0} />
        <Stop offset={1} stopColor="#45AEF5" stopOpacity={0.4} />
      </LinearGradient>
      <LinearGradient
        id="e"
        x1={0}
        x2={280}
        y1={247}
        y2={247}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#10161F" />
        <Stop offset={0.067} stopColor="#10161F" stopOpacity={0.991} />
        <Stop offset={0.133} stopColor="#10161F" stopOpacity={0.964} />
        <Stop offset={0.2} stopColor="#10161F" stopOpacity={0.918} />
        <Stop offset={0.267} stopColor="#10161F" stopOpacity={0.853} />
        <Stop offset={0.333} stopColor="#10161F" stopOpacity={0.768} />
        <Stop offset={0.4} stopColor="#10161F" stopOpacity={0.668} />
        <Stop offset={0.467} stopColor="#10161F" stopOpacity={0.557} />
        <Stop offset={0.533} stopColor="#10161F" stopOpacity={0.443} />
        <Stop offset={0.6} stopColor="#10161F" stopOpacity={0.332} />
        <Stop offset={0.667} stopColor="#10161F" stopOpacity={0.232} />
        <Stop offset={0.733} stopColor="#10161F" stopOpacity={0.147} />
        <Stop offset={0.8} stopColor="#10161F" stopOpacity={0.082} />
        <Stop offset={0.867} stopColor="#10161F" stopOpacity={0.036} />
        <Stop offset={0.933} stopColor="#10161F" stopOpacity={0.01} />
        <Stop offset={1} stopColor="#10161F" stopOpacity={0} />
      </LinearGradient>
      <LinearGradient
        id="f"
        x1={560}
        x2={880}
        y1={280}
        y2={280}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#10161F" />
        <Stop offset={0.067} stopColor="#10161F" stopOpacity={0.991} />
        <Stop offset={0.133} stopColor="#10161F" stopOpacity={0.964} />
        <Stop offset={0.2} stopColor="#10161F" stopOpacity={0.918} />
        <Stop offset={0.267} stopColor="#10161F" stopOpacity={0.853} />
        <Stop offset={0.333} stopColor="#10161F" stopOpacity={0.768} />
        <Stop offset={0.4} stopColor="#10161F" stopOpacity={0.668} />
        <Stop offset={0.467} stopColor="#10161F" stopOpacity={0.557} />
        <Stop offset={0.533} stopColor="#10161F" stopOpacity={0.443} />
        <Stop offset={0.6} stopColor="#10161F" stopOpacity={0.332} />
        <Stop offset={0.667} stopColor="#10161F" stopOpacity={0.232} />
        <Stop offset={0.733} stopColor="#10161F" stopOpacity={0.147} />
        <Stop offset={0.8} stopColor="#10161F" stopOpacity={0.082} />
        <Stop offset={0.867} stopColor="#10161F" stopOpacity={0.036} />
        <Stop offset={0.933} stopColor="#10161F" stopOpacity={0.01} />
        <Stop offset={1} stopColor="#10161F" stopOpacity={0} />
      </LinearGradient>
      <LinearGradient
        id="g"
        x1={0}
        x2={280}
        y1={247}
        y2={247}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#10161F" />
        <Stop offset={0.067} stopColor="#10161F" stopOpacity={0.991} />
        <Stop offset={0.133} stopColor="#10161F" stopOpacity={0.964} />
        <Stop offset={0.2} stopColor="#10161F" stopOpacity={0.918} />
        <Stop offset={0.267} stopColor="#10161F" stopOpacity={0.853} />
        <Stop offset={0.333} stopColor="#10161F" stopOpacity={0.768} />
        <Stop offset={0.4} stopColor="#10161F" stopOpacity={0.668} />
        <Stop offset={0.467} stopColor="#10161F" stopOpacity={0.557} />
        <Stop offset={0.533} stopColor="#10161F" stopOpacity={0.443} />
        <Stop offset={0.6} stopColor="#10161F" stopOpacity={0.332} />
        <Stop offset={0.667} stopColor="#10161F" stopOpacity={0.232} />
        <Stop offset={0.733} stopColor="#10161F" stopOpacity={0.147} />
        <Stop offset={0.8} stopColor="#10161F" stopOpacity={0.082} />
        <Stop offset={0.867} stopColor="#10161F" stopOpacity={0.036} />
        <Stop offset={0.933} stopColor="#10161F" stopOpacity={0.01} />
        <Stop offset={1} stopColor="#10161F" stopOpacity={0} />
      </LinearGradient>
      <LinearGradient
        id="h"
        x1={280}
        x2={280}
        y1={358}
        y2={478}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#2F87C2" />
        <Stop offset={1} stopColor="#1D3D52" />
      </LinearGradient>
      <LinearGradient
        id="i"
        x1={250}
        x2={280}
        y1={385}
        y2={478}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#3991CC" />
        <Stop offset={1} stopColor="#214A66" />
      </LinearGradient>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h560v494H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
