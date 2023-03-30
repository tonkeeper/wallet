import { useTheme } from '$hooks';
import { Steezy } from '$styles';
import { AnimatedView, Icon, View } from '$uikit';
import { ViewStyle } from '@bogoslavskiy/react-native-steezy/dist/types';
import * as React from 'react';
import { StyleProp, useWindowDimensions } from 'react-native';
import { useAnimatedStyle } from 'react-native-reanimated';
import { useTabCtx } from './TabsContainer';
import { NavBarHeight } from '$shared/constants';
import { goBack } from '$navigation';

interface TabsHeaderProps {
  style?: StyleProp<ViewStyle>;
}

export const TabsHeader: React.FC<TabsHeaderProps> = (props) => {
  const dimensions = useWindowDimensions();
  const theme = useTheme();
  const { headerHeight, scrollY } = useTabCtx();

  const isClosedButton = true;

  
  const balanceStyle = useAnimatedStyle(() => {
    return {
      transform: [{ 
        translateY: -(scrollY.value)
      }]
    }
  });

  const handleBack = React.useCallback(() => {
    goBack();
  }, []);

  function renderRightContent() {
    if (isClosedButton) {
      return (
        <View style={styles.rightContent}>
          <View style={styles.backButtonContaner} onPress={handleBack}>
            <View style={styles.backButton}>
              <Icon name="ic-chevron-left-16" color="foregroundPrimary" />
            </View>
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
      {renderRightContent()}
      {props.children}
    </AnimatedView>
  );
};

const styles = Steezy.create(({ colors, safeArea }) => ({
  container: {
    position: 'absolute',
    top: 0,
    zIndex: 4,
    backgroundColor: colors.backgroundPrimary,
    justifyContent: 'center',
  },
  rightContent: {
    top: 0,
    right: 0,
    position: 'absolute',
    zIndex: 2,
    minWidth: NavBarHeight,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0,
  },
  backButtonContaner: {
    paddingTop: safeArea.top,
    width: NavBarHeight,
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    position: 'absolute',
    zIndex: 2,
  },
  backButton: {
    background: colors.backgroundSecondary,
    height: 32,
    width: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));