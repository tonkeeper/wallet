import React, { memo, useCallback } from 'react';
import {
  Button,
  Icon,
  Spacer,
  Steezy,
  Text,
  TouchableOpacity,
  View,
} from '@tonkeeper/uikit';
import { LayoutAnimation, Animated } from 'react-native';
import { useNavigation } from '@tonkeeper/router';
import { MainStackRouteNames } from '$navigation';
import { useHoldersEnroll } from '../../../screens/HoldersWebView/hooks/useHoldersEnroll';
import { useUnlockVault } from '$core/ModalContainer/NFTOperations/useUnlockVault';

const closeButtonHitSlop = {
  top: 8,
  left: 8,
  right: 8,
  bottom: 8,
};

export interface OnboardBannerProps {
  onDismissBanner: () => void;
}

export const OnboardBanner = memo<OnboardBannerProps>((props) => {
  const containerStyle = Steezy.useStyle(styles.container);
  const nav = useNavigation();
  const unlockVault = useUnlockVault();
  const enroll = useHoldersEnroll(unlockVault);

  const handleCloseBanner = useCallback(() => {
    props.onDismissBanner();
    LayoutAnimation.easeInEaseOut();
  }, [props]);

  const openWebView = useCallback(() => {
    enroll(() => nav.push(MainStackRouteNames.HoldersWebView, { path: '/create' }));
  }, [enroll, nav]);

  return (
    <Animated.View style={containerStyle}>
      <View style={styles.rowContainer}>
        <Icon style={styles.cardsIcon.static} colorless name={'ic-cards-stack-44'} />
        <View style={styles.flex}>
          <Text type="label1">Bank Card</Text>
          <Text color="textSecondary" type="body2">
            Pay in TON, convert to USD without commission.
          </Text>
          <Spacer y={12} />
          <Button
            onPress={openWebView}
            size="small"
            color="tertiary"
            title="More Details"
          />
        </View>
        <TouchableOpacity onPress={handleCloseBanner} hitSlop={closeButtonHitSlop}>
          <Icon color={'iconTertiary'} name={'ic-close-16'} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

const styles = Steezy.create(({ corners, colors }) => ({
  container: {
    borderRadius: corners.medium,
    padding: 16,
    backgroundColor: colors.backgroundContent,
    marginBottom: 32,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  cardsIcon: {
    marginTop: 10,
  },
  flex: {
    flex: 1,
  },
}));
