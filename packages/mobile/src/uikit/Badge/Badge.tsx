import React from 'react';
import { Text } from '../Text/Text';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '$hooks/useTheme';
import { ns } from '$utils';

interface BadgeProps {
  style?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = (props) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { borderColor: theme.colors.backgroundTertiary },
        props.style,
      ]}
    >
      <Text fontSize={10} lineHeight={14} fontWeight="600" color={'foregroundSecondary'}>
        {props.children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: ns(6),
    borderWidth: ns(1),
    paddingHorizontal: ns(6),
    paddingTop: ns(3.5),
    paddingBottom: ns(4.5),
    height: ns(22),
    alignItems: 'center',
  },
});
