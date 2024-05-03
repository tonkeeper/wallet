import {
  ScreenHeaderTypes,
  ScreenScrollContext,
  useScreenScrollHandler,
} from './hooks/useScreenScroll';
import React, { isValidElement, memo, useMemo } from 'react';
import { ScreenLargeHeader } from './ScreenLargeHeader';
import { ScreenHeader } from './ScreenHeader';
import { KeyboardAvoidingContainer } from './KeyboardAvoidingContainer';
import { Steezy } from '../../styles';
import { View } from '../../components/View';

interface Props {
  children: React.ReactNode;
  keyboardAvoiding?: boolean;
  alternateBackground?: boolean;
}

export const Screen = memo<Props>((props) => {
  const headerType = useMemo(() => {
    return React.Children.toArray(props.children).reduce<ScreenHeaderTypes>(
      (type, child) => {
        if (isValidElement(child)) {
          if (child.type === ScreenLargeHeader) {
            type = 'large';
          } else if (child.type === ScreenHeader) {
            type = 'normal';
          }
        }

        return type;
      },
      'none',
    );
  }, [props.children]);

  const screenScroll = useScreenScrollHandler(headerType);

  return (
    <ScreenScrollContext.Provider value={screenScroll}>
      {props.keyboardAvoiding ? (
        <KeyboardAvoidingContainer>
          <View
            style={[
              styles.container,
              props.alternateBackground && styles.alternateBackground,
            ]}
          >
            {props.children}
          </View>
        </KeyboardAvoidingContainer>
      ) : (
        <View
          style={[
            styles.container,
            props.alternateBackground && styles.alternateBackground,
          ]}
        >
          {props.children}
        </View>
      )}
    </ScreenScrollContext.Provider>
  );
});

const styles = Steezy.create(({ colors }) => ({
  container: {
    flex: 1,
  },
  alternateBackground: {
    backgroundColor: colors.backgroundPageAlternate,
  },
}));
