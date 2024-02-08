import { NavBar } from '$uikit';
import { tk } from '$wallet';
import { WalletColor } from '$wallet/WalletTypes';
import { useNavigation } from '@tonkeeper/router';
import { useWallet } from '@tonkeeper/shared/hooks';
import { t } from '@tonkeeper/shared/i18n';
import {
  Button,
  Input,
  Modal,
  Spacer,
  Steezy,
  Text,
  TouchableOpacity,
  View,
  ns,
} from '@tonkeeper/uikit';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';

const COLORS_LIST = Object.values(WalletColor);

const COLOR_ITEM_WIDTH = ns(36) + ns(12);

export const CustomizeWallet = memo(() => {
  const wallet = useWallet();
  const [name, setName] = useState(wallet.config.name);
  const [selectedColor, setSelectedColor] = useState(wallet.config.color);
  const nav = useNavigation();

  const colorsScrollViewRef = useRef<ScrollView>(null);

  const keyboard = useAnimatedKeyboard();
  const [containerWidth, setContainerWidth] = useState(0);

  const keyboardStyle = useAnimatedStyle(() => ({
    height: keyboard.height.value,
  }));

  useEffect(() => {
    if (containerWidth === 0) {
      return;
    }

    console.log('containerWidth', containerWidth);

    const selectedColorIndex = COLORS_LIST.indexOf(selectedColor);

    colorsScrollViewRef.current?.scrollTo({
      x: selectedColorIndex * COLOR_ITEM_WIDTH - containerWidth / 2 + COLOR_ITEM_WIDTH,
      animated: false,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerWidth]);

  const handleSave = useCallback(() => {
    tk.updateWallet({ name, color: selectedColor });
    nav.goBack();
  }, [name, nav, selectedColor]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  return (
    <Modal>
      <NavBar isModal isClosedButton isForceBackIcon hideBackButton />
      <View style={styles.container}>
        <View style={styles.topContainer} onLayout={handleLayout}>
          <Text type="h2" textAlign="center">
            {t('customize_modal.title')}
          </Text>
          <Spacer y={4} />
          <Text type="body1" color="textSecondary" textAlign="center">
            {t('customize_modal.subtitle')}
          </Text>
          <Spacer y={32} />
          <Input
            label={t('customize_modal.wallet_name')}
            defaultValue={name}
            onChangeText={setName}
            autoFocus
          />
        </View>
        <Spacer y={16} />
        <ScrollView
          ref={colorsScrollViewRef}
          horizontal
          contentContainerStyle={styles.colorsContentContainer.static}
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          snapToInterval={COLOR_ITEM_WIDTH}
        >
          {COLORS_LIST.map((color, index) => (
            <React.Fragment key={color}>
              {index > 0 ? <Spacer x={12} /> : null}
              <TouchableOpacity onPress={() => setSelectedColor(color)}>
                <View style={[styles.colorContainer, { backgroundColor: color }]}>
                  {color === selectedColor ? (
                    <View style={styles.selectedColorIndicator} />
                  ) : null}
                </View>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </ScrollView>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={t('customize_modal.save')}
          disabled={name.length === 0}
          onPress={handleSave}
        />
      </View>
      <Animated.View style={keyboardStyle} />
    </Modal>
  );
});

const styles = Steezy.create(({ safeArea, colors }) => ({
  container: { flex: 1 },
  topContainer: {
    paddingHorizontal: 32,
  },
  colorsContentContainer: {
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 32,
  },
  colorContainer: {
    width: 36,
    height: 36,
    borderRadius: 36 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedColorIndicator: {
    width: 30,
    height: 30,
    borderRadius: 30 / 2,
    borderColor: colors.backgroundPage,
    borderWidth: 5,
  },
  buttonContainer: {
    paddingBottom: safeArea.bottom,
    paddingHorizontal: 32,
  },
}));
