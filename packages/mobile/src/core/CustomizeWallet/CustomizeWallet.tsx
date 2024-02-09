import { walletActions, walletGeneratedVaultSelector } from '$store/wallet';
import { NavBar } from '$uikit';
import { tk } from '$wallet';
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
  WalletColor,
  getWalletColorHex,
  ns,
  useReanimatedKeyboardHeight,
} from '@tonkeeper/uikit';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const COLORS_LIST = Object.values(WalletColor);

const COLOR_ITEM_WIDTH = ns(36) + ns(12);

export const CustomizeWallet = memo(() => {
  const generatedVault = useSelector(walletGeneratedVaultSelector);
  const versions = generatedVault?.versions ?? [];
  const allAddedVersions = versions.length > 1;
  const dispatch = useDispatch();

  const wallet = useWallet();
  const [name, setName] = useState(allAddedVersions ? 'Wallet' : wallet.config.name);
  const [selectedColor, setSelectedColor] = useState(wallet.config.color);
  const nav = useNavigation();

  const colorsScrollViewRef = useRef<ScrollView>(null);

  const { spacerStyle } = useReanimatedKeyboardHeight();

  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (containerWidth === 0) {
      return;
    }

    const selectedColorIndex = COLORS_LIST.indexOf(selectedColor);

    colorsScrollViewRef.current?.scrollTo({
      x: selectedColorIndex * COLOR_ITEM_WIDTH - containerWidth / 2 + COLOR_ITEM_WIDTH,
      animated: false,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerWidth]);

  const handleSave = useCallback(() => {
    tk.updateWallet({ name: name.trim(), color: selectedColor }, allAddedVersions);
    nav.goBack();
  }, [allAddedVersions, name, nav, selectedColor]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  useEffect(() => {
    return () => {
      dispatch(walletActions.clearGeneratedVault());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            autoComplete="off"
            textContentType="none"
            autoCorrect={false}
            spellCheck={false}
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
                <View
                  style={[
                    styles.colorContainer,
                    { backgroundColor: getWalletColorHex(color) },
                  ]}
                >
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
      <Animated.View style={spacerStyle} />
      <SafeAreaView edges={['bottom']} />
    </Modal>
  );
});

const styles = Steezy.create(({ colors }) => ({
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
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
}));
