import { Steezy } from '$styles';
import { AnimatedView, Icon, TouchableOpacity, View } from '$uikit';
import { Style } from '@bogoslavskiy/react-native-steezy/dist/types';
import { convertHexToRGBA, isAndroid } from '$utils';
import * as React from 'react';
import { useWindowDimensions } from 'react-native';
import { useAnimatedStyle } from 'react-native-reanimated';
import { useTabCtx } from './TabsContainer';
import { goBack } from '$navigation/imperative';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '@tonkeeper/uikit';

interface TabsHeaderProps {
  style?: Style;
  withBackButton?: boolean;
  children?: React.ReactNode;
  leftContentGradient?: boolean;
}

export const TabsHeader: React.FC<TabsHeaderProps> = (props) => {
  const dimensions = useWindowDimensions();
  const { headerHeight, scrollY } = useTabCtx();
  const theme = useTheme();

  const shouldRenderGoBackButton = props.withBackButton ?? false;

  const balanceStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: -scrollY.value,
        },
      ],
    };
  });

  const handleBack = React.useCallback(() => {
    goBack();
  }, []);

  function renderLeftContent() {
    if (shouldRenderGoBackButton) {
      return (
        <View style={[styles.leftContent]}>
          {props.leftContentGradient && (
            <>
              <View style={styles.background} />
              <LinearGradient
                style={styles.leftContentGradient.static}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 1 }}
                colors={[theme.backgroundPage, convertHexToRGBA(theme.backgroundPage, 0)]}
                pointerEvents="none"
              />
            </>
          )}
          <View style={styles.backButtonContainer}>
            <TouchableOpacity
              activeOpacity={0.6}
              style={styles.backButton}
              onPress={handleBack}
            >
              <Icon name="ic-chevron-left-16" color="foregroundPrimary" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return null;
  }

  return (
    <AnimatedView
      pointerEvents="box-none"
      style={[balanceStyle, styles.container, { width: dimensions.width }, props.style]}
      onLayout={(ev) => {
        headerHeight.value = ev.nativeEvent.layout.height;
      }}
    >
      {renderLeftContent()}
      {props.children}
    </AnimatedView>
  );
};

const styles = Steezy.create(({ colors, safeArea }) => ({
  container: {
    position: 'absolute',
    top: 0,
    zIndex: isAndroid ? 1 : 4,
    backgroundColor: colors.backgroundPage,
  },
  leftContent: {
    top: 16,
    left: 16,
    position: 'absolute',
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0,
  },
  backButtonContainer: {
    paddingTop: safeArea.top,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  backButton: {
    backgroundColor: colors.buttonSecondaryBackground,
    height: 32,
    width: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftContentGradient: {
    height: 64,
    width: 24,
    position: 'absolute',
    right: -22,
    bottom: 0,
  },
  background: {
    backgroundColor: colors.backgroundPage,
    position: 'absolute',
    right: 0,
    top: 0,
    left: -16,
    bottom: 0,
  },
}));
