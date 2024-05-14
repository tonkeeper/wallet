import { NavBar } from '$uikit';
import { tk } from '$wallet';
import { useNavigation } from '@tonkeeper/router';
import { useWallet } from '@tonkeeper/shared/hooks';
import { t } from '@tonkeeper/shared/i18n';
import {
  Button,
  Haptics,
  Input,
  Modal,
  Spacer,
  Steezy,
  Text,
  TouchableOpacity,
  View,
  WalletColor,
  WalletIcon,
  getWalletColorHex,
  isAndroid,
  ns,
  useReanimatedKeyboardHeight,
  useTheme,
} from '@tonkeeper/uikit';
import React, {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Keyboard, LayoutChangeEvent } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { EmojiPicker } from './EmojiPicker';
import { BottomButtonWrapHelper } from '$shared/components';
import LinearGradient from 'react-native-linear-gradient';
import { RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '$navigation/AppStack';
import { AppStackRouteNames } from '$navigation';
import { convertHexToRGBA } from '$utils';
import { useThemeName } from '$hooks/useThemeName';

const COLORS_LIST = Object.values(WalletColor);

const COLOR_ITEM_WIDTH = ns(36) + ns(12);

interface Props {
  route: RouteProp<AppStackParamList, AppStackRouteNames.CustomizeWallet>;
}

export const CustomizeWallet: FC<Props> = memo((props) => {
  const identifiers = useMemo(
    () => props.route?.params?.identifiers ?? [tk.wallet.identifier],
    [props],
  );

  const wallet = useWallet();
  const nav = useNavigation();
  const theme = useTheme();
  const themeName = useThemeName();

  const [name, setName] = useState(
    identifiers.length > 1
      ? wallet.isLedger
        ? wallet.config.ledger!.deviceModel
        : wallet.config.name.slice(0, -5)
      : wallet.config.name,
  );
  const [selectedColor, setSelectedColor] = useState(wallet.config.color);
  const [emoji, setEmoji] = useState(wallet.config.emoji);
  const [keyboardShown, setKeyboardShown] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const colorsScrollViewRef = useRef<ScrollView>(null);

  const { spacerStyle } = useReanimatedKeyboardHeight();

  const handleSave = useCallback(() => {
    tk.updateWallet({ name: name.trim(), color: selectedColor, emoji }, identifiers);
    nav.goBack();
  }, [emoji, identifiers, name, nav, selectedColor]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  const handleEmojiChange = useCallback((value: string) => {
    Haptics.selection();
    setEmoji(value);
  }, []);

  const handleChangeColor = useCallback((color: WalletColor) => {
    Haptics.selection();
    setSelectedColor(color);
  }, []);

  const pickersAnimatedStyles = useAnimatedStyle(
    () => ({
      opacity: withTiming(keyboardShown ? 0.32 : 1, { duration: 200 }),
    }),
    [keyboardShown],
  );

  useEffect(() => {
    if (containerWidth === 0) {
      return;
    }

    const selectedColorIndex = COLORS_LIST.indexOf(selectedColor);

    colorsScrollViewRef.current?.scrollTo({
      x: (selectedColorIndex - 3) * COLOR_ITEM_WIDTH,
      animated: false,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerWidth]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      isAndroid ? 'keyboardDidShow' : 'keyboardWillShow',
      () => {
        setKeyboardShown(true);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      isAndroid ? 'keyboardDidHide' : 'keyboardWillHide',
      () => {
        setKeyboardShown(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <Modal blurOnBackgroundPress alternateBackground>
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
          <View style={styles.inputContainer}>
            <Input
              label={t('customize_modal.wallet_name')}
              defaultValue={name}
              onChangeText={setName}
              autoComplete="off"
              textContentType="none"
              autoCorrect={false}
              spellCheck={false}
              maxLength={24}
              style={styles.inputStyle.static}
            />
            <View style={styles.rightContent} pointerEvents="none">
              <View
                style={[
                  styles.emojiContainer,
                  { backgroundColor: getWalletColorHex(selectedColor, themeName) },
                ]}
              >
                <WalletIcon
                  emojiStyle={styles.emoji.static}
                  size={28}
                  value={emoji}
                  color="constantWhite"
                />
              </View>
            </View>
          </View>
        </View>
        <Spacer y={16} />
        <Animated.View style={[styles.pickersContainer.static, pickersAnimatedStyles]}>
          <View>
            <ScrollView
              ref={colorsScrollViewRef}
              horizontal
              contentContainerStyle={styles.colorsContentContainer.static}
              showsHorizontalScrollIndicator={false}
              snapToInterval={COLOR_ITEM_WIDTH}
            >
              {COLORS_LIST.map((color, index) => (
                <React.Fragment key={color}>
                  {index > 0 ? <Spacer x={12} /> : null}
                  <TouchableOpacity
                    onPress={() => handleChangeColor(color)}
                    activeOpacity={0.5}
                  >
                    <View
                      style={[
                        styles.colorContainer,
                        { backgroundColor: getWalletColorHex(color, themeName) },
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
          <EmojiPicker onChange={handleEmojiChange} />
        </Animated.View>
        <BottomButtonWrapHelper />
      </View>
      <View style={styles.buttonContainer}>
        <LinearGradient
          colors={[
            convertHexToRGBA(theme.backgroundPageAlternate, 0),
            theme.backgroundPageAlternate,
          ]}
          locations={[0, 1]}
          style={styles.buttonGradient.static}
          pointerEvents="none"
        />
        <Button
          title={t('customize_modal.save')}
          disabled={name.length === 0}
          onPress={handleSave}
        />
        <Animated.View style={spacerStyle} />
      </View>
    </Modal>
  );
});

const styles = Steezy.create(({ colors, safeArea, corners }) => ({
  container: { flex: 1 },
  topContainer: {
    paddingTop: 16,
    paddingHorizontal: 32,
  },
  inputContainer: {
    position: 'relative',
  },
  inputStyle: {
    marginRight: 48,
  },
  rightContent: {
    position: 'absolute',
    top: 0,
    right: 8,
    bottom: 0,
    justifyContent: 'center',
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: corners.extraSmall,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: isAndroid ? 26 : 28,
    marginLeft: isAndroid ? 0 : 2,
    marginTop: isAndroid ? -1 : 1,
  },
  pickersContainer: { flex: 1 },
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
    borderColor: colors.backgroundPageAlternate,
    borderWidth: 5,
  },
  buttonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 32,
    paddingBottom: 32,
    marginBottom: safeArea.bottom,
  },
  buttonGradient: {
    position: 'absolute',
    top: -16,
    left: 0,
    right: 0,
    height: 104,
  },
}));
