import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  View,
  ViewStyle,
  Platform,
} from 'react-native';
import WebView from 'react-native-webview';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@tonkeeper/uikit';

export function processMainButtonMessage(
  parsed: any,
  dispatchMainButton: (value: MainButtonAction) => void,
  dispatchMainButtonResponse: (webRef: React.RefObject<WebView<{}>>) => void,
  webRef: React.MutableRefObject<any>,
) {
  if (
    typeof parsed.data.name === 'string' &&
    (parsed.data.name as string).indexOf('main-button') !== -1
  ) {
    const actionType = parsed.data.name.split('.')[1];

    if (actionType === 'onClick' && typeof parsed.id === 'number') {
      dispatchMainButton({
        type: 'onClick',
        args: { callback: () => dispatchMainButtonResponse(webRef) },
      });
      return true;
    }
    switch (actionType) {
      case 'show':
        dispatchMainButton({ type: 'show' });
        break;
      case 'hide':
        dispatchMainButton({ type: 'hide' });
        break;
      case 'enable':
        dispatchMainButton({ type: 'enable' });
        break;
      case 'disable':
        dispatchMainButton({ type: 'disable' });
        break;
      case 'showProgress':
        dispatchMainButton({ type: 'showProgress' });
        break;
      case 'hideProgress':
        dispatchMainButton({ type: 'hideProgress' });
        break;
      case 'setParams': {
        dispatchMainButton({ type: 'setParams', args: parsed.data.args });
        break;
      }
      case 'offClick': {
        dispatchMainButton({ type: 'offClick' });
        break;
      }
      default:
        console.warn('Invalid main button action type');
    }
    return true;
  }
  return false;
}

export type MainButtonAction =
  | { type: 'showProgress' }
  | { type: 'hideProgress' }
  | { type: 'show' }
  | { type: 'hide' }
  | { type: 'enable' }
  | { type: 'disable' }
  | { type: 'setParams'; args: Omit<MainButtonProps, 'isProgressVisible' | 'onPress'> }
  | { type: 'setText'; ags: { text: string } }
  | { type: 'onClick'; args: { callback?: () => void } }
  | { type: 'offClick' };

export function reduceMainButton() {
  return (mainButtonState: MainButtonProps, action: MainButtonAction) => {
    switch (action.type) {
      case 'showProgress':
        return { ...mainButtonState, isProgressVisible: true };
      case 'hideProgress':
        return { ...mainButtonState, isProgressVisible: false };
      case 'show':
        return { ...mainButtonState, isVisible: true };
      case 'hide':
        return { ...mainButtonState, isVisible: false };
      case 'enable':
        return { ...mainButtonState, isActive: true };
      case 'disable':
        return { ...mainButtonState, isActive: false };
      case 'setParams':
        return { ...mainButtonState, ...action.args };
      case 'setText':
        return { ...mainButtonState, text: action.ags.text };
      case 'onClick':
        return { ...mainButtonState, onPress: action.args.callback };
      case 'offClick':
      default:
        return mainButtonState;
    }
  };
}

export interface MainButton {
  setText: (text: string) => void;
  onClick: (callback: () => void) => void;
  showProgress: (leaveActive: boolean) => void;
  hideProgress: () => void;
  show: () => void;
  hide: () => void;
  enable: () => void;
  disable: () => void;
  setParams: (params: Omit<MainButtonProps, 'isProgressVisible' | 'onPress '>) => void;
}

export type MainButtonProps = {
  text: string;
  textColor: string;
  color: string;
  disabledColor?: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  onPress?: () => void;
};

export const DappMainButton = React.memo(
  (props: { style?: StyleProp<ViewStyle> } & Omit<MainButtonProps, 'isVisible'>) => {
    const theme = useTheme();
    const bgColor = useDerivedValue(() => {
      return withTiming(
        props.isProgressVisible
          ? theme.buttonPrimaryBackground
          : props.isActive
          ? props.color
          : props.disabledColor ?? theme.buttonPrimaryBackground,
      );
    }, [props.color, props.disabledColor, props.isActive, theme]);

    const textColor = useDerivedValue(() => {
      return withTiming(
        props.isProgressVisible ? theme.buttonPrimaryForeground : props.textColor,
      );
    }, [props.textColor, theme]);

    const animatedBgStyle = useAnimatedStyle(() => {
      return { backgroundColor: bgColor.value };
    });

    const animatedTextColorStyle = useAnimatedStyle(() => {
      return { color: textColor.value };
    });

    return (
      <Pressable
        disabled={!props.isActive}
        style={(p) => [
          {
            borderRadius: 14,
            overflow: 'hidden',
          },
          p.pressed && {
            opacity: 0.55,
          },
          props.style,
        ]}
        onPress={props.onPress}
      >
        {(p) => (
          <Animated.View
            style={[
              {
                height: 56 - 2,
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 64,
                paddingHorizontal: 16,
              },
              animatedBgStyle,
            ]}
          >
            {props.isProgressVisible && (
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  top: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ActivityIndicator color={props.textColor} size="small" />
              </View>
            )}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Animated.Text
                  style={[
                    {
                      marginTop: Platform.OS === 'ios' ? 0 : -1,
                      opacity: (props.isProgressVisible ? 0 : 1) * (p.pressed ? 0.55 : 1),
                      fontSize: 17,
                      fontWeight: '600',
                      includeFontPadding: false,
                    },
                    animatedTextColorStyle,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {props.text}
                </Animated.Text>
              </View>
            </View>
          </Animated.View>
        )}
      </Pressable>
    );
  },
);
