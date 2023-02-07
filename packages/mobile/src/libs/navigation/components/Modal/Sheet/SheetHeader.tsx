import React from 'react';
import { View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSheetInternal } from './SheetsProvider';
import { Opacity } from '$shared/constants';
import styled, { RADIUS } from '$styled';
import { Icon, Text } from '$uikit';
import { useTheme } from '$hooks';
import { ns } from '$utils';

export interface SheetHeaderProps {
  title?: string;
  gradient?: boolean;
}

export const SheetHeader = React.memo<SheetHeaderProps>((props) => {
  const { gradient, title } = props;
  const { measureHeader, close } = useSheetInternal();
  const theme = useTheme();
  
  const hasTitle = !!title;

  React.useLayoutEffect(() => {
    if (hasTitle) {
      measureHeader({
        nativeEvent: {
          layout: { height: ns(64) }
        }
      });
    }
  }, [hasTitle]);

  return (
    <Wrap absolute={!hasTitle}>
      {gradient && (
        <Gradient 
          colors={[theme.colors.backgroundPrimary, 'rgba(16, 22, 31, 0)']} 
          locations={[0, 1]}
        />
      )}
      <View style={{ flexDirection: 'row', flex: 1 }}>
        {hasTitle && (
          <HeaderTitle>
            <Text variant="h3">
              {title}
            </Text>
          </HeaderTitle>
        )}

        <View style={{ flex: 1 }} />
        
        <HeaderCloseButtonWrap onPress={close}>
          <HeaderCloseButton>
            <Icon
              name="ic-close-16"
              color="foregroundPrimary"
            />
          </HeaderCloseButton>
        </HeaderCloseButtonWrap>
      </View>
    </Wrap>
  );
});

export const Gradient = styled(LinearGradient)`
  position: absolute;
  top: 0;
  width: 100%;
  height: ${ns(46)}px;
  border-top-left-radius: ${ns(RADIUS.normal)}px;
  border-top-right-radius: ${ns(RADIUS.normal)}px; 
`;

export const HeaderCloseButtonWrap = styled.TouchableOpacity.attrs({
  activeOpacity: Opacity.ForSmall,
})`
  width: ${ns(64)}px;
  height: ${ns(64)}px;
  align-items: center;
  justify-content: center;
`;

export const Wrap = styled.View<{ absolute: boolean }>`
  height: ${ns(64)}px;
  ${({ absolute }) => 
    absolute 
      ? `
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        z-index: 3;
      `
      : null
  }
`;

export const HeaderCloseButton = styled.View`
  width: ${ns(32)}px;
  height: ${ns(32)}px;
  border-radius: ${ns(32 / 2)}px;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;

export const HeaderTitle = styled.View`
  padding-horizontal: ${ns(16)}px;
  justify-content: center;
`;