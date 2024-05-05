import { ViewStyle } from 'react-native';
import { FC, ReactNode, memo, useMemo } from 'react';
import { WithStyleProp } from '@bogoslavskiy/react-native-steezy';
import { Steezy, useTheme } from '../../styles';
import { View } from '../../components/View';
import { LinearGradient } from 'expo-linear-gradient';
import { KeyboardAvoidingContainer } from './KeyboardAvoidingContainer';
import { convertHexToRGBA } from '@tonkeeper/mobile/src/utils';

interface Props extends WithStyleProp<ViewStyle> {
  children: ReactNode;
  keyboardAvoiding?: boolean;
}

export const ScreenButtonContainer: FC<Props> = memo(
  ({ children, style, keyboardAvoiding, ...props }) => {
    const theme = useTheme();

    const childrenView = useMemo(
      () => (
        <View style={[styles.buttonContainer, style]} {...props}>
          {children}
        </View>
      ),
      [children, props, style],
    );

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[convertHexToRGBA(theme.backgroundPage, 0), theme.backgroundPage]}
          locations={[0, 1]}
          style={styles.buttonGradient.static}
          pointerEvents="none"
        />
        {keyboardAvoiding ? (
          <KeyboardAvoidingContainer>{childrenView}</KeyboardAvoidingContainer>
        ) : (
          childrenView
        )}
        <View style={styles.safeArea} />
      </View>
    );
  },
);

const styles = Steezy.create(({ safeArea }) => ({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  buttonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    paddingTop: 16,
  },
  safeArea: {
    height: safeArea.bottom,
  },
  buttonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
}));
